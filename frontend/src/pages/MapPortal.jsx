/**
 * MapPortal — VoyageAI Interactive Mission Navigation
 * Uses Leaflet (CDN), Nominatim, OSRM, Overpass APIs
 * Receives itinerary data via router state or URL param
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiArrowLeft, FiNavigation, FiSearch, FiX, FiMapPin, 
    FiCoffee, FiHeart, FiHome, FiMoon, FiSun, FiTarget,
    FiClock, FiTrendingUp, FiLoader, FiBookmark
} from 'react-icons/fi';
import { itineraryAPI } from '../services/api';

// ─── Custom Marker Icons ──────────────────────────────────────────────────────
const createNumberedIcon = (number, color = '#6366f1') => {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `
            <div style="
                width: 36px; height: 36px; 
                background: ${color}; 
                border: 3px solid white; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg);
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg); 
                    color: white; 
                    font-weight: 900; 
                    font-size: 13px;
                    font-family: Inter, sans-serif;
                ">${number}</span>
            </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
    });
};

const createPulsingIcon = (color = '#10b981') => {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `
            <div style="position: relative; width: 20px; height: 20px;">
                <div style="
                    position: absolute; inset: 0;
                    background: ${color}; border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 0 4px ${color}40;
                    animation: pulse 2s infinite;
                "></div>
            </div>
            <style>
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 ${color}60; }
                    70% { box-shadow: 0 0 0 12px transparent; }
                    100% { box-shadow: 0 0 0 0 transparent; }
                }
            </style>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const createCategoryIcon = (emoji, color) => {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `<div style="
            width: 32px; height: 32px;
            background: ${color};
            border: 2px solid white;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });
};

// ─── Main MapPortal Component ─────────────────────────────────────────────────
const MapPortal = () => {
    const { id } = useParams();
    const location = useLocation();

    // Map state
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markersLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const nearbyLayerRef = useRef(null);

    // UI state
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [error, setError] = useState('');
    const [itinerary, setItinerary] = useState(null);
    const [userCoords, setUserCoords] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
    const [savedPlaces, setSavedPlaces] = useState(() => {
        try { return JSON.parse(localStorage.getItem('voyage_saved') || '[]'); } 
        catch { return []; }
    });
    const [activeSaved, setActiveSaved] = useState(false);

    // Input state
    const [sourceInput, setSourceInput] = useState('');
    const [destInput, setDestInput] = useState('');
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);
    const [clickMode, setClickMode] = useState(null); // 'source' | 'dest' | null

    // ── Fetch itinerary if ID is provided ──────────────────────────────────────
    useEffect(() => {
        if (id) {
            itineraryAPI.getById(id)
                .then(res => {
                    setItinerary(res.data.itinerary);
                    const dest = res.data.itinerary?.plan_data?.destination_city 
                        || res.data.itinerary?.plan_data?.destination_name;
                    if (dest) setDestInput(dest);
                })
                .catch(() => setError('Could not load itinerary data.'));
        }
    }, [id]);

    // ── Initialize Leaflet Map ─────────────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        const L = window.L;
        if (!L) return;

        const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629], // India center default
            zoom: 5,
            zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer
        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap &copy; CartoDB',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        nearbyLayerRef.current = L.layerGroup().addTo(map);

        // Map click handler
        map.on('click', (e) => {
            if (clickMode === 'source') {
                setSourceCoords([e.latlng.lat, e.latlng.lng]);
                setSourceInput(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
                setClickMode(null);
            } else if (clickMode === 'dest') {
                setDestCoords([e.latlng.lat, e.latlng.lng]);
                setDestInput(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
                setClickMode(null);
            }
        });

        // Get user location
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                setUserCoords(coords);
                map.setView(coords, 13);
                userMarkerRef.current = L.marker(coords, { icon: createPulsingIcon('#10b981') })
                    .addTo(map)
                    .bindPopup('<b>📍 You are here</b>');
                setSourceCoords(coords);
                setSourceInput('My Location');
            },
            () => setError('Location access denied. Type your source manually.')
        );

        return () => { map.remove(); mapInstanceRef.current = null; };
    }, []);

    // ── Tile layer toggle (dark/light) ─────────────────────────────────────────
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const L = window.L;

        map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) map.removeLayer(layer);
        });

        L.tileLayer(
            isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { attribution: '&copy; OpenStreetMap', maxZoom: 19 }
        ).addTo(map);
    }, [isDark]);

    // ── Nominatim Autocomplete ─────────────────────────────────────────────────
    const fetchSuggestions = async (query, setter) => {
        if (query.length < 3) { setter([]); return; }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            setter(data);
        } catch { setter([]); }
    };

    // ── Geocode a place name ───────────────────────────────────────────────────
    const geocode = async (query) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
            );
            const data = await res.json();
            if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } catch {}
        return null;
    };

    // ── Draw Route via OSRM ────────────────────────────────────────────────────
    const drawRoute = async () => {
        setError('');
        setRouteInfo(null);

        let src = sourceCoords;
        let dst = destCoords;

        // Geocode if only text provided
        if (!src && sourceInput) {
            setLoadingMsg('Locating source...');
            setLoading(true);
            src = await geocode(sourceInput);
            if (src) setSourceCoords(src);
        }
        if (!dst && destInput) {
            setLoadingMsg('Locating destination...');
            dst = await geocode(destInput);
            if (dst) setDestCoords(dst);
        }
        setLoading(false);

        if (!src || !dst) {
            setError('Could not find one or both locations. Please refine your search.');
            return;
        }

        setLoading(true);
        setLoadingMsg('Computing optimal route...');

        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${src[1]},${src[0]};${dst[1]},${dst[0]}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.code !== 'Ok' || !data.routes?.[0]) {
                setError('No route found between these locations.');
                setLoading(false);
                return;
            }

            const route = data.routes[0];
            const distKm = (route.distance / 1000).toFixed(1);
            const durMin = Math.round(route.duration / 60);
            setRouteInfo({ distance: distKm, duration: durMin });

            const L = window.L;
            const map = mapInstanceRef.current;

            // Clear old route
            if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
            markersLayerRef.current.clearLayers();

            // Draw polyline
            routeLayerRef.current = L.geoJSON(route.geometry, {
                style: {
                    color: isDark ? '#818cf8' : '#6366f1',
                    weight: 5,
                    opacity: 0.85,
                    dashArray: null,
                }
            }).addTo(map);

            // Source marker
            L.marker(src, { icon: createPulsingIcon('#10b981') })
                .addTo(markersLayerRef.current)
                .bindPopup('<b>🚀 Origin</b>');

            // Destination marker
            L.marker(dst, { icon: createNumberedIcon('🏁', '#f43f5e') })
                .addTo(markersLayerRef.current)
                .bindPopup(`<b>📍 ${destInput}</b>`);

            // Fit bounds
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] });

            // If itinerary exists, place numbered mission markers
            if (itinerary?.plan_data?.days) {
                await plotMissionMarkers(dst);
            }
        } catch {
            setError('Route computation failed. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // ── Plot Numbered Mission Markers from Itinerary ───────────────────────────
    const plotMissionMarkers = async (centerCoords) => {
        const L = window.L;
        const map = mapInstanceRef.current;
        const days = itinerary.plan_data.days;
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
        let markerNum = 1;

        for (const day of days) {
            for (const act of (day.activities || [])) {
                const query = act.location 
                    ? `${act.location}, ${itinerary.plan_data.destination_city || itinerary.plan_data.destination_name}`
                    : itinerary.plan_data.destination_name;

                const coords = await geocode(query);
                if (coords) {
                    const color = colors[(markerNum - 1) % colors.length];
                    L.marker(coords, { icon: createNumberedIcon(markerNum, color) })
                        .addTo(markersLayerRef.current)
                        .bindPopup(`
                            <div style="font-family: Inter, sans-serif; min-width: 200px;">
                                <div style="background: ${color}; color: white; padding: 6px 10px; margin: -10px -10px 8px; border-radius: 4px 4px 0 0; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
                                    Mission ${markerNum} • Day ${day.day}
                                </div>
                                <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${act.activity}</div>
                                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${act.time}</div>
                                <div style="font-size: 11px; color: #475569;">${act.description}</div>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #6366f1;">Est. Cost: ₹${act.estimated_cost}</div>
                            </div>
                        `);
                    markerNum++;
                }
            }
        }
    };

    // ── Nearby Search via Overpass API ─────────────────────────────────────────
    const searchNearby = async (type) => {
        const center = destCoords || userCoords;
        if (!center) { setError('Set a destination first to search nearby.'); return; }

        const L = window.L;
        const configs = {
            restaurants: { amenity: 'restaurant', emoji: '🍽️', color: '#f59e0b', label: 'Restaurant' },
            hospitals:   { amenity: 'hospital',   emoji: '🏥', color: '#ef4444', label: 'Hospital' },
            hotels:      { tourism: 'hotel',       emoji: '🏨', color: '#3b82f6', label: 'Hotel' },
        };
        const cfg = configs[type];

        setLoading(true);
        setLoadingMsg(`Finding nearby ${type}...`);
        nearbyLayerRef.current.clearLayers();

        try {
            const radius = 5000;
            const key = cfg.amenity ? 'amenity' : 'tourism';
            const val = cfg.amenity || cfg.tourism;
            const query = `
                [out:json][timeout:15];
                node["${key}"="${val}"](around:${radius},${center[0]},${center[1]});
                out 15;`;

            const res = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`,
            });
            const data = await res.json();

            if (!data.elements?.length) {
                setError(`No ${type} found nearby.`);
                setLoading(false);
                return;
            }

            data.elements.forEach(el => {
                const name = el.tags?.name || cfg.label;
                L.marker([el.lat, el.lon], { icon: createCategoryIcon(cfg.emoji, cfg.color) })
                    .addTo(nearbyLayerRef.current)
                    .bindPopup(`
                        <div style="font-family: Inter, sans-serif;">
                            <div style="font-weight: 800; font-size: 13px;">${cfg.emoji} ${name}</div>
                            ${el.tags?.['addr:street'] ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">${el.tags['addr:street']}</div>` : ''}
                        </div>`);
            });

            mapInstanceRef.current.setView(center, 14);
        } catch {
            setError(`Failed to find nearby ${type}.`);
        } finally {
            setLoading(false);
        }
    };

    // ── Save Favorite Location ─────────────────────────────────────────────────
    const saveCurrentDest = () => {
        if (!destInput) return;
        const updated = [...savedPlaces, { name: destInput, coords: destCoords, time: new Date().toLocaleDateString() }];
        setSavedPlaces(updated);
        localStorage.setItem('voyage_saved', JSON.stringify(updated));
    };

    const clearAll = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
        markersLayerRef.current.clearLayers();
        nearbyLayerRef.current.clearLayers();
        setRouteInfo(null);
        setError('');
        setDestInput('');
        setDestCoords(null);
        setSourceSuggestions([]);
        setDestSuggestions([]);
    };

    const plan = itinerary?.plan_data;

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`fixed inset-0 z-[200] flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>

            {/* ── Full-screen Map ── */}
            <div ref={mapRef} className="absolute inset-0 z-0" style={{ cursor: clickMode ? 'crosshair' : 'grab' }} />

            {/* ── Click mode banner ── */}
            <AnimatePresence>
                {clickMode && (
                    <motion.div
                        initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
                        className="absolute top-0 left-0 right-0 z-20 bg-indigo-600 text-white text-center py-3 text-sm font-black uppercase tracking-widest"
                    >
                        🖱️ Click on the map to set {clickMode === 'source' ? 'SOURCE' : 'DESTINATION'} — Press ESC to cancel
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Top-Left Control Panel ── */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className={`absolute top-4 left-4 z-10 w-[340px] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
                    isDark ? 'bg-slate-900/95 text-white border border-white/10' : 'bg-white/95 text-slate-900 border border-slate-200'
                } backdrop-blur-xl`}
            >
                {/* Header */}
                <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <Link to={id ? `/itinerary/${id}` : '/'} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                            <FiArrowLeft size={16} />
                        </Link>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-indigo-400">VoyageAI</div>
                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {plan ? `Mission: ${plan.destination_name}` : 'Navigation Portal'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveSaved(s => !s)}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-amber-400"
                            title="Saved Places"
                        >
                            <FiBookmark size={16} />
                        </button>
                        <button
                            onClick={() => setIsDark(d => !d)}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                        </button>
                    </div>
                </div>

                {/* Inputs */}
                <div className="p-4 space-y-3">
                    {/* Source */}
                    <div className="relative">
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                            <input
                                type="text"
                                placeholder="From: Your location..."
                                value={sourceInput}
                                onChange={e => { setSourceInput(e.target.value); fetchSuggestions(e.target.value, setSourceSuggestions); setSourceCoords(null); }}
                                className={`flex-1 text-sm bg-transparent outline-none font-medium ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                            />
                            <button
                                onClick={() => setClickMode('source')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-indigo-400"
                                title="Click map to set source"
                            >
                                <FiTarget size={14} />
                            </button>
                        </div>
                        {sourceSuggestions.length > 0 && (
                            <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-30 overflow-hidden ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                                {sourceSuggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSourceInput(s.display_name.split(',').slice(0, 2).join(','));
                                            setSourceCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                                            setSourceSuggestions([]);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Destination */}
                    <div className="relative">
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                            <input
                                type="text"
                                placeholder="To: Destination..."
                                value={destInput}
                                onChange={e => { setDestInput(e.target.value); fetchSuggestions(e.target.value, setDestSuggestions); setDestCoords(null); }}
                                className={`flex-1 text-sm bg-transparent outline-none font-medium ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                            />
                            <button
                                onClick={() => setClickMode('dest')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-rose-400"
                                title="Click map to set destination"
                            >
                                <FiTarget size={14} />
                            </button>
                        </div>
                        {destSuggestions.length > 0 && (
                            <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-30 overflow-hidden ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                                {destSuggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setDestInput(s.display_name.split(',').slice(0, 2).join(','));
                                            setDestCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                                            setDestSuggestions([]);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={drawRoute}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <FiLoader className="animate-spin" size={14} /> : <FiNavigation size={14} />}
                            {loading ? loadingMsg.split(' ')[0] : 'Navigate'}
                        </button>
                        <button
                            onClick={saveCurrentDest}
                            className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all"
                            title="Save this destination"
                        >
                            <FiBookmark size={14} />
                        </button>
                        <button
                            onClick={clearAll}
                            className={`py-2.5 px-3 rounded-xl transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                </div>

                {/* Route Info Card */}
                <AnimatePresence>
                    {routeInfo && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className={`mx-4 mb-4 p-4 rounded-2xl ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <FiNavigation className="text-indigo-400" size={14} />
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Optimal Route</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{routeInfo.distance} km</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Distance</div>
                                </div>
                                <div>
                                    <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{routeInfo.duration} min</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Drive Time</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mx-4 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold flex items-start gap-2"
                        >
                            <span className="shrink-0 mt-0.5">⚠️</span>
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-auto shrink-0"><FiX size={12} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nearby Discovery */}
                <div className={`px-4 pb-4 border-t pt-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Discover Nearby</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { type: 'restaurants', icon: FiCoffee,  emoji: '🍽️', label: 'Eat',     color: 'text-amber-400  bg-amber-400/10  hover:bg-amber-400/20' },
                            { type: 'hospitals',   icon: FiHeart,   emoji: '🏥', label: 'Health',  color: 'text-rose-400   bg-rose-400/10   hover:bg-rose-400/20' },
                            { type: 'hotels',      icon: FiHome,    emoji: '🏨', label: 'Stay',    color: 'text-blue-400   bg-blue-400/10   hover:bg-blue-400/20' },
                        ].map(({ type, icon: Icon, emoji, label, color }) => (
                            <button
                                key={type}
                                onClick={() => searchNearby(type)}
                                disabled={loading}
                                className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all disabled:opacity-50 ${color}`}
                            >
                                <span className="text-base">{emoji}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Itinerary Mission Summary */}
                {plan && (
                    <div className={`border-t px-4 pb-4 pt-3 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mission Intel</div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <div className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.destination_name}</div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold">
                                    <FiClock size={10} /> {plan.days?.length} Days
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                    <FiTrendingUp size={10} /> ₹{plan.total_estimated_cost}
                                </span>
                            </div>
                        </div>
                        <p className={`text-[10px] mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Numbered pins show your activity sequence
                        </p>
                    </div>
                )}
            </motion.div>

            {/* ── Saved Places Panel ── */}
            <AnimatePresence>
                {activeSaved && (
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                        className={`absolute top-4 right-4 z-10 w-[280px] rounded-3xl shadow-2xl overflow-hidden ${
                            isDark ? 'bg-slate-900/95 border border-white/10' : 'bg-white/95 border border-slate-200'
                        } backdrop-blur-xl`}
                    >
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>⭐ Saved Places</span>
                            <button onClick={() => setActiveSaved(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <FiX size={14} />
                            </button>
                        </div>
                        <div className="p-3 max-h-64 overflow-y-auto space-y-2">
                            {savedPlaces.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No saved places yet. Click ⭐ to save a destination.</p>
                            ) : savedPlaces.map((place, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDestInput(place.name);
                                        if (place.coords) setDestCoords(place.coords);
                                        setActiveSaved(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    <div className="font-bold truncate">📍 {place.name}</div>
                                    <div className="text-slate-500 text-[10px] mt-0.5">{place.time}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ESC key to cancel click mode ── */}
            {clickMode && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 5 }}
                    onKeyDown={e => e.key === 'Escape' && setClickMode(null)}
                    tabIndex={-1}
                    ref={el => el?.focus()}
                />
            )}
        </div>
    );
};

export default MapPortal;
