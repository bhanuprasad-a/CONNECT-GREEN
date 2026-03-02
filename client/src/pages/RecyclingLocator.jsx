import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Leaf, MapPin, Search, Navigation, Recycle, Battery, Trash, Laptop, Clock, Phone, Map as MapIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MOCK_CENTERS = [
    { id: 'm1', name: 'Downtown Eco Drop', lat: 40.7128, lng: -74.0060, acceptedWaste: ['plastic', 'glass', 'paper'], operatingHours: { open: '08:00', close: '18:00' }, isOpen: true, address: '123 Green Ave' },
    { id: 'm2', name: 'TechCycle Solutions', lat: 40.7158, lng: -74.0080, acceptedWaste: ['e-waste', 'batteries'], operatingHours: { open: '09:00', close: '17:00' }, isOpen: true, address: '45 Silicon Blvd' },
    { id: 'm3', name: 'City Scrap & Metal', lat: 40.7108, lng: -74.0040, acceptedWaste: ['metal', 'plastic'], operatingHours: { open: '07:00', close: '20:00' }, isOpen: false, address: '88 Industrial Way' }
];

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

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

const WASTE_TYPES = ['plastic', 'e-waste', 'glass', 'paper', 'batteries', 'metal', 'organic'];

const getWasteIcon = (type) => {
    switch (type) {
        case 'e-waste': case 'batteries': return <Laptop size={14} className="text-blue-400" />;
        case 'glass': return <Recycle size={14} className="text-teal-400" />;
        case 'metal': return <Trash size={14} className="text-gray-400" />;
        default: return <Leaf size={14} className="text-neonGreen" />;
    }
};

const RecyclingLocator = () => {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    const hasValidKey = Boolean(API_KEY && API_KEY.trim() !== "");

    const [centers, setCenters] = useState(MOCK_CENTERS);
    const [filteredCenters, setFilteredCenters] = useState(MOCK_CENTERS);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [userLocation, setUserLocation] = useState(defaultCenter);
    const [activeCenter, setActiveCenter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(13);

    // Get real centers from API if possible
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setIsLoading(true);
                const res = await api.get('/recycling');
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setCenters(res.data);
                    setFilteredCenters(res.data);
                }
            } catch (err) {
                console.log('Failed to fetch from API, using mock data.', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCenters();
    }, []);

    // Request Geolocation
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            toast.loading('Locating...', { id: 'geo' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(newLoc);
                    setZoom(14);
                    toast.success('Location found!', { id: 'geo' });
                },
                (error) => {
                    toast.error('Could not get location. Ensure permissions are granted.', { id: 'geo' });
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    // Filter Logic
    useEffect(() => {
        if (selectedFilters.length === 0) {
            setFilteredCenters(centers);
        } else {
            setFilteredCenters(centers.filter(center =>
                center.acceptedWaste.some(waste => selectedFilters.includes(waste))
            ));
        }
    }, [selectedFilters, centers]);

    const toggleFilter = (waste) => {
        if (selectedFilters.includes(waste)) {
            setSelectedFilters(selectedFilters.filter(f => f !== waste));
        } else {
            setSelectedFilters([...selectedFilters, waste]);
        }
    };

    return (
        <div className="flex bg-darkBg overflow-hidden flex-col lg:flex-row" style={{ height: 'calc(100vh - 73px)' }}>

            {/* LEFT PANEL: 35% */}
            <div className="w-full lg:w-[35%] h-1/2 lg:h-full bg-deepCard border-r border-stone-800 flex flex-col z-10 shadow-xl overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="p-5 border-b border-stone-800 sticky top-0 bg-deepCard/95 backdrop-blur-md z-20">
                    <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                        <Recycle className="text-neonGreen" /> Find Nearby Drop-offs
                    </h2>
                    <p className="text-sm text-stone-400 mb-4">Locate smart recycling centers near you based on waste type.</p>

                    <button
                        onClick={handleGetLocation}
                        className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded border border-stone-700 hover:border-neonGreen transition-colors flex justify-center items-center gap-2 mb-4"
                    >
                        <Navigation size={16} className="text-neonGreen" /> Use My Current Location
                    </button>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {WASTE_TYPES.map(waste => (
                            <button
                                key={waste}
                                onClick={() => toggleFilter(waste)}
                                className={`px-3 py-1.5 border transition-all rounded-full text-xs font-semibold flex items-center gap-1 capitalize shadow-sm ${selectedFilters.includes(waste)
                                    ? 'bg-neonGreen text-darkBg border-neonGreen shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                    : 'bg-stone-800/50 text-stone-300 border-stone-700 hover:border-stone-500'
                                    }`}
                            >
                                {waste}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List View */}
                <div className="p-4 flex-grow">
                    <h3 className="text-stone-300 font-semibold mb-4 text-sm flex items-center justify-between">
                        <span>{filteredCenters.length} Centers Found</span>
                        {selectedFilters.length > 0 && <span onClick={() => setSelectedFilters([])} className="text-neonGreen cursor-pointer text-xs">Clear Filters</span>}
                    </h3>

                    <div className="space-y-4 pb-10">
                        {filteredCenters.length === 0 ? (
                            <div className="text-center py-10 border border-stone-800 border-dashed rounded-lg">
                                <Recycle className="mx-auto text-stone-600 mb-3" size={32} />
                                <p className="text-stone-400 text-sm">No centers found matching those filters.</p>
                            </div>
                        ) : (
                            filteredCenters.map(center => (
                                <div
                                    key={center.id || center._id}
                                    className={`bg-darkBg p-4 rounded-lg border flex flex-col gap-3 transition-colors cursor-pointer group ${activeCenter === center ? 'border-neonGreen shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-stone-900' : 'border-stone-800 hover:border-stone-600'}`}
                                    onClick={() => {
                                        setActiveCenter(center);
                                        setUserLocation({ lat: center.lat || center.location?.coordinates[1] || defaultCenter.lat, lng: center.lng || center.location?.coordinates[0] || defaultCenter.lng });
                                        setZoom(15);
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white text-base group-hover:text-neonGreen transition-colors">{center.name}</h4>
                                        <span className={`text-[10px] px-2 py-1 rounded-sm font-bold tracking-wider uppercase ${center.isOpen ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-500 border border-red-800'}`}>
                                            {center.isOpen ? 'Open Now' : 'Closed'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                                        <MapPin size={12} className="text-stone-500" /> {center.address || 'Address unavailable'}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                                        <Clock size={12} className="text-stone-500" /> {center.operatingHours?.open} - {center.operatingHours?.close}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {center.acceptedWaste.map(waste => (
                                            <span key={waste} className="bg-stone-800 border border-stone-700 px-2 py-0.5 rounded text-[10px] text-stone-300 flex items-center gap-1 capitalize">
                                                {getWasteIcon(waste)} {waste}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: MAP 65% */}
            <div className="w-full lg:w-[65%] h-1/2 lg:h-full relative border-t lg:border-t-0 lg:border-l border-neonGreen/30">
                {!hasValidKey ? (
                    <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22C55E 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                        <MapIcon size={56} className="text-stone-600 mb-6 relative z-10" />
                        <h3 className="text-2xl font-display font-bold text-white mb-2 relative z-10">Map Services Offline</h3>
                        <p className="text-stone-400 text-sm max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
                            Google Maps integration requires a valid API key. You are currently viewing the platform in development mode. Please insert a real API key in the source code to unlock the full interactive mapping experience.
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
                                zoom={zoom}
                                onZoomChanged={e => setZoom(e.detail.zoom)}
                                center={userLocation}
                                onCenterChanged={e => setUserLocation(e.detail.center)}
                                mapId="DEMO_MAP_ID_RECYCLING"
                                disableDefaultUI={true}
                                zoomControl={true}
                                colorScheme={'DARK'}
                            >
                                {/* User Location Pin */}
                                {userLocation !== defaultCenter && (
                                    <AdvancedMarker position={userLocation}>
                                        <Pin background={'#3b82f6'} borderColor={'#1d4ed8'} glyphColor={'#eff6ff'} />
                                    </AdvancedMarker>
                                )}

                                {/* Interactive Pins for Centers */}
                                {filteredCenters.map(center => {
                                    const lat = center.lat || center.location?.coordinates[1] || 0;
                                    const lng = center.lng || center.location?.coordinates[0] || 0;

                                    return (
                                        <AdvancedMarker key={center.id || center._id} position={{ lat, lng }}>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveCenter(center);
                                                }}
                                                className="cursor-pointer group relative -translate-x-1/2 -translate-y-1/2"
                                            >
                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-darkBg border-[3px] border-darkBg shadow-xl transition-all ${activeCenter === center ? 'bg-white scale-125 z-50' : (center.isOpen ? 'bg-neonGreen hover:bg-accentGreen' : 'bg-stone-500 hover:bg-stone-400')}`}>
                                                    <Recycle size={18} className={activeCenter === center ? 'text-neonGreen' : 'text-darkBg'} />
                                                </div>

                                                {/* Status Dot */}
                                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-darkBg ${center.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                                {/* Map Tooltip on hover/active */}
                                                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-deepCard text-white w-48 p-2 rounded shadow-2xl transition-all pointer-events-none border border-stone-700 font-semibold z-[60] origin-bottom ${activeCenter === center ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                                    <p className="text-xs font-bold text-center border-b border-stone-700 pb-1 mb-1 truncate">{center.name}</p>
                                                    <p className="text-[10px] text-stone-400 text-center">{center.address}</p>
                                                    <p className={`text-[9px] text-center mt-1 uppercase font-bold tracking-widest ${center.isOpen ? 'text-neonGreen' : 'text-red-500'}`}>
                                                        {center.isOpen ? 'Open' : 'Closed'}
                                                    </p>
                                                </div>
                                            </div>
                                        </AdvancedMarker>
                                    );
                                })}
                            </Map>
                        </div>
                    </APIProvider>
                )}
            </div>
        </div>
    );
};

export default RecyclingLocator;
