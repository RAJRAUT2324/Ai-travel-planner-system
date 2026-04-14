import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiGlobe, FiSearch, FiMapPin, FiCalendar, 
    FiShield, FiArrowRight, FiInfo, FiTag, 
    FiActivity, FiBriefcase, FiPhone, FiStar
} from 'react-icons/fi';

// ─── DATA RULES COMPLIANT MOCK AGENCIES ──────────────────────
const REAL_AGENCIES = [
    {
        id: 1,
        name: "Shree Travels Amravati",
        location: "Rajapeth, Amravati",
        price_range: "₹600 - ₹1200",
        trip_type: ["One-day trip", "Group tour"],
        contact: "+91 98223 45112",
        offer: "10% off on Groups",
        description: "Specialized in local sightseeing tours and daily group departures to nearby scenic locations.",
        popular_routes: ["Amravati → Chikhaldara", "Amravati → Melghat Tiger Reserve"],
        rating: 4.8,
        image: "https://picsum.photos/id/1015/800/600"
    },
    {
        id: 2,
        name: "Vidarbha Adventure Hub",
        location: "Gadge Nagar, Amravati",
        price_range: "₹1200 - ₹2000",
        trip_type: ["Adventure trip", "Group tour"],
        contact: "+91 77456 12845",
        offer: "Free Camping Gear",
        description: "Focusing on trekking expeditions and adventure camping in the Satpura mountain ranges.",
        popular_routes: ["Amravati → Gawilghur Fort", "Amravati → Upper Wardha Dam"],
        rating: 4.9,
        image: "https://picsum.photos/id/1016/800/600"
    },
    {
        id: 3,
        name: "Chikhaldara Tours & Travels",
        location: "Main Market, Chikhaldara",
        price_range: "₹500 - ₹1500",
        trip_type: ["One-day trip", "Adventure trip"],
        contact: "+91 88341 90291",
        offer: "Flat ₹200 Off",
        description: "Leading local experts for hill station exploration, valley views, and jungle safaris.",
        popular_routes: ["Chikhaldara Circle", "Chikhaldara → Semadoh Wildlife"],
        rating: 4.7,
        image: "https://picsum.photos/id/1018/800/600"
    },
    {
        id: 4,
        name: "Bhakt Niwas Pilgrimage Services",
        location: "Near Ambadevi Temple, Amravati",
        price_range: "₹800 - ₹1800",
        trip_type: ["Religious trip", "Group tour"],
        contact: "+91 94231 45600",
        offer: "Complimentary Meals",
        description: "Safe and organized group departures for pilgrimage circuits around Maharashtra.",
        popular_routes: ["Amravati → Ambadevi Local", "Amravati → Shegaon Gajanana Maharaj"],
        rating: 4.6,
        image: "https://picsum.photos/id/1036/800/600"
    },
    {
        id: 5,
        name: "Sai Darshan Travels",
        location: "Railway Station Area, Amravati",
        price_range: "₹700 - ₹1400",
        trip_type: ["Group tour", "One-day trip"],
        contact: "+91 99123 78455",
        offer: "No cancellation fee",
        description: "Reliable transportation services with experienced local drivers for short family outings.",
        popular_routes: ["Amravati → Badnera Junction", "Amravati → Pohara Forest"],
        rating: 4.5,
        image: "https://picsum.photos/id/1039/800/600"
    },
    {
        id: 6,
        name: "Sahyadri Explorers",
        location: "Deccan, Pune",
        price_range: "₹1500 - ₹3500",
        trip_type: ["Adventure trip", "Group tour"],
        contact: "+91 80556 22132",
        offer: "20% off for Early Birds",
        description: "Top-rated agency for adventurous monsoon treks and historical fort visits across the Sahyadri range.",
        popular_routes: ["Pune → Rajmachi Fort", "Pune → Harishchandragad"],
        rating: 4.9,
        image: "https://picsum.photos/id/1043/800/600"
    },
    {
        id: 7,
        name: "Konkan Escapes",
        location: "Dadar, Mumbai",
        price_range: "₹2000 - ₹5000",
        trip_type: ["Group tour", "One-day trip"],
        contact: "+91 76223 90811",
        offer: "Free Beach Cabana",
        description: "Curated beach holidays and coastal adventures with premium transport and local stays.",
        popular_routes: ["Mumbai → Alibaug", "Mumbai → Malvan"],
        rating: 4.8,
        image: "https://picsum.photos/id/1044/800/600"
    },
    {
        id: 8,
        name: "Orange City Tours",
        location: "Sitabuldi, Nagpur",
        price_range: "₹800 - ₹2500",
        trip_type: ["One-day trip", "Religious trip"],
        contact: "+91 92837 44577",
        offer: "Extra 5% off online",
        description: "Your gateway to exploring central India, focusing on wildlife and cultural heritage spots.",
        popular_routes: ["Nagpur → Tadoba", "Nagpur → Ramtek"],
        rating: 4.6,
        image: "https://picsum.photos/id/1047/800/600"
    }
];

// ─── UI COMPONENTS ──────────────────────────────────────────

const AgencyCard = ({ agency }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img src={agency.image} alt={agency.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                
                {/* Offer Badge Top Left */}
                {agency.offer && (
                    <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-indigo-400/30">
                        <FiTag size={12} className="text-indigo-100" />
                        <span className="text-[9px] font-black uppercase text-white tracking-widest shadow-sm">{agency.offer}</span>
                    </div>
                )}

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <FiStar className="text-amber-400 fill-amber-400" size={12} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{agency.rating} Rating</span>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">{agency.name}</h3>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <FiMapPin size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">{agency.location}</span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 italic">
                    "{agency.description}"
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Est. Cost</span>
                        <span className="text-sm font-black text-emerald-600">{agency.price_range}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contact</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{agency.contact}</span>
                    </div>
                    {agency.offer && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <FiTag size={12} /> Special Offer
                            </span>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{agency.offer}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Service Types</p>
                    <div className="flex flex-wrap gap-2">
                        {agency.trip_type.map((type, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Popular Routes</p>
                    <div className="space-y-2">
                        {agency.popular_routes.map((route, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                                <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                {route}
                            </div>
                        ))}
                    </div>
                </div>

                <button className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 group-hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    Inquire Details <FiArrowRight />
                </button>
            </div>
        </motion.div>
    );
};

// ─── MAIN PAGE ──────────────────────────────────────────────

const AgencyPortal = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredAgencies = REAL_AGENCIES.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             a.popular_routes.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filter === 'All' || a.trip_type.includes(filter);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#fcfcfd] pt-32 pb-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-16 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 mb-6 border border-indigo-100"
                    >
                        <FiBriefcase size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Partners</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8"
                    >
                        TripMind <span className="text-indigo-600">Travel Experts.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-500 font-medium leading-relaxed"
                    >
                        We find the best travel agencies for you. From quick trips to mountain escapes, 
                        find local experts for your next journey.
                    </motion.p>
                </header>

                {/* Filters & Search */}
                <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {['All', 'One-day trip', 'Group tour', 'Adventure trip', 'Religious trip'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                    filter === f 
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                    : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or route..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredAgencies.map((agency) => (
                            <AgencyCard key={agency.id} agency={agency} />
                        ))}
                    </AnimatePresence>
                </div>

                {filteredAgencies.length === 0 && (
                    <div className="py-40 text-center">
                        <FiMapPin className="mx-auto text-slate-200 mb-6" size={60} />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Regional Partners Found</h3>
                        <p className="text-slate-400 font-medium">Try broadening your search or resetting the filters.</p>
                    </div>
                )}

                {/* Real-world Disclaimer */}
                <footer className="mt-24 p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10">
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                        <FiShield size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2 uppercase tracking-widest">Trust & Reliability Policy</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            The data shown here is enhanced for realism based on regional travel patterns. Prices between <strong>₹500 and ₹5000</strong> reflect 
                            estimated local operator costs. Contact details are mocked to ensure data integrity and user privacy. 
                            Always verify current rates and offers with agencies directly upon reach.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AgencyPortal;
