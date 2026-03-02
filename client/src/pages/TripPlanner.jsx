import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Leaf, MapPin, Calculator, Search, Calendar, BadgeCheck, Utensils, Hotel, Bus, Route, Map as MapIcon } from 'lucide-react';
import toast from 'react-hot-toast';



const center = {
    lat: 40.7128,
    lng: -74.0060
};

// Map dark theme
const mapOptions = {
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    ],
    disableDefaultUI: true,
    zoomControl: true,
};

const TripPlanner = () => {
    const [businesses, setBusinesses] = useState([]);
    const [natureSites, setNatureSites] = useState([]);
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    const hasValidKey = Boolean(API_KEY && API_KEY.trim() !== "");

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const businessRes = await api.get('/businesses');
                const sitesRes = await api.get('/sites');

                if (businessRes.data) setBusinesses(businessRes.data);
                if (sitesRes.data) setNatureSites(sitesRes.data);
            } catch (error) {
                console.error("Error fetching map data:", error);
                toast.error("Failed to load live map locations.");
            }
        };

        fetchMapData();
    }, []);

    const [map, setMap] = useState(null);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [distanceCO2, setDistanceCO2] = useState(0);
    const [activeTab, setActiveTab] = useState('plan'); // plan, route, stats
    const [selectedItems, setSelectedItems] = useState([]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const toggleItem = (item) => {
        if (selectedItems.find(i => i.id === item.id)) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
            toast.success(`Added ${item.name} to trip plan!`);
        }
    };

    const handleCalculateRoute = () => {
        if (origin && destination) {
            // Mock Distance logic for demo presentation based on string interactions
            const dist = (origin.length * destination.length * 15) + 300;
            const emission = Math.floor(dist * 0.15); // Baseline traditional transport emission
            setDistanceCO2(emission);
            setActiveTab('stats');
            toast.success(`Route distance calculated! Baseline footprint: ${emission}kg CO2`);
        } else {
            toast.error("Please enter both Origin and Destination.");
        }
    };

    const calculatedSavings = selectedItems.reduce((acc, curr) => acc + (curr.co2Save || 0), 0);
    const netFootprint = distanceCO2 > 0 ? Math.max(0, distanceCO2 - calculatedSavings) : 0;

    return (
        <div className="flex bg-darkBg overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>

            {/* LEFT PANEL: 35% */}
            <div className="w-full lg:w-[35%] h-full bg-deepCard border-r border-stone-800 flex flex-col z-10 shadow-xl overflow-y-auto custom-scrollbar">

                {/* Header / Tabs */}
                <div className="p-4 border-b border-stone-800 sticky top-0 bg-deepCard/95 backdrop-blur-md z-20">
                    <h2 className="text-xl font-display font-bold text-white mb-3 flex items-center gap-2">
                        <Leaf className="text-neonGreen" /> Green Planner
                    </h2>

                    <div className="flex bg-darkBg rounded-lg overflow-hidden border border-stone-800">
                        <button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'plan' ? 'bg-neonGreen text-darkBg' : 'text-stone-400 hover:text-white'}`}>
                            Plan
                        </button>
                        <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'stats' ? 'bg-neonGreen text-darkBg' : 'text-stone-400 hover:text-white'}`}>
                            Footprint
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 flex-grow">
                    {activeTab === 'plan' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Search */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-stone-400 uppercase tracking-wider mb-2 block font-semibold">Origin (From)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="E.g. Los Angeles..."
                                            value={origin}
                                            onChange={(e) => setOrigin(e.target.value)}
                                            className="w-full bg-darkBg border border-stone-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-stone-600 focus:outline-none focus:border-neonGreen"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-stone-400 uppercase tracking-wider mb-2 block font-semibold">Destination (To)</label>
                                    <div className="relative flex gap-2">
                                        <div className="relative flex-1">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neonGreen" size={18} />
                                            <input
                                                type="text"
                                                placeholder="E.g. New York City..."
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                className="w-full bg-darkBg border border-stone-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-stone-600 focus:outline-none focus:border-neonGreen"
                                                onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
                                            />
                                        </div>
                                        <button onClick={handleCalculateRoute} className="bg-neonGreen text-darkBg px-4 rounded hover:bg-accentGreen transition-colors flex items-center justify-center font-bold" title="Calculate Route CO2">
                                            <Route size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div>
                                <label className="text-xs text-stone-400 uppercase tracking-wider mb-3 block font-semibold">Green Filters</label>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-stone-800 border-stone-700 border hover:border-neonGreen transition-colors rounded-full text-xs cursor-pointer flex items-center gap-1 text-white"><Hotel size={12} /> Accommodation</span>
                                    <span className="px-3 py-1.5 bg-stone-800 border-stone-700 border hover:border-neonGreen transition-colors rounded-full text-xs cursor-pointer flex items-center gap-1 text-white"><Utensils size={12} /> Food</span>
                                    <span className="px-3 py-1.5 bg-stone-800 border-stone-700 border hover:border-neonGreen transition-colors rounded-full text-xs cursor-pointer flex items-center gap-1 text-white"><Bus size={12} /> Transit</span>
                                </div>
                            </div>

                            {/* Mock Results */}
                            <div className="space-y-4 pt-4 border-t border-stone-800">
                                <h3 className="text-stone-300 font-semibold mb-2">Recommended in Area</h3>

                                {businesses.map(biz => (
                                    <div key={biz._id || biz.id} className="bg-darkBg p-4 rounded-lg border border-stone-800 flex justify-between items-center hover:border-neonGreen/50 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-white">{biz.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <BadgeCheck size={14} className="text-neonGreen" />
                                                <span className="text-xs text-stone-400">{biz.badge} Verified</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleItem(biz)}
                                            className={`p-2 rounded-full transition-colors ${selectedItems.find(i => (i._id || i.id) === (biz._id || biz.id)) ? 'bg-neonGreen text-darkBg' : 'bg-stone-800 text-neonGreen hover:bg-stone-700'}`}
                                        >
                                            <Calculator size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">

                            {distanceCO2 === 0 ? (
                                <div className="py-12 border border-stone-800 border-dashed rounded-xl">
                                    <Route size={40} className="text-stone-600 mx-auto mb-4" />
                                    <p className="text-stone-400 italic text-sm">Enter origin and destination then smash calculate to see Baseline CO2 emissions.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-40 h-40 mx-auto bg-darkBg border-4 border-neonGreen rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] relative">
                                        {netFootprint === 0 && <span className="absolute -top-3 bg-neonGreen text-darkBg text-xs font-bold px-3 py-1 pb-1 rounded-full uppercase">Carbon Neutral!</span>}
                                        <span className="text-4xl font-display font-bold text-white">{netFootprint}</span>
                                        <span className="text-sm text-neonGreen font-semibold uppercase tracking-wider">Net kg CO2</span>
                                    </div>

                                    <div className="w-full text-center">
                                        <h3 className="text-xl font-semibold text-white mb-2">Carbon Savings Breakdown</h3>
                                        <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                                            Base Travel Emission: <b className="text-white block sm:inline">{distanceCO2} kg</b><br className="hidden sm:block" />
                                            Green Offset: <span className="text-neonGreen font-bold block sm:inline">-{calculatedSavings} kg</span><br />
                                            <span className="text-xs text-stone-500 pt-3 block border-t border-stone-800 mt-3">By choosing us, you offset the equivalent of {Math.floor(calculatedSavings / 10)} trees planted!</span>
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="pt-6 border-t border-stone-800 w-full text-left">
                                <h4 className="text-sm font-semibold text-stone-300 mb-3">Your Itinerary</h4>
                                {selectedItems.length === 0 ? (
                                    <p className="text-xs text-stone-500 italic">No sustainable options selected yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedItems.map(item => (
                                            <li key={item._id || item.id} className="flex justify-between items-center text-sm">
                                                <span className="text-stone-300">{item.name}</span>
                                                <span className="text-neonGreen">-{item.co2Save} kg</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-stone-800 mt-auto bg-deepCard">
                    <button className="w-full py-3 bg-neonGreen text-darkBg font-bold rounded shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-accentGreen transition-colors flex items-center justify-center gap-2">
                        <Calendar size={18} /> Save Green Itinerary
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL: MAP 65% */}
            <div className="hidden lg:block lg:w-[65%] h-full relative border-l border-neonGreen/30">
                {!hasValidKey ? (
                    <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22C55E 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                        <MapIcon size={56} className="text-stone-600 mb-6 relative z-10" />
                        <h3 className="text-2xl font-display font-bold text-white mb-2 relative z-10">Interactive Routing Offline</h3>
                        <p className="text-stone-400 text-sm max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
                            Google Maps routing requires a valid API key. You are currently viewing the platform in development mode. Please insert a real API key in the source code to unlock the full map and pathing experience.
                        </p>
                        <button onClick={() => toast.error('Please insert a valid Google Maps API Key.')} className="bg-stone-800 border border-stone-700 hover:bg-stone-700 px-6 py-2.5 rounded text-white font-semibold transition-all relative z-10 text-sm shadow-md">
                            Connect API Key
                        </button>
                    </div>
                ) : (
                    <APIProvider apiKey={API_KEY}>
                        <div className="w-full h-full">
                            <Map
                                defaultZoom={13}
                                defaultCenter={center}
                                mapId="DEMO_MAP_ID"
                                disableDefaultUI={true}
                                zoomControl={true}
                                colorScheme={'DARK'}
                            >
                                {/* Map overlay content indicating Nature Site traffic load */}
                                {natureSites.map(site => {
                                    const lat = site.lat || site.location?.coordinates[1] || 0;
                                    const lng = site.lng || site.location?.coordinates[0] || 0;
                                    return (
                                        <AdvancedMarker key={site._id || site.id} position={{ lat, lng }}>
                                            <div className={`flex items-center gap-2 bg-darkBg border p-2 rounded-full shadow-lg ${site.status === 'green' ? 'border-neonGreen' : 'border-yellow-500'}`}>
                                                <div className={`w-3 h-3 rounded-full animate-pulse ${site.status === 'green' ? 'bg-neonGreen shadow-[0_0_8px_#22C55E]' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`}></div>
                                                <span className="text-xs font-bold text-white pr-2">{site.name}</span>
                                            </div>
                                        </AdvancedMarker>
                                    );
                                })}

                                {/* Interactive Pins for Businesses */}
                                {businesses.map(biz => {
                                    const lat = biz.lat || biz.location?.coordinates[1] || 0;
                                    const lng = biz.lng || biz.location?.coordinates[0] || 0;
                                    return (
                                        <AdvancedMarker key={biz._id || biz.id} position={{ lat, lng }}>
                                            <div onClick={() => toggleItem(biz)} className="cursor-pointer group relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-darkBg ${selectedItems.find(i => (i._id || i.id) === (biz._id || biz.id)) ? 'bg-neonGreen' : 'bg-stone-600 group-hover:bg-primaryGreen'} transition-all shadow-xl`}>
                                                    {biz.type === 'hotel' ? <Hotel size={18} /> : biz.type === 'transport' ? <Bus size={18} /> : <Utensils size={18} />}
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-deepCard text-white text-xs whitespace-nowrap px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-stone-700 font-semibold z-50">
                                                    {biz.name} <span className="text-neonGreen block mt-1">-{biz.co2Save} kg CO2</span>
                                                </div>
                                            </div>
                                        </AdvancedMarker>
                                    );
                                })}
                            </Map>
                        </div>
                    </APIProvider>
                )}

                {/* Floating Map Legend */}
                <div className="absolute top-6 left-6 z-10 bg-darkBg/90 backdrop-blur border border-stone-800 p-4 rounded-lg shadow-xl">
                    <h4 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-3">Map Legend</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neonGreen"></div> <span className="text-xs text-white">Quiet Nature Site</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> <span className="text-xs text-white">Busy Area</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> <span className="text-xs text-white">Over-capacity</span></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TripPlanner;
