import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, ScaleControl, GeolocateControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
    Recycle, MapPin, Navigation, Clock, ChevronRight,
    X, Search, SlidersHorizontal, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

/* ─────────────────────── CONFIG ─────────────────────── */
const NAV_HEIGHT = 65;
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const DEFAULT_VIEW = { longitude: 78.9629, latitude: 20.5937, zoom: 4.5 };

const WASTE_TYPES = ['Plastic', 'E-Waste', 'Glass', 'Paper', 'Batteries', 'Metal', 'Organic', 'Cardboard'];

/* ── Waste type color mapping ── */
const WASTE_COLORS = {
    'Plastic': '#22c55e',
    'E-Waste': '#3b82f6',
    'Glass': '#06b6d4',
    'Paper': '#a3e635',
    'Batteries': '#f59e0b',
    'Metal': '#94a3b8',
    'Organic': '#84cc16',
    'Cardboard': '#d97706',
};

/* ─────────────────────── RICH SEED DATA (India-focused) ─────────────────────── */
const SEED_CENTERS = [
    // Hyderabad
    { id: 's1', name: 'Greenway Recycler HYD', lat: 17.3850, lng: 78.4867, address: 'Banjara Hills, Hyderabad', acceptedWaste: ['Plastic', 'Glass', 'Paper', 'Cardboard'], isOpen: true, operatingHours: { open: '08:00', close: '19:00' }, distance: null },
    { id: 's2', name: 'TechCycle Hyderabad', lat: 17.4410, lng: 78.3489, address: 'Madhapur, Hyderabad', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, distance: null },
    { id: 's3', name: 'Jubilee Eco Hub', lat: 17.4326, lng: 78.4072, address: 'Jubilee Hills, Hyderabad', acceptedWaste: ['Plastic', 'Organic', 'Paper'], isOpen: false, operatingHours: { open: '07:30', close: '16:00' }, distance: null },
    { id: 's4', name: 'Secunderabad Drop-Off', lat: 17.4352, lng: 78.5012, address: 'Secunderabad, Hyderabad', acceptedWaste: ['Batteries', 'E-Waste', 'Metal'], isOpen: true, operatingHours: { open: '10:00', close: '20:00' }, distance: null },
    // Delhi
    { id: 's5', name: 'Delhi Eco Center', lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi', acceptedWaste: ['Plastic', 'Paper', 'Glass', 'Cardboard'], isOpen: true, operatingHours: { open: '08:00', close: '20:00' }, distance: null },
    { id: 's6', name: 'E-Waste Delhi Hub', lat: 28.6562, lng: 77.2410, address: 'Karol Bagh, New Delhi', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, distance: null },
    { id: 's7', name: 'Dwarka Green Drop HQ', lat: 28.5921, lng: 77.0460, address: 'Sector 10, Dwarka, Delhi', acceptedWaste: ['Plastic', 'Organic', 'Glass'], isOpen: false, operatingHours: { open: '06:00', close: '14:00' }, distance: null },
    // Mumbai
    { id: 's8', name: 'Mumbai Circular Economy Hub', lat: 19.0760, lng: 72.8777, address: 'Lower Parel, Mumbai', acceptedWaste: ['Plastic', 'Metal', 'Glass', 'Paper'], isOpen: true, operatingHours: { open: '07:00', close: '21:00' }, distance: null },
    { id: 's9', name: 'BKC E-Recycle Center', lat: 19.0596, lng: 72.8656, address: 'Bandra Kurla Complex, Mumbai', acceptedWaste: ['E-Waste', 'Batteries'], isOpen: true, operatingHours: { open: '09:30', close: '17:30' }, distance: null },
    { id: 's10', name: 'Dharavi Materials Recovery', lat: 19.0426, lng: 72.8545, address: 'Dharavi, Mumbai', acceptedWaste: ['Plastic', 'Metal', 'Cardboard', 'Glass'], isOpen: true, operatingHours: { open: '06:00', close: '22:00' }, distance: null },
    // Bangalore
    { id: 's11', name: 'Hasiru Dala Bangalore', lat: 12.9716, lng: 77.5946, address: 'Koramangala, Bengaluru', acceptedWaste: ['Organic', 'Plastic', 'Paper'], isOpen: true, operatingHours: { open: '08:00', close: '18:00' }, distance: null },
    { id: 's12', name: 'Whitefield Recycling Point', lat: 12.9698, lng: 77.7500, address: 'Whitefield, Bengaluru', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '10:00', close: '19:00' }, distance: null },
    { id: 's13', name: 'HSR Layout Drop Station', lat: 12.9116, lng: 77.6389, address: 'HSR Layout, Bengaluru', acceptedWaste: ['Plastic', 'Glass', 'Cardboard'], isOpen: false, operatingHours: { open: '07:00', close: '15:00' }, distance: null },
    // Chennai
    { id: 's14', name: 'Chennai Clean Initiative', lat: 13.0827, lng: 80.2707, address: 'T. Nagar, Chennai', acceptedWaste: ['Plastic', 'Paper', 'Organic'], isOpen: true, operatingHours: { open: '08:30', close: '17:30' }, distance: null },
    { id: 's15', name: 'OMR Tech Recycle', lat: 12.9010, lng: 80.2279, address: 'Old Mahabalipuram Rd, Chennai', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, distance: null },
    // Pune
    { id: 's16', name: 'Pune Green Drop Hub', lat: 18.5204, lng: 73.8567, address: 'Shivajinagar, Pune', acceptedWaste: ['Plastic', 'Glass', 'Paper', 'Metal'], isOpen: true, operatingHours: { open: '07:00', close: '20:00' }, distance: null },
    { id: 's17', name: 'Hinjewadi Eco Station', lat: 18.5912, lng: 73.7389, address: 'Hinjewadi IT Park, Pune', acceptedWaste: ['E-Waste', 'Batteries', 'Cardboard'], isOpen: false, operatingHours: { open: '09:00', close: '17:00' }, distance: null },
    // Kolkata
    { id: 's18', name: 'Kolkata Waste Exchange', lat: 22.5726, lng: 88.3639, address: 'Salt Lake City, Kolkata', acceptedWaste: ['Plastic', 'paper', 'Organic', 'Glass'], isOpen: true, operatingHours: { open: '08:00', close: '19:00' }, distance: null },
    { id: 's19', name: 'Park Street E-Center', lat: 22.5530, lng: 88.3530, address: 'Park Street, Kolkata', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '10:00', close: '18:00' }, distance: null },
    // Ahmedabad
    { id: 's20', name: 'Ahmedabad Eco Drop', lat: 23.0225, lng: 72.5714, address: 'Navrangpura, Ahmedabad', acceptedWaste: ['Plastic', 'Metal', 'Cardboard'], isOpen: true, operatingHours: { open: '07:30', close: '18:30' }, distance: null },

    // Vijayawada (Andhra Pradesh)
    { id: 'v1', name: 'Vijayawada Green Drop Hub', lat: 16.5062, lng: 80.6480, address: 'Governorpet, Vijayawada', acceptedWaste: ['Plastic', 'Paper', 'Glass', 'Cardboard'], isOpen: true, operatingHours: { open: '07:00', close: '19:00' }, distance: null },
    { id: 'v2', name: 'Benz Circle E-Recycle', lat: 16.5193, lng: 80.6305, address: 'Benz Circle, Vijayawada', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, distance: null },
    { id: 'v3', name: 'Patamata EcoRecycler', lat: 16.5002, lng: 80.6622, address: 'Patamata, Vijayawada', acceptedWaste: ['Plastic', 'Organic', 'Glass'], isOpen: false, operatingHours: { open: '08:00', close: '15:00' }, distance: null },
    { id: 'v4', name: 'Siddhartha Nagar Waste Hub', lat: 16.5161, lng: 80.6558, address: 'Siddhartha Nagar, Vijayawada', acceptedWaste: ['Metal', 'Cardboard', 'Paper'], isOpen: true, operatingHours: { open: '06:30', close: '21:00' }, distance: null },
    { id: 'v5', name: 'AG Colony Clean Centre', lat: 16.5302, lng: 80.6200, address: 'AG Colony, Vijayawada', acceptedWaste: ['E-Waste', 'Batteries', 'Plastic'], isOpen: true, operatingHours: { open: '10:00', close: '20:00' }, distance: null },

    // Guntur (Andhra Pradesh)
    { id: 'g1', name: 'Guntur EcoSort Station', lat: 16.3067, lng: 80.4365, address: 'Arundalpet, Guntur', acceptedWaste: ['Plastic', 'Glass', 'Paper', 'Organic'], isOpen: true, operatingHours: { open: '07:30', close: '18:30' }, distance: null },
    { id: 'g2', name: 'Brodipet TechCycle', lat: 16.3028, lng: 80.4510, address: 'Brodipet, Guntur', acceptedWaste: ['E-Waste', 'Batteries', 'Metal'], isOpen: true, operatingHours: { open: '09:00', close: '17:30' }, distance: null },
    { id: 'g3', name: 'Naaz Centre Eco Drop', lat: 16.3090, lng: 80.4280, address: 'Naaz Centre, Guntur', acceptedWaste: ['Plastic', 'Cardboard', 'Paper'], isOpen: false, operatingHours: { open: '08:00', close: '14:00' }, distance: null },
    { id: 'g4', name: 'Guntur Metal & Glass Hub', lat: 16.2997, lng: 80.4600, address: 'Kothapet, Guntur', acceptedWaste: ['Metal', 'Glass', 'Batteries'], isOpen: true, operatingHours: { open: '06:00', close: '20:00' }, distance: null },
    { id: 'g5', name: 'Pattabhipuram Recycle Point', lat: 16.3150, lng: 80.4420, address: 'Pattabhipuram, Guntur', acceptedWaste: ['Organic', 'Plastic', 'Paper', 'Glass'], isOpen: true, operatingHours: { open: '08:00', close: '19:00' }, distance: null },
];

/* ─────────────────────── HELPERS ─────────────────────── */
const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geocodeCity = async (city) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, { headers: { 'Accept-Language': 'en' } });
    const d = await res.json();
    if (!d.length) throw new Error(`Cannot find "${city}"`);
    return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
};

/* ─────────────────────── MARKER ─────────────────────── */
const RecycleMarker = ({ center, isActive, onClick }) => {
    const open = center.isOpen;
    return (
        <div onClick={onClick} style={{ cursor: 'pointer', position: 'relative' }}>
            {/* Pin body */}
            <svg viewBox="0 0 40 52" width={36} height={46}
                style={{ filter: isActive ? 'drop-shadow(0 0 8px #22c55e)' : open ? 'drop-shadow(0 3px 5px #22c55e66)' : 'drop-shadow(0 3px 5px #ef444466)' }}>
                <path d="M20 0 C9 0 0 9 0 20 C0 35 20 52 20 52 C20 52 40 35 40 20 C40 9 31 0 20 0Z"
                    fill={isActive ? '#fff' : open ? '#22C55E' : '#6b7280'} />
                <circle cx="20" cy="20" r="12" fill={isActive ? '#052e16' : open ? '#052e16' : '#111827'} />
            </svg>
            {/* Recycle icon centered in pin */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: 36, height: 46,
                display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 12,
            }}>
                <Recycle size={15} color={isActive ? '#22C55E' : open ? '#22C55E' : '#9ca3af'} />
            </div>
            {/* Status dot */}
            <div style={{
                position: 'absolute', top: 1, right: 1,
                width: 9, height: 9, borderRadius: '50%',
                background: open ? '#22c55e' : '#ef4444',
                border: '2px solid #0d1117',
                boxShadow: open ? '0 0 5px #22c55e' : '0 0 5px #ef4444',
            }} />
        </div>
    );
};

/* ─────────────────────── MAIN ─────────────────────── */
const RecyclingLocator = () => {
    const [allCenters, setAllCenters] = useState(SEED_CENTERS);
    const [filteredCenters, setFilteredCenters] = useState(SEED_CENTERS);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [activeCenter, setActiveCenter] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [searchCity, setSearchCity] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [radiusKm, setRadiusKm] = useState(50);
    const [viewState, setViewState] = useState(DEFAULT_VIEW);
    const [popupCenter, setPopupCenter] = useState(null);
    const mapRef = useRef(null);

    /* ── Load from API (augment seed data) ── */
    useEffect(() => {
        api.get('/recycling')
            .then(r => {
                if (r.data?.length) {
                    const apiCenters = r.data.map(c => ({
                        ...c,
                        id: c._id || c.id,
                        lat: c.lat || c.location?.coordinates?.[1],
                        lng: c.lng || c.location?.coordinates?.[0],
                        isOpen: c.isOpen ?? true,
                        distance: null,
                    })).filter(c => c.lat && c.lng);
                    // Merge: prefer API data, keep seeds not in API
                    setAllCenters(prev => [...apiCenters, ...SEED_CENTERS]);
                }
            })
            .catch(() => { /* use seed data */ });
    }, []);

    /* ── Filter Logic ── */
    useEffect(() => {
        let result = allCenters;
        if (selectedFilters.length > 0) {
            result = result.filter(c =>
                c.acceptedWaste.some(w => selectedFilters.map(f => f.toLowerCase()).includes(w.toLowerCase()))
            );
        }
        // Sort by distance if user location set
        if (userLocation) {
            result = result.map(c => ({
                ...c,
                distance: haversine(userLocation.lat, userLocation.lng, c.lat, c.lng)
            })).filter(c => c.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance);
        }
        setFilteredCenters(result);
    }, [selectedFilters, allCenters, userLocation, radiusKm]);

    /* ── Get GPS Location ── */
    const handleGPS = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported.'); return; }
        toast.loading('Finding your location...', { id: 'geo' });
        navigator.geolocation.getCurrentPosition(
            pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 2000 });
                toast.success('Location found! Showing nearby centers.', { id: 'geo' });
            },
            () => toast.error('Could not get location. Please allow browser permission.', { id: 'geo' })
        );
    };

    /* ── Search by City Name ── */
    const handleCitySearch = async () => {
        if (!searchCity.trim()) { toast.error('Enter a city name.'); return; }
        setIsSearching(true);
        const tid = toast.loading('Searching...');
        try {
            const loc = await geocodeCity(searchCity);
            setUserLocation(loc);
            mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 11, duration: 2000 });
            toast.success(`Showing centers near ${searchCity}`, { id: tid });
        } catch (e) {
            toast.error(e.message, { id: tid });
        } finally {
            setIsSearching(false);
        }
    };

    /* ── Fly to center on click ── */
    const handleCenterClick = (center) => {
        setActiveCenter(center);
        setPopupCenter(center);
        mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: 15, duration: 1500 });
    };

    const toggleFilter = (waste) => {
        setSelectedFilters(prev =>
            prev.includes(waste) ? prev.filter(f => f !== waste) : [...prev, waste]
        );
    };

    /* ──────────────────────────────────────────────────
       RENDER
    ────────────────────────────────────────────────── */
    return (
        <div
            className="flex bg-[#0d1117] overflow-hidden"
            style={{ height: `calc(100vh - ${NAV_HEIGHT}px)` }}
        >
            {/* ════════════ LEFT PANEL ════════════ */}
            <div className="w-full lg:w-[400px] shrink-0 h-full bg-[#0d1117] border-r border-white/5 flex flex-col z-10 shadow-2xl">

                {/* ── Header ── */}
                <div className="px-5 pt-5 pb-4 border-b border-white/5 sticky top-0 bg-[#0d1117] z-20">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 bg-neonGreen/10 rounded-xl flex items-center justify-center">
                            <Recycle size={18} className="text-neonGreen" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">Recycling Locator</h1>
                            <p className="text-[11px] text-stone-500">Find drop-off centers near you</p>
                        </div>
                    </div>

                    {/* City Search */}
                    <div className="mt-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="text"
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                                placeholder="Search city, area..."
                                className="w-full bg-white/5 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-neonGreen/60 focus:bg-neonGreen/5 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleCitySearch}
                            disabled={isSearching}
                            className="bg-neonGreen text-[#0d1117] px-4 rounded-xl font-bold text-sm disabled:opacity-50 shadow-[0_0_14px_rgba(34,197,94,0.3)] hover:bg-green-400 transition-all"
                        >
                            {isSearching
                                ? <div className="w-4 h-4 border-2 border-[#0d1117]/30 border-t-[#0d1117] rounded-full animate-spin" />
                                : <Search size={16} />}
                        </button>
                    </div>

                    {/* GPS Button */}
                    <button
                        onClick={handleGPS}
                        className="mt-2 w-full py-2.5 bg-white/4 hover:bg-neonGreen/10 border border-white/8 hover:border-neonGreen/40 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Navigation size={15} className="text-neonGreen" /> Use My Current Location
                    </button>

                    {/* Radius Selector */}
                    {userLocation && (
                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-[11px] text-stone-500 shrink-0">Radius:</span>
                            {[10, 25, 50, 100].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRadiusKm(r)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${radiusKm === r ? 'bg-neonGreen text-[#0d1117]' : 'bg-white/5 text-stone-400 hover:text-white border border-white/8'}`}
                                >
                                    {r} km
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Waste Type Filters */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                <SlidersHorizontal size={10} /> Filter by Waste Type
                            </span>
                            {selectedFilters.length > 0 && (
                                <button onClick={() => setSelectedFilters([])} className="text-[10px] text-neonGreen hover:text-green-300 transition-colors font-semibold">
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {WASTE_TYPES.map(waste => {
                                const active = selectedFilters.includes(waste);
                                return (
                                    <button
                                        key={waste}
                                        onClick={() => toggleFilter(waste)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1.5
                                            ${active
                                                ? 'bg-neonGreen text-[#0d1117] border-neonGreen shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                                                : 'bg-white/4 text-stone-400 border-white/8 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        <Recycle size={10} className={active ? 'text-[#0d1117]' : 'text-stone-500'} />
                                        {waste}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Results List ── */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e20 transparent' }}>
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                        <span className="text-xs text-stone-400 font-semibold flex items-center gap-1.5">
                            <Recycle size={12} className="text-neonGreen" />
                            {filteredCenters.length} Centers Found
                            {userLocation && <span className="text-stone-600">· sorted by distance</span>}
                        </span>
                        {!userLocation && (
                            <span className="text-[10px] text-stone-600">Search a city to see nearby</span>
                        )}
                    </div>

                    <div className="p-3 space-y-2 pb-10">
                        {filteredCenters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/8 rounded-2xl mt-2">
                                <Recycle size={32} className="text-stone-700 mb-3" />
                                <p className="text-stone-500 text-sm font-medium">No centers found</p>
                                <p className="text-stone-600 text-xs mt-1 text-center px-4">
                                    Try clearing filters or searching a different city.
                                </p>
                            </div>
                        ) : (
                            filteredCenters.map(center => {
                                const isActive = activeCenter?.id === center.id || activeCenter?._id === center._id;
                                return (
                                    <div
                                        key={center.id || center._id}
                                        onClick={() => handleCenterClick(center)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200
                                            ${isActive
                                                ? 'bg-neonGreen/10 border-neonGreen/50 shadow-[0_0_16px_rgba(34,197,94,0.12)]'
                                                : 'bg-white/3 border-white/6 hover:border-white/15 hover:bg-white/5'
                                            }`}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${center.isOpen ? 'bg-neonGreen/15' : 'bg-white/5'}`}>
                                                    <Recycle size={15} className={center.isOpen ? 'text-neonGreen' : 'text-stone-500'} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-bold truncate ${isActive ? 'text-neonGreen' : 'text-white'}`}>
                                                        {center.name}
                                                    </p>
                                                    {center.distance != null && (
                                                        <p className="text-[10px] text-stone-500 mt-0.5">{center.distance.toFixed(1)} km away</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-wider ${center.isOpen ? 'bg-neonGreen/15 text-neonGreen border border-neonGreen/30' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {center.isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </div>

                                        {/* Address + Hours */}
                                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-1">
                                            <MapPin size={10} /> {center.address}
                                        </div>
                                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-2.5">
                                            <Clock size={10} /> {center.operatingHours?.open} – {center.operatingHours?.close}
                                        </div>

                                        {/* Waste Type Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {center.acceptedWaste.map(waste => (
                                                <span
                                                    key={waste}
                                                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                                                    style={{
                                                        background: `${WASTE_COLORS[waste] || '#22c55e'}18`,
                                                        borderColor: `${WASTE_COLORS[waste] || '#22c55e'}40`,
                                                        color: WASTE_COLORS[waste] || '#22c55e',
                                                    }}
                                                >
                                                    <Recycle size={8} />
                                                    {waste}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ════════════ MAP PANEL ════════════ */}
            <div className="hidden lg:block flex-1 h-full relative">
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={e => setViewState(e.viewState)}
                    mapStyle={MAP_STYLE}
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => { setPopupCenter(null); setActiveCenter(null); }}
                    attributionControl={false}
                    cursor="default"
                >
                    {/* Controls */}
                    <NavigationControl position="bottom-right" showCompass visualizePitch />
                    <GeolocateControl position="bottom-right" trackUserLocation onGeolocate={e => {
                        const loc = { lat: e.coords.latitude, lng: e.coords.longitude };
                        setUserLocation(loc);
                    }} />
                    <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />

                    {/* User Location Dot */}
                    {userLocation && (
                        <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6', border: '3px solid #fff', boxShadow: '0 0 12px #3b82f6', zIndex: 2, position: 'relative' }} />
                                <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: '#3b82f620', border: '1px solid #3b82f640', animation: 'pulse 2s infinite' }} />
                            </div>
                        </Marker>
                    )}

                    {/* Recycling Center Markers */}
                    {filteredCenters.map(center => (
                        <Marker
                            key={center.id || center._id}
                            longitude={center.lng}
                            latitude={center.lat}
                            anchor="bottom"
                        >
                            <RecycleMarker
                                center={center}
                                isActive={activeCenter?.id === center.id || activeCenter?._id === center._id}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleCenterClick(center);
                                }}
                            />
                        </Marker>
                    ))}

                    {/* Popup */}
                    {popupCenter && (
                        <Popup
                            longitude={popupCenter.lng}
                            latitude={popupCenter.lat}
                            anchor="bottom"
                            closeOnClick={false}
                            onClose={() => { setPopupCenter(null); setActiveCenter(null); }}
                            maxWidth="260px"
                            offset={[0, -46]}
                        >
                            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px', minWidth: 220 }}>
                                {/* Title */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: popupCenter.isOpen ? '#22c55e20' : '#ffffff10', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid', borderColor: popupCenter.isOpen ? '#22c55e40' : '#ffffff15' }}>
                                        <Recycle size={14} color={popupCenter.isOpen ? '#22c55e' : '#6b7280'} />
                                    </div>
                                    <div>
                                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{popupCenter.name}</p>
                                        <p style={{ color: popupCenter.isOpen ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {popupCenter.isOpen ? 'Open Now' : 'Closed'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                        <MapPin size={11} color="#6b7280" style={{ marginTop: 1, flexShrink: 0 }} />
                                        <span style={{ color: '#9ca3af', fontSize: 11 }}>{popupCenter.address}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={11} color="#6b7280" />
                                        <span style={{ color: '#9ca3af', fontSize: 11 }}>{popupCenter.operatingHours?.open} – {popupCenter.operatingHours?.close}</span>
                                    </div>
                                    {popupCenter.distance != null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Navigation size={11} color="#6b7280" />
                                            <span style={{ color: '#9ca3af', fontSize: 11 }}>{popupCenter.distance.toFixed(1)} km away</span>
                                        </div>
                                    )}
                                </div>

                                {/* Waste types */}
                                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {popupCenter.acceptedWaste.map(w => (
                                        <span key={w} style={{
                                            display: 'flex', alignItems: 'center', gap: 3,
                                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                                            background: `${WASTE_COLORS[w] || '#22c55e'}18`,
                                            border: `1px solid ${WASTE_COLORS[w] || '#22c55e'}35`,
                                            color: WASTE_COLORS[w] || '#22c55e',
                                        }}>
                                            <Recycle size={8} />  {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* ── Map Legend ── */}
                <div style={{
                    position: 'absolute', top: 16, left: 16, zIndex: 20,
                    background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: '13px 15px', minWidth: 175,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                    <p style={{ color: '#6b7280', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 11 }}>
                        Map Legend
                    </p>
                    {/* Open Center */}
                    <LegRow
                        icon={<div style={{ width: 18, height: 18, borderRadius: '50%', background: '#052e16', border: '2px solid #22c55e', boxShadow: '0 0 7px #22c55e60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Recycle size={9} color="#22c55e" /></div>}
                        label="Open Center"
                    />
                    {/* Closed Center */}
                    <LegRow
                        icon={<div style={{ width: 18, height: 18, borderRadius: '50%', background: '#111827', border: '2px solid #6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Recycle size={9} color="#6b7280" /></div>}
                        label="Closed Center"
                    />
                    {/* You */}
                    <LegRow
                        icon={<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', border: '2px solid #fff', boxShadow: '0 0 7px #3b82f680' }} />}
                        label="Your Location"
                    />
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                    <p style={{ color: '#6b7280', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Waste Types</p>
                    {WASTE_TYPES.slice(0, 4).map(w => (
                        <LegRow key={w}
                            icon={<div style={{ width: 10, height: 10, borderRadius: 3, background: WASTE_COLORS[w] || '#22c55e', opacity: 0.85 }} />}
                            label={w}
                        />
                    ))}
                    {WASTE_TYPES.slice(4).map(w => (
                        <LegRow key={w}
                            icon={<div style={{ width: 10, height: 10, borderRadius: 3, background: WASTE_COLORS[w] || '#22c55e', opacity: 0.85 }} />}
                            label={w}
                        />
                    ))}
                </div>

                {/* Center Count Badge */}
                <div style={{
                    position: 'absolute', top: 16, right: 70, zIndex: 20,
                    background: 'rgba(13,17,23,0.9)', border: '1.5px solid rgba(34,197,94,0.3)',
                    borderRadius: 20, padding: '6px 14px',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <Recycle size={13} color="#22c55e" />
                    <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>
                        {filteredCenters.length} Recycling Centers
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ── Legend Row helper ── */
const LegRow = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        {icon}
        <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 500 }}>{label}</span>
    </div>
);

export default RecyclingLocator;
