import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Leaf } from 'lucide-react';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data, res.data.token);
            toast.success('Successfully logged in!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-darkBg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.1)_0%,transparent_50%)]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link justify-center="true" to="/" className="flex items-center gap-2 mb-4 group justify-center">
                    <Leaf className="text-neonGreen" size={32} />
                    <span className="text-2xl font-display font-bold tracking-wider text-white">
                        CONNECT<span className="text-neonGreen">GREEN</span>
                    </span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-display font-bold text-white">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-stone-400">
                    Or{' '}
                    <Link to="/register" className="font-medium text-neonGreen hover:text-accentGreen">
                        create a new green account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-deepCard py-8 px-4 border border-stone-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <InputField
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <InputField
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div>
                            <PrimaryButton type="submit" className="w-full">
                                Sign in
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
