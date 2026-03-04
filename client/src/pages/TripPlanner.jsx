import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Map, { Marker, Source, Layer, NavigationControl, ScaleControl, GeolocateControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
    Leaf, MapPin, Calculator, Calendar, BadgeCheck, Utensils, Hotel,
    Bus, Route, Train, Plane, Bike, Car, BatteryCharging,
    Wind, Navigation2, X, ChevronRight, Zap, TreePine, Info,
    ChevronDown, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────────────────── CONSTANTS ─────────────────────── */
const NAV_HEIGHT = 65; // px — must match Navbar height exactly
const DEFAULT_VIEW = { longitude: 78.9629, latitude: 20.5937, zoom: 4.2 };
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const EMISSION_RATES = {
    airplane: 0.285, car: 0.192, motorcycle: 0.103,
    bus: 0.068, ev: 0.050, train: 0.041,
};

/* ─────────────────────── FREE GEOCODING (Nominatim) ─────────────────────── */
const geocode = async (q) => {
    const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    if (!d.length) throw new Error(`Cannot find: "${q}"`);
    return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
};

/* ─────────────────────── REAL EV STATIONS (Overpass API) ─────────────────────── */
const fetchRealEVStations = async (coords, maxStations = 8) => {
    try {
        // Sample evenly along route coords
        const step = Math.max(1, Math.floor(coords.length / (maxStations + 1)));
        const sample = [];
        for (let i = step; i < coords.length - 1; i += step) {
            if (sample.length >= maxStations) break;
            sample.push(coords[i]);
        }

        const stations = [];
        for (const coord of sample.slice(0, 4)) {
            const [lng, lat] = coord;
            const query = `[out:json][timeout:10];node["amenity"="charging_station"](around:50000,${lat},${lng});out 1;`;
            try {
                const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.elements?.length) {
                    const el = data.elements[0];
                    stations.push({
                        id: `ev-real-${el.id}`,
                        lat: el.lat, lng: el.lon,
                        name: el.tags?.name || el.tags?.operator || 'EV Charging Station',
                        sockets: el.tags?.['capacity'] || el.tags?.['socket:type2'] || '?',
                        real: true,
                    });
                } else {
                    // Fallback: place one at sample point
                    stations.push({
                        id: `ev-fallback-${lat}-${lng}`,
                        lat, lng,
                        name: 'EV Charging Point',
                        sockets: '2',
                        real: false,
                    });
                }
            } catch {
                stations.push({
                    id: `ev-fb-${lat}`,
                    lat, lng, name: 'EV Charging Point', sockets: '2', real: false,
                });
            }
        }
        return stations;
    } catch (e) {
        console.warn('EV station fetch error:', e);
        return [];
    }
};

/* ─────────────────────── UTILITY: Filter points along route ─────────────────────── */
const getDistanceFromPointToLine = (point, lineStart, lineEnd) => {
    const [x0, y0] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const A = x0 - x1;
    const B = y0 - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }

    const dx = x0 - xx;
    const dy = y0 - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

const isPointNearRoute = (point, routeCoords, maxDistanceKm = 50) => {
    if (!routeCoords || routeCoords.length < 2) return true; // Show all if no route

    // Convert max distance to approximate degrees (rough estimation)
    const maxDistDegrees = maxDistanceKm / 111;

    for (let i = 0; i < routeCoords.length - 1; i++) {
        const dist = getDistanceFromPointToLine(point, routeCoords[i], routeCoords[i + 1]);
        if (dist <= maxDistDegrees) return true;
    }
    return false;
};

/* ─────────────────────── CUSTOM SVG MARKERS ─────────────────────── */

// Google-Maps-style teardrop pin SVG
const PinMarker = ({ color, innerColor, size = 36, children }) => (
    <div style={{ width: size, height: size * 1.3, position: 'relative', cursor: 'pointer' }}>
        <svg viewBox="0 0 40 52" width={size} height={size * 1.3} style={{ position: 'absolute', top: 0, left: 0, filter: `drop-shadow(0 3px 6px ${color}88)` }}>
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 52 20 52 C20 52 40 35 40 20 C40 9 31 0 20 0Z" fill={color} />
            <circle cx="20" cy="20" r="11" fill={innerColor || '#fff'} opacity="0.95" />
        </svg>
        <div style={{
            position: 'absolute', top: 0, left: 0, width: size, height: size * 1.3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            paddingBottom: size * 0.3,
        }}>
            {children}
        </div>
    </div>
);

// Round bubble marker for EV/nature sites
const BubbleMarker = ({ bg, border, glow, children, size = 32 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        background: bg, border: `2.5px solid ${border}`,
        boxShadow: `0 0 10px ${glow}, 0 2px 8px rgba(0,0,0,0.6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s',
    }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
        {children}
    </div>
);

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
const TripPlanner = () => {
    const [businesses, setBusinesses] = useState([]);
    const [natureSites, setNatureSites] = useState([]);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [routeDetails, setRouteDetails] = useState(null);
    const [chargingStations, setChargingStations] = useState([]);
    const [routeGeojson, setRouteGeojson] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [activeTab, setActiveTab] = useState('plan');
    const [distanceCO2, setDistanceCO2] = useState(0);
    const [popupInfo, setPopupInfo] = useState(null); // { lng, lat, title, body }
    const [viewState, setViewState] = useState(DEFAULT_VIEW);
    const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
    const [nearbyNatureSites, setNearbyNatureSites] = useState([]);
    const [showAllPOIs, setShowAllPOIs] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const mapRef = useRef(null);

    useEffect(() => {
        api.get('/businesses').then(r => r.data && setBusinesses(r.data)).catch(() => { });
        api.get('/sites').then(r => r.data && setNatureSites(r.data)).catch(() => { });
    }, []);

    /* ── Filter nearby points when route changes ── */
    useEffect(() => {
        if (!routeGeojson || !routeGeojson.features[0]?.geometry?.coordinates) {
            // No route calculated - show all or none based on preference
            if (showAllPOIs) {
                setNearbyBusinesses(businesses);
                setNearbyNatureSites(natureSites);
            } else {
                setNearbyBusinesses([]);
                setNearbyNatureSites([]);
            }
            return;
        }

        const routeCoords = routeGeojson.features[0].geometry.coordinates;

        // Filter businesses along route (within 50km)
        const filteredBiz = businesses.filter(biz => {
            const lat = biz.lat || biz.location?.coordinates?.[1];
            const lng = biz.lng || biz.location?.coordinates?.[0];
            if (!lat || !lng) return false;
            return isPointNearRoute([lng, lat], routeCoords, 50);
        });
        setNearbyBusinesses(filteredBiz);

        // Filter nature sites along route (within 50km)
        const filteredSites = natureSites.filter(site => {
            const lat = site.lat || site.location?.coordinates?.[1];
            const lng = site.lng || site.location?.coordinates?.[0];
            if (!lat || !lng) return false;
            return isPointNearRoute([lng, lat], routeCoords, 50);
        });
        setNearbyNatureSites(filteredSites);

        toast.success(`Found ${filteredBiz.length} businesses and ${filteredSites.length} nature sites along your route!`);
    }, [routeGeojson, businesses, natureSites, showAllPOIs]);

    const toggleItem = useCallback((item) => {
        setSelectedItems(prev => {
            const key = item._id || item.id;
            const exists = prev.find(i => (i._id || i.id) === key);
            if (exists) return prev.filter(i => (i._id || i.id) !== key);
            toast.success(`✅ ${item.name} added to itinerary`);
            return [...prev, item];
        });
    }, []);

    /* ── Route Calculation ── */
    const handleCalculateRoute = async () => {
        if (!origin.trim() || !destination.trim()) {
            toast.error('Enter both Origin and Destination.');
            return;
        }
        setIsCalculating(true);
        const tid = toast.loading('📍 Finding locations...');
        try {
            const [orig, dest] = await Promise.all([geocode(origin), geocode(destination)]);
            toast.loading('🛣️ Calculating route...', { id: tid });

            const osrm = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${orig.lng},${orig.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`
            ).then(r => r.json());

            if (osrm.code !== 'Ok') throw new Error('No route found between these points.');
            const route = osrm.routes[0];
            const distKm = route.distance / 1000;
            const coords = route.geometry.coordinates;

            setStartLocation(orig);
            setEndLocation(dest);
            setRouteGeojson({
                type: 'FeatureCollection',
                features: [{ type: 'Feature', properties: {}, geometry: route.geometry }]
            });

            toast.loading('⚡ Locating real EV stations near route...', { id: tid });
            const evStations = await fetchRealEVStations(coords);
            setChargingStations(evStations);

            // Fit bounds
            if (mapRef.current && coords.length > 0) {
                const bounds = coords.reduce(
                    (acc, c) => [[Math.min(acc[0][0], c[0]), Math.min(acc[0][1], c[1])],
                    [Math.max(acc[1][0], c[0]), Math.max(acc[1][1], c[1])]],
                    [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
                );
                mapRef.current.fitBounds(bounds, { padding: 80, duration: 2000 });
            }

            const emissions = Object.fromEntries(
                Object.entries(EMISSION_RATES).map(([k, v]) => [k, distKm * v])
            );
            setDistanceCO2(emissions.car);
            setRouteDetails({
                distanceKm: distKm,
                distanceText: `${distKm.toFixed(1)} km`,
                durationText: `${Math.ceil(route.duration / 60)} min`,
                emissions,
            });
            setActiveTab('stats');
            toast.success(`🌿 Route ready! ${Math.floor(emissions.car)} kg CO₂ (car). ${evStations.length} EV stations found.`, { id: tid });
        } catch (err) {
            toast.error(err.message || 'Route failed.', { id: tid });
        } finally {
            setIsCalculating(false);
        }
    };

    const calcSavings = selectedItems.reduce((a, i) => a + (i.co2Save || 0), 0);
    const netCO2 = distanceCO2 > 0 ? Math.max(0, distanceCO2 - calcSavings) : 0;

    const getRec = () => {
        if (!routeDetails) return null;
        const d = routeDetails.distanceKm;
        if (d < 5) return '🚶 Walk or cycle — zero emissions for this short trip!';
        if (d < 30) return '🚲 Cycling or an EV is ideal. Avoid solo car trips.';
        if (d < 400) return '🚆 Train or bus are the cleanest options. Choose EV if you must drive.';
        return '✈️ Train beats plane dramatically. Offset if flying is unavoidable.';
    };

    const handleSave = async () => {
        if (!routeDetails) { toast.error('Calculate a route first.'); return; }
        try {
            toast.loading('Saving...', { id: 'save' });
            await api.post('/trips', {
                title: `${origin} → ${destination}`,
                origin: origin,
                destination: destination,
                originCoords: startLocation,
                destinationCoords: endLocation,
                distanceKm: routeDetails.distanceKm,
                selectedBusinesses: selectedItems.filter(i => i._id).map(i => i._id),
                carbonScore: netCO2,
                carbonSaved: calcSavings,
                status: 'planned'
            });
            toast.success('🌱 Itinerary saved!', { id: 'save' });
        } catch (error) {
            console.error('Trip save error:', error);
            toast.error('Failed to save itinerary.', { id: 'save' });
        }
    };


    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    return (
        <div
            className="flex bg-darkBg overflow-hidden"
            style={{ height: `calc(100vh - ${NAV_HEIGHT}px)` }}
        >
            {/* ════════════ LEFT PANEL ════════════ */}
            <div className="w-full lg:w-[400px] shrink-0 h-full bg-[#0d1117] border-r border-white/5 flex flex-col shadow-2xl z-10">

                {/* ── Header ── */}
                <div className="px-5 pt-4 pb-3 border-b border-white/5 bg-[#0d1117] sticky top-0 z-20">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-neonGreen/15 flex items-center justify-center">
                            <Leaf size={16} className="text-neonGreen" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-tight">Green Trip Planner</h1>
                            <p className="text-xs text-stone-500">Plan carbon-smart journeys</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                        {[{ key: 'plan', label: 'Plan Trip', icon: '🗺️' }, { key: 'stats', label: 'Carbon Stats', icon: '📊' }].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5
                                    ${activeTab === t.key
                                        ? 'bg-neonGreen text-[#0d1117] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                                        : 'text-stone-400 hover:text-white'}`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e20 transparent' }}>

                    {/* ──────── PLAN TAB ──────── */}
                    {activeTab === 'plan' && (
                        <div className="p-5 space-y-5">

                            {/* Route Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Route</label>
                                {/* Origin */}
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neonGreen border-2 border-[#0d1117] shadow-[0_0_8px_#22C55E] z-10" />
                                    <div className="absolute left-[17px] top-[calc(50%+6px)] w-px h-3 bg-stone-700" />
                                    <input
                                        type="text" value={origin}
                                        onChange={e => setOrigin(e.target.value)}
                                        placeholder="From: city or address..."
                                        className="w-full bg-white/5 border border-white/8 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-neonGreen/60 focus:bg-neonGreen/5 transition-all"
                                    />
                                </div>
                                {/* Destination + Calculate */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                        <input
                                            type="text" value={destination}
                                            onChange={e => setDestination(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCalculateRoute()}
                                            placeholder="To: city or address..."
                                            className="w-full bg-white/5 border border-white/8 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-neonGreen/60 focus:bg-neonGreen/5 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCalculateRoute} disabled={isCalculating}
                                        className="bg-neonGreen text-[#0d1117] px-4 rounded-xl font-bold disabled:opacity-50 shadow-[0_0_16px_rgba(34,197,94,0.35)] hover:bg-green-400 hover:shadow-[0_0_22px_rgba(34,197,94,0.55)] transition-all flex items-center gap-1 text-sm"
                                    >
                                        {isCalculating
                                            ? <div className="w-4 h-4 border-2 border-[#0d1117]/30 border-t-[#0d1117] rounded-full animate-spin" />
                                            : <><Navigation2 size={16} /> Go</>}
                                    </button>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div>
                                <label className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-2">Map Display Options</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFilterType(filterType === 'all' ? 'none' : 'all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${filterType === 'all'
                                            ? 'bg-neonGreen/20 border-neonGreen text-neonGreen'
                                            : 'bg-white/5 border-white/10 hover:border-neonGreen/50 text-stone-400'
                                            }`}
                                    >
                                        🗺️ {filterType === 'all' ? 'Hide All' : 'Show All'}
                                    </button>
                                    <button
                                        onClick={() => setFilterType(filterType === 'nature' ? 'none' : 'nature')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${filterType === 'nature'
                                            ? 'bg-neonGreen/20 border-neonGreen text-neonGreen'
                                            : 'bg-white/5 border-white/10 hover:border-neonGreen/50 text-stone-400'
                                            }`}
                                    >
                                        🌿 Nature Sites
                                    </button>
                                    <button
                                        onClick={() => setFilterType(filterType === 'hotel' ? 'none' : 'hotel')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${filterType === 'hotel'
                                            ? 'bg-neonGreen/20 border-neonGreen text-neonGreen'
                                            : 'bg-white/5 border-white/10 hover:border-neonGreen/50 text-stone-400'
                                            }`}
                                    >
                                        🏨 Eco Hotels
                                    </button>
                                    <button
                                        onClick={() => setFilterType(filterType === 'restaurant' ? 'none' : 'restaurant')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${filterType === 'restaurant'
                                            ? 'bg-neonGreen/20 border-neonGreen text-neonGreen'
                                            : 'bg-white/5 border-white/10 hover:border-neonGreen/50 text-stone-400'
                                            }`}
                                    >
                                        🥗 Restaurants
                                    </button>
                                    <button
                                        onClick={() => setFilterType(filterType === 'transport' ? 'none' : 'transport')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${filterType === 'transport'
                                            ? 'bg-neonGreen/20 border-neonGreen text-neonGreen'
                                            : 'bg-white/5 border-white/10 hover:border-neonGreen/50 text-stone-400'
                                            }`}
                                    >
                                        🚌 Transport
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-500 mt-2">
                                    {routeGeojson
                                        ? `Showing ${filterType === 'all' ? 'all' : filterType} places within 50km of your route`
                                        : 'Calculate a route to see nearby eco-friendly stops'
                                    }
                                </p>
                            </div>

                            {/* Eco Businesses */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Eco Businesses</label>
                                    <span className="text-[10px] bg-neonGreen/15 text-neonGreen px-2 py-0.5 rounded-full font-bold">{businesses.length} verified</span>
                                </div>

                                {businesses.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-white/8 rounded-2xl">
                                        <div className="text-3xl mb-2">🏙️</div>
                                        <p className="text-stone-600 text-xs">No businesses loaded</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {businesses.map(biz => {
                                            const key = biz._id || biz.id;
                                            const selected = !!selectedItems.find(i => (i._id || i.id) === key);
                                            return (
                                                <div key={key}
                                                    onClick={() => toggleItem(biz)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                                                        ${selected ? 'bg-neonGreen/10 border-neonGreen/40' : 'bg-white/3 border-white/6 hover:border-white/15 hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${selected ? 'bg-neonGreen text-[#0d1117]' : 'bg-white/8 text-stone-400'}`}>
                                                        {biz.type === 'hotel' ? <Hotel size={15} /> : biz.type === 'transport' ? <Bus size={15} /> : <Utensils size={15} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{biz.name}</p>
                                                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                                            <BadgeCheck size={10} className="text-neonGreen" /> {biz.badge || 'Green'} Certified
                                                            {biz.co2Save && <span className="text-neonGreen ml-1">· −{biz.co2Save}kg CO₂</span>}
                                                        </p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-neonGreen' : 'bg-white/10'}`}>
                                                        {selected ? <X size={10} className="text-[#0d1117]" /> : <ChevronRight size={10} className="text-stone-500" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ──────── STATS TAB ──────── */}
                    {activeTab === 'stats' && (
                        <div className="p-5 space-y-5">
                            {!routeDetails ? (
                                <div className="py-16 text-center border border-dashed border-white/8 rounded-2xl mt-4">
                                    <div className="text-4xl mb-3">🧭</div>
                                    <p className="text-stone-500 text-sm font-medium">No route calculated yet</p>
                                    <p className="text-stone-600 text-xs mt-1">Go to Plan Trip and calculate a route first.</p>
                                    <button onClick={() => setActiveTab('plan')} className="mt-4 px-4 py-2 bg-neonGreen/15 text-neonGreen text-xs font-bold rounded-lg border border-neonGreen/30 hover:bg-neonGreen/25 transition-all">
                                        → Plan a Trip
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Route summary */}
                                    <div className="flex items-center gap-3 bg-white/4 rounded-xl p-3 border border-white/6">
                                        <MapPin size={14} className="text-neonGreen shrink-0" />
                                        <div className="flex-1 min-w-0 text-xs text-stone-300 truncate">{origin} → {destination}</div>
                                        <div className="flex gap-3 shrink-0 text-xs text-stone-500">
                                            <span>📍 {routeDetails.distanceText}</span>
                                            <span>⏱ {routeDetails.durationText}</span>
                                        </div>
                                    </div>

                                    {/* CO₂ Gauge */}
                                    <div className="flex flex-col items-center py-4">
                                        <div className={`relative w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center
                                            ${netCO2 === 0 ? 'border-neonGreen shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'border-neonGreen/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]'}`}>
                                            {netCO2 === 0 && (
                                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-neonGreen text-[#0d1117] text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                                                    🌿 CARBON NEUTRAL
                                                </span>
                                            )}
                                            <span className="text-3xl font-bold text-white">{Math.floor(netCO2)}</span>
                                            <span className="text-[10px] text-neonGreen font-bold uppercase tracking-wider mt-1">kg CO₂ net</span>
                                        </div>
                                        <p className="text-xs text-stone-600 mt-3">Baseline by car: <span className="text-stone-400">{Math.floor(distanceCO2)} kg</span></p>
                                    </div>

                                    {/* Recommendation */}
                                    <div className="bg-neonGreen/6 border border-neonGreen/20 p-4 rounded-xl">
                                        <p className="text-xs font-bold text-neonGreen flex items-center gap-1.5 mb-1.5"><Leaf size={12} /> Smart Recommendation</p>
                                        <p className="text-xs text-stone-300 leading-relaxed">{getRec()}</p>
                                    </div>

                                    {/* Transport bars */}
                                    <div>
                                        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-3">Transport Comparison</p>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Airplane', icon: '✈️', val: routeDetails.emissions.airplane, clr: '#ef4444' },
                                                { label: 'Car (solo)', icon: '🚗', val: routeDetails.emissions.car, clr: '#f97316' },
                                                { label: 'Motorcycle', icon: '🏍️', val: routeDetails.emissions.motorcycle, clr: '#eab308' },
                                                { label: 'Bus', icon: '🚌', val: routeDetails.emissions.bus, clr: '#84cc16' },
                                                { label: 'EV Vehicle', icon: '⚡', val: routeDetails.emissions.ev, clr: '#22c55e' },
                                                { label: 'Train', icon: '🚆', val: routeDetails.emissions.train, clr: '#16a34a' },
                                                { label: 'Cycling / Walking', icon: '🚲', val: 0, clr: '#22c55e' },
                                            ].map(item => {
                                                const maxV = Math.max(...Object.values(routeDetails.emissions));
                                                const pct = maxV > 0 ? Math.min(100, (item.val / maxV) * 100) : 0;
                                                return (
                                                    <div key={item.label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-stone-400">{item.icon} {item.label}</span>
                                                            <span className="font-mono text-stone-300">{Math.floor(item.val)} kg</span>
                                                        </div>
                                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                            <div className="h-1.5 rounded-full transition-all duration-700"
                                                                style={{ width: `${pct}%`, background: item.clr }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Selected Offsets */}
                                    {selectedItems.length > 0 && (
                                        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                                                <Zap size={10} className="text-neonGreen" /> Eco Offsets Selected
                                            </p>
                                            {selectedItems.map(item => (
                                                <div key={item._id || item.id} className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                                                    <span className="text-stone-300">{item.name}</span>
                                                    <span className="text-neonGreen font-mono">−{item.co2Save || 0} kg</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs pt-2 font-bold mt-1">
                                                <span className="text-white">Total Saved:</span>
                                                <span className="text-neonGreen font-mono">−{calcSavings} kg</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Offset CTA */}
                                    {netCO2 > 0 && (
                                        <div className="bg-neonGreen/8 border border-neonGreen/25 rounded-xl p-4">
                                            <p className="text-xs text-stone-300 mb-3">
                                                Still <span className="text-white font-bold">{Math.floor(netCO2)} kg CO₂</span> to offset for this trip.
                                            </p>
                                            <Link to="/offset"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-neonGreen text-[#0d1117] font-bold rounded-lg text-sm hover:bg-green-400 transition-all shadow-[0_0_14px_rgba(34,197,94,0.3)]">
                                                <Leaf size={14} /> Neutralize Now →
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="p-4 border-t border-white/5 shrink-0">
                    <button onClick={handleSave}
                        className="w-full py-3 bg-neonGreen text-[#0d1117] font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(34,197,94,0.25)] hover:bg-green-400 hover:shadow-[0_0_26px_rgba(34,197,94,0.45)] transition-all active:scale-95">
                        <Calendar size={16} /> Save Green Itinerary
                    </button>
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
                    onClick={() => setPopupInfo(null)}
                    attributionControl={false}
                    cursor="crosshair"
                >
                    {/* ── Map Controls ── */}
                    <NavigationControl position="bottom-right" showCompass visualizePitch />
                    <GeolocateControl position="bottom-right" trackUserLocation />
                    <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />

                    {/* ── Route Layers (Google-Maps-Style Blue) ── */}
                    {routeGeojson && (
                        <Source id="route" type="geojson" data={routeGeojson}>
                            {/* Blue shadow/glow */}
                            <Layer id="route-glow" type="line"
                                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                                paint={{
                                    'line-color': '#4285F4',
                                    'line-width': 12,
                                    'line-opacity': 0.15,
                                    'line-blur': 3
                                }}
                            />
                            {/* Dark blue outline */}
                            <Layer id="route-outline" type="line"
                                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                                paint={{
                                    'line-color': '#185ABC',
                                    'line-width': 8,
                                    'line-opacity': 1
                                }}
                            />
                            {/* Main vibrant blue line */}
                            <Layer id="route-main" type="line"
                                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                                paint={{
                                    'line-color': '#4285F4',
                                    'line-width': 5,
                                    'line-opacity': 1
                                }}
                            />
                            {/* Subtle light center line for depth */}
                            <Layer id="route-inner" type="line"
                                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                                paint={{
                                    'line-color': '#8AB4F8',
                                    'line-width': 1.5,
                                    'line-opacity': 0.6
                                }}
                            />
                        </Source>
                    )}


                    {/* ── Nature Site Markers (Filtered by filterType) ── */}
                    {(filterType === 'all' || filterType === 'nature') && nearbyNatureSites.map(site => {
                        const lat = site.lat || site.location?.coordinates?.[1];
                        const lng = site.lng || site.location?.coordinates?.[0];
                        if (!lat || !lng) return null;
                        const isQuiet = site.status === 'green';
                        return (
                            <Marker key={site._id || site.id} longitude={lng} latitude={lat} anchor="bottom">
                                <div onClick={e => {
                                    e.stopPropagation();
                                    setPopupInfo({
                                        lng, lat,
                                        title: site.name,
                                        emoji: isQuiet ? '🌿' : '⚠️',
                                        rows: [
                                            { label: 'Status', value: isQuiet ? '🟢 Quiet — Great to visit' : '🟡 Busy — Go early' },
                                            { label: 'Type', value: 'Nature Conservation Site' },
                                        ]
                                    });
                                }}>
                                    <PinMarker color={isQuiet ? '#22C55E' : '#eab308'} innerColor={isQuiet ? '#052e16' : '#1c1400'} size={34}>
                                        <TreePine size={13} color={isQuiet ? '#22C55E' : '#eab308'} />
                                    </PinMarker>
                                </div>
                            </Marker>
                        );
                    })}

                    {/* ── Eco Business Markers (Filtered by filterType) ── */}
                    {(filterType === 'all' || filterType === 'hotel' || filterType === 'restaurant' || filterType === 'transport') && nearbyBusinesses.filter(biz => filterType === 'all' || biz.category === filterType).map(biz => {
                        const lat = biz.lat || biz.location?.coordinates?.[1];
                        const lng = biz.lng || biz.location?.coordinates?.[0];
                        if (!lat || !lng) return null;
                        const isSelected = !!selectedItems.find(i => (i._id || i.id) === (biz._id || biz.id));
                        const Icon = biz.type === 'hotel' ? Hotel : biz.type === 'transport' ? Bus : Utensils;
                        return (
                            <Marker key={biz._id || biz.id} longitude={lng} latitude={lat} anchor="bottom">
                                <div onClick={e => {
                                    e.stopPropagation();
                                    toggleItem(biz);
                                    setPopupInfo({
                                        lng, lat,
                                        title: biz.name,
                                        emoji: '🏢',
                                        rows: [
                                            { label: 'Type', value: biz.type || 'Business' },
                                            { label: 'Badge', value: `${biz.badge || 'Green'} Certified ✅` },
                                            { label: 'CO₂ Save', value: `−${biz.co2Save || 0} kg per visit` },
                                        ]
                                    });
                                }}>
                                    <PinMarker color={isSelected ? '#22C55E' : '#6366f1'} innerColor={isSelected ? '#052e16' : '#1e1b4b'} size={34}>
                                        <Icon size={13} color={isSelected ? '#22C55E' : '#818cf8'} />
                                    </PinMarker>
                                </div>
                            </Marker>
                        );
                    })}

                    {/* ── EV Charging Station Markers (YELLOW) ── */}
                    {chargingStations.map(station => (
                        <Marker key={station.id} longitude={station.lng} latitude={station.lat} anchor="center">
                            <div onClick={e => {
                                e.stopPropagation();
                                setPopupInfo({
                                    lng: station.lng, lat: station.lat,
                                    title: station.name,
                                    emoji: '⚡',
                                    rows: [
                                        { label: 'Type', value: station.real ? '✅ Real Station (OSM Data)' : 'Suggested Stop' },
                                        { label: 'Sockets', value: station.sockets },
                                        { label: 'Tip', value: 'Charge while you eat or rest' },
                                    ]
                                });
                            }}>
                                <BubbleMarker bg="#1a1200" border="#FACC15" glow="#FACC1580" size={30}>
                                    <BatteryCharging size={14} color="#FACC15" />
                                </BubbleMarker>
                            </div>
                        </Marker>
                    ))}

                    {/* ── Start Marker ── */}
                    {startLocation && (
                        <Marker longitude={startLocation.lng} latitude={startLocation.lat} anchor="bottom">
                            <div className="flex flex-col items-center">
                                <div className="bg-neonGreen text-[#0d1117] text-[10px] font-black px-2.5 py-1 rounded-full mb-0.5 shadow-[0_0_14px_rgba(34,197,94,0.6)] tracking-wide whitespace-nowrap border border-neonGreen/30">
                                    ● START
                                </div>
                                <svg width="20" height="24" viewBox="0 0 20 24">
                                    <path d="M10 0 C4.5 0 0 4.5 0 10 C0 17.5 10 24 10 24 C10 24 20 17.5 20 10 C20 4.5 15.5 0 10 0Z" fill="#22C55E" />
                                    <circle cx="10" cy="10" r="4" fill="#0d1117" />
                                </svg>
                            </div>
                        </Marker>
                    )}

                    {/* ── End Marker ── */}
                    {endLocation && (
                        <Marker longitude={endLocation.lng} latitude={endLocation.lat} anchor="bottom">
                            <div className="flex flex-col items-center">
                                <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-0.5 shadow-[0_0_14px_rgba(239,68,68,0.6)] tracking-wide whitespace-nowrap border border-red-400/30">
                                    ● END
                                </div>
                                <svg width="20" height="24" viewBox="0 0 20 24">
                                    <path d="M10 0 C4.5 0 0 4.5 0 10 C0 17.5 10 24 10 24 C10 24 20 17.5 20 10 C20 4.5 15.5 0 10 0Z" fill="#EF4444" />
                                    <circle cx="10" cy="10" r="4" fill="#0d1117" />
                                </svg>
                            </div>
                        </Marker>
                    )}

                    {/* ── Info Popup ── */}
                    {popupInfo && (
                        <Popup
                            longitude={popupInfo.lng}
                            latitude={popupInfo.lat}
                            anchor="bottom"
                            closeOnClick={false}
                            onClose={() => setPopupInfo(null)}
                            style={{ zIndex: 100 }}
                            maxWidth="240px"
                        >
                            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', minWidth: 200 }}>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                                    {popupInfo.emoji} {popupInfo.title}
                                </p>
                                {popupInfo.rows.map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                                        <span style={{ color: '#6b7280', fontSize: 11 }}>{row.label}</span>
                                        <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* ════ VERTICAL MAP LEGEND ════ */}
                <div style={{
                    position: 'absolute', top: 16, left: 16, zIndex: 20,
                    background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '14px 16px', minWidth: 185,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                    <p style={{ color: '#6b7280', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Map Legend
                    </p>

                    {/* Quiet Nature Site */}
                    <LegendRow
                        dot={<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E', flexShrink: 0 }} />}
                        label="Quiet Nature Site"
                    />
                    {/* Busy Area */}
                    <LegendRow
                        dot={<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px #eab308', flexShrink: 0 }} />}
                        label="Busy Nature Area"
                    />
                    {/* Green Route */}
                    <LegendRow
                        dot={
                            <div style={{ width: 28, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #22C55E, #16a34a)', boxShadow: '0 0 6px #22C55E60', flexShrink: 0 }} />
                        }
                        label="Green Route"
                    />
                    {/* EV Charging – YELLOW */}
                    <LegendRow
                        dot={
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a1200', border: '2px solid #FACC15', boxShadow: '0 0 7px #FACC1570', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="#FACC15"><path d="M11.67 3.87L9.9 2 3.54 8.36 7.9 12.72 4.27 16.36 7.09 19.18 20.66 5.6z" /></svg>
                            </div>
                        }
                        label="EV Charging Station"
                    />
                    {/* Eco Business */}
                    <LegendRow
                        dot={
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1e1b4b', border: '2px solid #818cf8', boxShadow: '0 0 7px #818cf860', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            </div>
                        }
                        label="Eco Business"
                    />
                    {/* Start / End */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />
                    <LegendRow
                        dot={<div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #0d1117', flexShrink: 0 }} />}
                        label="Trip Start"
                    />
                    <LegendRow
                        dot={<div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', border: '2px solid #0d1117', flexShrink: 0 }} />}
                        label="Trip End"
                    />
                </div>

                {/* EV Count badge */}
                {chargingStations.length > 0 && (
                    <div style={{
                        position: 'absolute', top: 16, right: 70, zIndex: 20,
                        background: '#1a1200', border: '1.5px solid #FACC15',
                        borderRadius: 20, padding: '6px 14px',
                        boxShadow: '0 0 14px #FACC1540',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <BatteryCharging size={13} color="#FACC15" />
                        <span style={{ color: '#FACC15', fontSize: 11, fontWeight: 700 }}>
                            {chargingStations.length} EV Stations Found
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Reusable Legend Row ── */
const LegendRow = ({ dot, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
        {dot}
        <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 500 }}>{label}</span>
    </div>
);

export default TripPlanner;
