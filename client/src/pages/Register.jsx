import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Leaf } from 'lucide-react';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import api from '../api/axios'; // Make sure the path is correct

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'tourist'
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data, res.data.token);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-stone-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-neonGreen hover:text-accentGreen">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-deepCard py-8 px-4 border border-stone-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <InputField
                            label="Full Name"
                            name="name"
                            required
                            value={name}
                            onChange={onChange}
                        />

                        <InputField
                            label="Email address"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={onChange}
                        />

                        <InputField
                            label="Password"
                            type="password"
                            name="password"
                            required
                            minLength="6"
                            value={password}
                            onChange={onChange}
                        />

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">I am signing up as a:</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {['tourist', 'business', 'siteManager', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r })}
                                        className={`py-2 text-xs font-semibold rounded border transition-colors ${role === r ? 'bg-neonGreen/20 border-neonGreen text-neonGreen' : 'bg-darkBg border-stone-700 text-stone-400 hover:border-stone-500'
                                            }`}
                                    >
                                        {r.charAt(0).toUpperCase() + r.slice(1).replace('Manager', ' Manager')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <PrimaryButton type="submit" className="w-full">
                                Register Account
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
