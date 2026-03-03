import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Leaf } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-darkBg/80 backdrop-blur-md py-4 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <Leaf className="text-neonGreen group-hover:text-accentGreen transition-colors" size={28} />
                        <span className="text-xl font-display font-bold tracking-wider text-white">
                            CONNECT<span className="text-neonGreen">GREEN</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/planner" className="text-stone-300 hover:text-neonGreen transition-colors font-medium">Trip Planner</Link>
                        <Link to="/businesses" className="text-stone-300 hover:text-neonGreen transition-colors font-medium">Businesses</Link>
                        <Link to="/sites" className="text-stone-300 hover:text-neonGreen transition-colors font-medium">Nature Sites</Link>
                        <Link to="/offset" className="text-stone-300 hover:text-neonGreen transition-colors font-medium flex items-center gap-1"><Leaf size={14} className="text-neonGreen" /> Offset</Link>
                        <Link to="/recycling" className="text-stone-300 hover:text-neonGreen transition-colors font-medium">Recycling</Link>
                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/dashboard" className="text-sm text-neonGreen font-semibold hover:text-accentGreen">
                                    {user.name} ({user.role})
                                </Link>
                                <button onClick={handleLogout} className="px-5 py-2 rounded font-semibold transition-all border border-neonGreen/50 text-white hover:bg-neonGreen/10">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/login" className="px-5 py-2 rounded font-semibold transition-all border border-neonGreen text-white hover:bg-neonGreen/10">
                                    Login
                                </Link>
                                <Link to="/register" className="px-5 py-2 rounded font-semibold transition-all bg-neonGreen text-darkBg hover:bg-accentGreen shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:text-neonGreen transition-colors">
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-deepCard border-b border-neonGreen/30 shadow-xl py-4 flex flex-col items-center gap-4">
                    <Link to="/planner" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-neonGreen text-lg">Trip Planner</Link>
                    <Link to="/businesses" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-neonGreen text-lg">Businesses</Link>
                    <Link to="/sites" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-neonGreen text-lg">Nature Sites</Link>
                    <Link to="/offset" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-neonGreen text-lg flex items-center gap-1"><Leaf size={16} className="text-neonGreen" /> Carbon Offset</Link>
                    <Link to="/recycling" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-neonGreen text-lg">Recycle Map</Link>
                    <div className="w-4/5 h-px bg-neonGreen/20 my-2"></div>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-neonGreen text-lg">Dashboard</Link>
                            <button onClick={handleLogout} className="text-white text-lg">Logout</button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 w-4/5">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-5 py-3 rounded border border-neonGreen text-white">Login</Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-5 py-3 rounded bg-neonGreen text-darkBg font-bold">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
