import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TripPlanner from './pages/TripPlanner';
import Businesses from './pages/Businesses';
import Dashboard from './pages/Dashboard';
import NatureSites from './pages/NatureSites';
import BusinessDetails from './pages/BusinessDetails';
import RecyclingLocator from './pages/RecyclingLocator';
import SiteManagerApply from './pages/SiteManagerApply';
import CarbonOffset from './pages/CarbonOffset';

// Placeholder Pages (To be built in Phase 5)
const DashboardPlaceholder = () => <div className="min-h-screen pt-32 pb-20 px-4 text-center"><h2 className="text-4xl font-display text-neonGreen font-bold">User Dashboard</h2></div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-darkBg min-h-screen text-white font-body selection:bg-neonGreen selection:text-darkBg">
                    <Toaster position="bottom-right" toastOptions={{
                        className: 'bg-deepCard border border-stone-800 text-white shadow-xl',
                        style: { background: '#111', color: '#fff', border: '1px solid #22C55E' }
                    }} />

                    <Navbar />

                    <main className="pt-[65px]">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/planner" element={<TripPlanner />} />
                            <Route path="/businesses" element={<Businesses />} />
                            <Route path="/businesses/:id" element={<BusinessDetails />} />
                            <Route path="/sites" element={<NatureSites />} />
                            <Route path="/recycling" element={<RecyclingLocator />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/apply-site-manager" element={<SiteManagerApply />} />
                            <Route path="/offset" element={<CarbonOffset />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
