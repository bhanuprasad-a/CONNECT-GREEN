import { Link } from 'react-router-dom';
import { Leaf, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-darkBg border-t border-neonGreen pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <Leaf className="text-neonGreen" size={24} />
                            <span className="text-xl font-display font-bold tracking-wider text-white">
                                CONNECT<span className="text-neonGreen">GREEN</span>
                            </span>
                        </Link>
                        <p className="text-stone-400 text-sm leading-relaxed mb-6">
                            A smart web platform for sustainable tourism. Empowering eco-conscious travelers and verifying green businesses globally.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-stone-400 hover:text-neonGreen transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-stone-400 hover:text-neonGreen transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-stone-400 hover:text-neonGreen transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Navigation</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Home</Link></li>
                            <li><Link to="/planner" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Trip Planner</Link></li>
                            <li><Link to="/businesses" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Green Directory</Link></li>
                            <li><Link to="/sites" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Nature Sites</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Resources</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">About Us</Link></li>
                            <li><Link to="/badge-info" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Green Badge System</Link></li>
                            <li><Link to="/impact" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Carbon Impact Report</Link></li>
                            <li><Link to="/contact" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Legal & Connect</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-stone-400 hover:text-neonGreen transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link to="/register" className="text-neonGreen font-semibold hover:text-accentGreen transition-colors text-sm mt-4 block">Partner With Us &rarr;</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-stone-500 text-xs text-center md:text-left">
                        &copy; {new Date().getFullYear()} CONNECT GREEN. College Project - Green Technologies. Built by Arya.
                    </p>
                    <p className="text-stone-500 text-xs text-center md:text-right">
                        Designed & Developed with MERN Stack
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
