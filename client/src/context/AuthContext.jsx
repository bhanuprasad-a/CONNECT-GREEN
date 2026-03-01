import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load: check for token in localStorage
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Set default axios header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Attempt to fetch current user data using token
                    const res = await axios.get('http://localhost:5000/api/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
