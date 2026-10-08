import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy-loaded Page Imports for fast initial load & reduced bundle latency
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const Businesses = lazy(() => import('./pages/Businesses'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NatureSites = lazy(() => import('./pages/NatureSites'));
const BusinessDetails = lazy(() => import('./pages/BusinessDetails'));
const RecyclingLocator = lazy(() => import('./pages/RecyclingLocator'));
const SiteManagerApply = lazy(() => import('./pages/SiteManagerApply'));
const CarbonOffset = lazy(() => import('./pages/CarbonOffset'));

// Sleek loading skeleton for route transitions
const PageLoader = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-neonGreen/20 border-t-neonGreen rounded-full animate-spin"></div>
        <span className="text-stone-400 text-sm font-medium tracking-wide">Loading...</span>
    </div>
);

const NotFound = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white">Page not found</h1>
        <Link to="/" className="text-neonGreen underline underline-offset-4">Return home</Link>
    </div>
);

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
                        <Suspense fallback={<PageLoader />}>
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
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </main>

                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
