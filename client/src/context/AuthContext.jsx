import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('user');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    // If we have cached user, don't block the UI with initial loading state
    const [loading, setLoading] = useState(() => !localStorage.getItem('user') && !!localStorage.getItem('token'));

    // Initial load: validate token and refresh profile in background
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch {
                    logout();
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
