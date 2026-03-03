import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Leaf, MapPin, Calculator, Search, Calendar, BadgeCheck, Utensils, Hotel, Bus, Route, Map as MapIcon, Train, Plane, Bike, Car, BatteryCharging } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

const EMISSION_RATES = {
    airplane: 0.285,
    car: 0.192,
    motorcycle: 0.103, // bike
    bus: 0.068,
    ev: 0.050,
    train: 0.041,
    cycling: 0,
    walking: 0
};

const TripPlannerInner = ({ hasValidKey, API_KEY }) => {
    const [businesses, setBusinesses] = useState([]);
    const [natureSites, setNatureSites] = useState([]);

    const [userLocation, setUserLocation] = useState(defaultCenter);
    const [zoom, setZoom] = useState(13);
    const mapRef = useRef(null);

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

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [distanceCO2, setDistanceCO2] = useState(0);
    const [activeTab, setActiveTab] = useState('plan'); // plan, route, stats
    const [selectedItems, setSelectedItems] = useState([]);

    // new states
    const [routeDetails, setRouteDetails] = useState(null);
    const [chargingStations, setChargingStations] = useState([]);
    const [routeGeojson, setRouteGeojson] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);

    const toggleItem = (item) => {
        if (selectedItems.find(i => i.id === item.id || i._id === item._id)) {
            setSelectedItems(selectedItems.filter(i => (i.id || i._id) !== (item.id || item._id)));
        } else {
            setSelectedItems([...selectedItems, item]);
            toast.success(`Added ${item.name} to trip plan!`);
        }
    };

    const handleSaveItinerary = async () => {
        if (!routeDetails) {
            toast.error("Please calculate a route first before saving.");
            return;
        }
        try {
            toast.loading("Saving your green itinerary...", { id: "save-trip" });
            const payload = {
                title: `${origin} to ${destination} via Green Route`,
                origin: startLocation,
                destination: endLocation,
                distance: routeDetails.distanceKm,
                carbonSavings: calculatedSavings,
                status: 'planned'
            };
            await api.post('/trips', payload);
            toast.success("Green Itinerary successfully saved to your profile!", { id: "save-trip" });
        } catch (error) {
            console.error("Failed to save trip", error);
            toast.error("Failed to save your itinerary.", { id: "save-trip" });
        }
    };

    const handleCalculateRoute = async () => {
        if (!origin || !destination) {
            toast.error("Please enter both Origin and Destination.");
            return;
        }

        try {
            toast.loading("Calculating exact route...", { id: "routing" });
            const originRes = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(origin)}&api_key=${API_KEY}`);
            const originData = await originRes.json();

            const destRes = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(destination)}&api_key=${API_KEY}`);
            const destData = await destRes.json();

            if (!originData.geocodingResults?.length) throw new Error(`Could not find location: ${origin}`);
            if (!destData.geocodingResults?.length) throw new Error(`Could not find location: ${destination}`);

            const originLoc = originData.geocodingResults[0].geometry.location;
            const destLoc = destData.geocodingResults[0].geometry.location;

            setStartLocation(originLoc);
            setEndLocation(destLoc);

            const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${originLoc.lng},${originLoc.lat};${destLoc.lng},${destLoc.lat}?overview=full&geometries=geojson`);
            const osrmData = await osrmRes.json();

            if (osrmData.code !== 'Ok') throw new Error("No driving route found between these locations.");

            const route = osrmData.routes[0];
            const distKm = route.distance / 1000;

            // Generate mock EV Charging Stations along the route
            const coords = route.geometry.coordinates;
            const evStations = [];
            const numStations = Math.max(1, Math.floor(distKm / 80)); // Roughly 1 charging station every 80 km
            if (numStations > 0 && coords.length > 5) {
                const step = Math.max(1, Math.floor(coords.length / (numStations + 1)));
                for (let i = 1; i <= numStations; i++) {
                    const idx = step * i;
                    if (coords[idx]) {
                        evStations.push({
                            id: `ev-${i}`,
                            lng: coords[idx][0],
                            lat: coords[idx][1]
                        });
                    }
                }
            }
            setChargingStations(evStations);

            setRouteGeojson({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: route.geometry
                }]
            });

            // Adjust view boundaries dynamically with smooth flyTo animation
            if (mapRef.current && route.geometry.coordinates.length > 0) {
                const bounds = route.geometry.coordinates.reduce((acc, coord) => [
                    [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
                    [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
                ], [[route.geometry.coordinates[0][0], route.geometry.coordinates[0][1]], [route.geometry.coordinates[0][0], route.geometry.coordinates[0][1]]]);

                mapRef.current.fitBounds(bounds, {
                    padding: 80,
                    duration: 2500,
                    essential: true
                });
            } else {
                setUserLocation({ lat: originLoc.lat, lng: originLoc.lng });
                setZoom(8);
            }

            const emissions = {
                airplane: distKm * EMISSION_RATES.airplane,
                car: distKm * EMISSION_RATES.car,
                motorcycle: distKm * EMISSION_RATES.motorcycle,
                bus: distKm * EMISSION_RATES.bus,
                ev: distKm * EMISSION_RATES.ev,
                train: distKm * EMISSION_RATES.train,
                cycling: distKm * EMISSION_RATES.cycling,
                walking: distKm * EMISSION_RATES.walking,
            };

            setDistanceCO2(emissions.car);
            setRouteDetails({
                distanceKm: distKm,
                distanceText: `${distKm.toFixed(1)} km`,
                durationText: `${Math.ceil(route.duration / 60)} mins`,
                emissions,
            });
            setActiveTab('stats');
            toast.success(`Green Route Calculated! Baseline footprint: ${Math.floor(emissions.car)}kg CO2`, { id: "routing" });
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to calculate route.", { id: "routing" });
        }
    };

    const calculatedSavings = selectedItems.reduce((acc, curr) => acc + (curr.co2Save || 0), 0);
    const netFootprint = distanceCO2 > 0 ? Math.max(0, distanceCO2 - calculatedSavings) : 0;

    const getRecommendation = () => {
        if (!routeDetails) return null;
        if (routeDetails.distanceKm < 5) return "Walking or Cycling is actively recommended for this short distance. Zero emissions!";
        if (routeDetails.distanceKm < 30) return "Cycling is highly recommended here, but taking an EV or Bus are excellent clean alternatives.";
        if (routeDetails.distanceKm < 400) return "Taking the Train or Bus are fantastic high-efficiency clean references for this route compared to driving or flying. Opt for EV with charging stops if driving is required.";
        return "A Train is strongly recommended over an Airplane for long distances, drastically reducing carbon output.";
    };

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
                            Carbon Tracker
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
                            {distanceCO2 === 0 || !routeDetails ? (
                                <div className="py-12 border border-stone-800 border-dashed rounded-xl">
                                    <Route size={40} className="text-stone-600 mx-auto mb-4" />
                                    <p className="text-stone-400 italic text-sm">Enter origin and destination then smash calculate to see Baseline CO2 emissions.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-40 h-40 mx-auto bg-darkBg border-4 border-neonGreen rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] relative">
                                        {netFootprint === 0 && <span className="absolute -top-3 bg-neonGreen text-darkBg text-xs font-bold px-3 py-1 pb-1 rounded-full uppercase">Carbon Neutral!</span>}
                                        <span className="text-4xl font-display font-bold text-white">{Math.floor(netFootprint)}</span>
                                        <span className="text-sm text-neonGreen font-semibold uppercase tracking-wider">Net kg CO2</span>
                                    </div>

                                    <div className="bg-darkBg p-4 rounded-lg border border-stone-800 text-left">
                                        <h4 className="text-neonGreen font-semibold flex items-center gap-2 mb-2">
                                            <Leaf size={16} /> Travel Recommendation
                                        </h4>
                                        <p className="text-sm text-stone-300 leading-relaxed">
                                            {getRecommendation()}
                                        </p>
                                    </div>

                                    <div className="w-full text-left">
                                        <h3 className="text-md font-semibold text-white mb-3">Carbon Tracker: Modes Comparison</h3>
                                        <p className="text-xs text-stone-500 mb-4">Emissions based on {routeDetails.distanceText} trip.</p>

                                        <div className="space-y-3">
                                            {[
                                                { mode: 'Airplane', val: routeDetails.emissions.airplane, icon: <Plane size={16} />, color: 'bg-red-500' },
                                                { mode: 'Car (Driver alone)', val: routeDetails.emissions.car, icon: <Car size={16} />, color: 'bg-orange-500' },
                                                { mode: 'Motorcycle', val: routeDetails.emissions.motorcycle, icon: <Bike size={16} />, color: 'bg-yellow-500' },
                                                { mode: 'Bus', val: routeDetails.emissions.bus, icon: <Bus size={16} />, color: 'bg-lime-500' },
                                                { mode: 'EV Vehicle', val: routeDetails.emissions.ev, icon: <BatteryCharging size={16} />, color: 'bg-neonGreen' },
                                                { mode: 'Train', val: routeDetails.emissions.train, icon: <Train size={16} />, color: 'bg-green-600' },
                                            ].map(item => (
                                                <div key={item.mode} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-xs text-stone-300">
                                                        <span className="flex items-center gap-1">{item.icon} {item.mode}</span>
                                                        <span>{Math.floor(item.val)} kg</span>
                                                    </div>
                                                    <div className="w-full bg-stone-800 rounded-full h-1.5">
                                                        <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, (item.val / Math.max(...Object.values(routeDetails.emissions))) * 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs text-stone-300 pt-2 border-t border-stone-800">
                                                <span className="flex items-center gap-1 text-neonGreen font-bold"><Leaf size={16} /> Walking / Cycling</span>
                                                <span className="text-neonGreen font-bold">0 kg</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-stone-800 w-full text-left">
                                        <h4 className="text-sm font-semibold text-stone-300 mb-3">Eco-friendly Businesses Chosen</h4>
                                        {selectedItems.length === 0 ? (
                                            <p className="text-xs text-stone-500 italic">No sustainable options selected yet.</p>
                                        ) : (
                                            <ul className="space-y-2 mb-4">
                                                {selectedItems.map(item => (
                                                    <li key={item._id || item.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-stone-300">{item.name}</span>
                                                        <span className="text-neonGreen">-{item.co2Save} kg</span>
                                                    </li>
                                                ))}
                                                <li className="flex justify-between items-center text-sm font-bold pt-2 border-t border-stone-800">
                                                    <span className="text-white">Total Mitigated:</span>
                                                    <span className="text-neonGreen">-{calculatedSavings} kg</span>
                                                </li>
                                            </ul>
                                        )}

                                        {netFootprint > 0 && (
                                            <div className="mt-6 bg-neonGreen/10 border border-neonGreen/30 p-4 rounded-xl">
                                                <p className="text-xs text-stone-300 mb-3">You still have a <span className="text-white font-bold">{Math.floor(netFootprint)}kg</span> carbon footprint for this trip.</p>
                                                <Link
                                                    to="/offset"
                                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-neonGreen text-darkBg font-bold rounded text-sm hover:scale-[1.02] transition-transform"
                                                >
                                                    <Leaf size={14} /> Neutralize Now
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-stone-800 mt-auto bg-deepCard">
                    <button onClick={handleSaveItinerary} className="w-full py-3 bg-neonGreen text-darkBg font-bold rounded shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-accentGreen transition-colors flex items-center justify-center gap-2">
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
                            Ola Maps routing requires a valid API key. You are currently viewing the platform in development mode. Please insert a real API key in the source code to unlock the full map and pathing experience.
                        </p>
                        <button onClick={() => toast.error('Please insert a valid Ola Maps API Key.')} className="bg-stone-800 border border-stone-700 hover:bg-stone-700 px-6 py-2.5 rounded text-white font-semibold transition-all relative z-10 text-sm shadow-md">
                            Connect API Key
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <Map
                            ref={mapRef}
                            initialViewState={{ longitude: userLocation.lng, latitude: userLocation.lat, zoom }}
                            mapStyle={`https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?api_key=${API_KEY}`}
                            style={{ width: '100%', height: '100%' }}
                            transformRequest={(url, resourceType) => {
                                if (url.includes('olamaps.io') && !url.includes('api_key=')) {
                                    url = url + (url.includes('?') ? '&' : '?') + `api_key=${API_KEY}`;
                                }
                                return { url };
                            }}
                            onMove={evt => {
                                setZoom(evt.viewState.zoom);
                                setUserLocation({ lat: evt.viewState.latitude, lng: evt.viewState.longitude });
                            }}
                        >
                            {/* Map overlay content indicating Nature Site traffic load */}
                            {natureSites.map(site => {
                                const lat = site.lat || site.location?.coordinates?.[1] || 0;
                                const lng = site.lng || site.location?.coordinates?.[0] || 0;
                                return (
                                    <Marker key={site._id || site.id} longitude={lng} latitude={lat}>
                                        <div className={`flex items-center gap-2 bg-darkBg border p-2 rounded-full shadow-lg ${site.status === 'green' ? 'border-neonGreen' : 'border-yellow-500'}`}>
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${site.status === 'green' ? 'bg-neonGreen shadow-[0_0_8px_#22C55E]' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`}></div>
                                            <span className="text-xs font-bold text-white pr-2">{site.name}</span>
                                        </div>
                                    </Marker>
                                );
                            })}

                            {/* Route Polyline Layer */}
                            {routeGeojson && (
                                <Source id="route-source" type="geojson" data={routeGeojson}>
                                    <Layer
                                        id="route-layer"
                                        type="line"
                                        layout={{
                                            'line-join': 'round',
                                            'line-cap': 'round'
                                        }}
                                        paint={{
                                            'line-color': '#22C55E', // neonGreen
                                            'line-width': 8
                                        }}
                                    />
                                </Source>
                            )}

                            {/* Route EV Charging Pins */}
                            {chargingStations.map(station => (
                                <Marker key={station.id} longitude={station.lng} latitude={station.lat}>
                                    <div className="w-5 h-5 rounded-full bg-neonGreen flex items-center justify-center text-darkBg shadow-[0_0_10px_#22C55E]" title="EV Charging Station on Route">
                                        <BatteryCharging size={12} />
                                    </div>
                                </Marker>
                            ))}

                            {/* Origin & Destination Markers */}
                            {startLocation && (
                                <Marker longitude={startLocation.lng} latitude={startLocation.lat}>
                                    <MapPin className="text-neonGreen drop-shadow" size={32} />
                                </Marker>
                            )}
                            {endLocation && (
                                <Marker longitude={endLocation.lng} latitude={endLocation.lat}>
                                    <MapPin className="text-red-500 drop-shadow" size={32} />
                                </Marker>
                            )}

                            {/* Interactive Pins for Businesses */}
                            {businesses.map(biz => {
                                const lat = biz.lat || biz.location?.coordinates?.[1] || 0;
                                const lng = biz.lng || biz.location?.coordinates?.[0] || 0;
                                return (
                                    <Marker key={biz._id || biz.id} longitude={lng} latitude={lat}>
                                        <div onClick={(e) => { e.originalEvent.stopPropagation(); toggleItem(biz); }} className="cursor-pointer group relative -translate-x-1/2 -translate-y-1/2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-darkBg ${selectedItems.find(i => (i._id || i.id) === (biz._id || biz.id)) ? 'bg-neonGreen' : 'bg-stone-600 group-hover:bg-primaryGreen'} transition-all shadow-xl`}>
                                                {biz.type === 'hotel' ? <Hotel size={18} /> : biz.type === 'transport' ? <Bus size={18} /> : <Utensils size={18} />}
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-deepCard text-white text-xs whitespace-nowrap px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-stone-700 font-semibold z-50">
                                                {biz.name} <span className="text-neonGreen block mt-1">-{biz.co2Save} kg CO2</span>
                                            </div>
                                        </div>
                                    </Marker>
                                );
                            })}
                        </Map>
                    </div>
                )}

                {/* Floating Map Legend */}
                {hasValidKey && (
                    <div className="absolute top-6 left-6 z-10 bg-darkBg/90 backdrop-blur border border-stone-800 p-4 rounded-lg shadow-xl">
                        <h4 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-3">Map Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neonGreen"></div> <span className="text-xs text-white">Quiet Nature Site</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> <span className="text-xs text-white">Busy Area</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-neonGreen flex items-center justify-center text-darkBg"><BatteryCharging size={10} /></div> <span className="text-xs text-white">Route EV Charging</span></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TripPlanner = () => {
    const API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || "";
    const hasValidKey = Boolean(API_KEY && API_KEY.trim() !== "");

    return (
        <TripPlannerInner hasValidKey={hasValidKey} API_KEY={API_KEY} />
    );
};

export default TripPlanner;
