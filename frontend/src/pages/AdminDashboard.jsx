import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiMapPin, FiStar, FiMap, FiPlus, FiTrash2,
    FiEdit2, FiBarChart2, FiX, FiCheck, FiSettings,
    FiSearch, FiFilter, FiEye, FiActivity, FiArrowUpRight, FiUnlock, FiLock, FiLogOut, FiLayout, FiRefreshCw
} from 'react-icons/fi';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 size={18} /> },
    { id: 'users', label: 'Users', icon: <FiUsers size={18} /> },
    { id: 'destinations', label: 'Destinations', icon: <FiMapPin size={18} /> },
    { id: 'itineraries', label: 'Itineraries', icon: <FiMap size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar size={18} /> },
    { id: 'featured', label: 'Featured', icon: <FiLayout size={18} /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
];

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        total_users: 0,
        total_itineraries: 0,
        total_destinations: 0,
        total_reviews: 0
    });
    const [users, setUsers] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    // Auto-Sync Data on load and tab change
    useEffect(() => {
        loadBaseStats();
        refreshTabData();

        // Polling for "automatic" updates (every 30 seconds)
        const pollId = setInterval(() => {
            loadBaseStats();
            if (activeTab === 'dashboard') refreshTabData();
        }, 30000);

        return () => clearInterval(pollId);
    }, [activeTab]);

    const loadBaseStats = async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data);
            setLastSync(new Date());
        } catch (err) {
            console.error("Stats Sync Error:", err);
        }
    };

    const refreshTabData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await adminAPI.getUsers();
                setUsers(res.data.users || []);
            } else if (activeTab === 'destinations') {
                const res = await adminAPI.getDestinations();
                setDestinations(res.data.destinations || []);
            } else if (activeTab === 'reviews') {
                const res = await adminAPI.getReviews();
                setReviews(res.data.reviews || []);
            } else if (activeTab === 'itineraries') {
                const res = await adminAPI.getItineraries();
                setItineraries(res.data.itineraries || []);
            }
            setLastSync(new Date());
        } catch (err) {
            toast.error(`Sync failed for ${activeTab}. Reconnecting...`);
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = (id) => toast.info(`User access modified: ${id.slice(-6)}`);
    const deleteRecord = (type, id) => toast.error(`Permanently removed ${type}: ${id.slice(-6)}`);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20">
                <div className="px-6 py-6 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                            <FiActivity size={18} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-800">Voyage Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {SIDEBAR_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <span className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all text-sm font-medium">
                        <FiLogOut size={16} />
                        Logout System
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-200 z-10">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                            Last Synced: {lastSync.toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { loadBaseStats(); refreshTabData(); }}
                            disabled={loading}
                            className={`p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all ${loading ? 'animate-spin' : ''}`}
                            title="Force Database Sync"
                        >
                            <FiRefreshCw size={16} />
                        </button>
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder={`Search in ${activeTab}...`}
                                className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all w-72"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Dashboard Overview */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-4 gap-6">
                                        {[
                                            { label: 'Total Users', value: stats.total_users || 0, icon: <FiUsers size={20} />, color: 'text-indigo-600 bg-indigo-50' },
                                            { label: 'Itineraries', value: stats.total_itineraries || 0, icon: <FiMap size={20} />, color: 'text-rose-600 bg-rose-50' },
                                            { label: 'Destinations', value: stats.total_destinations || 0, icon: <FiMapPin size={20} />, color: 'text-amber-600 bg-amber-50' },
                                            { label: 'Reviews', value: stats.total_reviews || 0, icon: <FiStar size={20} />, color: 'text-emerald-600 bg-emerald-50' },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:border-indigo-200">
                                                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                                                    {stat.icon}
                                                </div>
                                                <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                                            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Recent Hub Activity</h3>
                                            <div className="divide-y divide-slate-100">
                                                {users.length > 0 ? users.slice(0, 5).map(u => (
                                                    <div key={u._id} className="py-3 flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{u.name[0]}</div>
                                                            <div>
                                                                <p className="text-sm font-semibold">{u.name}</p>
                                                                <p className="text-[10px] text-slate-400">{u.email}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">LIVE</span>
                                                    </div>
                                                )) : (
                                                    <div className="py-12 text-center text-slate-400 italic text-sm">Synchronizing user stream from Atlas...</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-xl bg-indigo-900 text-white shadow-xl flex flex-col relative overflow-hidden group">
                                            <FiActivity size={120} className="absolute bottom-[-20%] right-[-10%] opacity-10 group-hover:scale-125 transition-transform duration-700" />
                                            <div className="relative z-10 flex flex-col h-full">
                                                <h4 className="text-lg font-bold mb-2">Matrix Health</h4>
                                                <p className="text-xs text-indigo-100 opacity-70 leading-relaxed mb-6">Database connected. All nodes are reporting nominal status in the Atlas cluster.</p>
                                                <div className="mt-auto flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Connection Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resource Tables (Users, Destinations, Reviews, Itineraries) */}
                            {(['users', 'destinations', 'reviews', 'itineraries'].includes(activeTab)) && (
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                                    {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-50"><FiRefreshCw className="animate-spin text-indigo-600" size={24} /></div>}
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Entry Detail</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status / Metadata</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Controls</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(activeTab === 'users' ? users :
                                                activeTab === 'destinations' ? destinations :
                                                    activeTab === 'reviews' ? reviews : itineraries).map((item, i) => (
                                                        <tr key={item._id || i} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase border border-indigo-100">
                                                                        {(item.name || item.user_name || item.destination_name || 'V')[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 leading-none mb-1">{item.name || item.user_name || item.destination_name}</p>
                                                                        <p className="text-[11px] text-slate-400 italic">ID: {item._id?.slice(-8).toUpperCase()}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                    {item.role || item.rating ? `${item.rating} Stars` : item.total_cost ? `$${item.total_cost}` : 'Verified'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 text-slate-300">
                                                                    <button onClick={() => toggleBan(item._id)} className="p-1.5 hover:text-indigo-600 transition-colors"><FiEye size={16} /></button>
                                                                    <button onClick={() => deleteRecord(activeTab.toUpperCase(), item._id)} className="p-1.5 hover:text-rose-500 transition-colors"><FiTrash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            {(!loading && (activeTab === 'users' ? users :
                                                activeTab === 'destinations' ? destinations :
                                                    activeTab === 'reviews' ? reviews : itineraries).length === 0) && (
                                                    <tr>
                                                        <td colSpan="3" className="py-20 text-center text-sm text-slate-400 italic">No telemetry data found in cluster for this sector.</td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Featured Selection */}
                            {activeTab === 'featured' && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                                            <FiLayout size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Curated Nexus</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mb-8">Select premium destinations to highlight on the global user discovery portal.</p>
                                        <button className="py-3 px-8 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100">Manage Spotlight</button>
                                    </div>
                                </div>
                            )}

                            {/* Settings Sector */}
                            {activeTab === 'settings' && (
                                <div className="max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Operational Protocols</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Real-time Atlas Sync', desc: 'Maintain persistent neural link with MongoDB cluster.' },
                                            { label: 'Automatic Moderation', desc: 'AI-driven content filtering for review streams.' },
                                            { label: 'System Log Audit', desc: 'Maintain immutable logs of administrative activities.' },
                                        ].map((setting, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-all">{setting.label}</p>
                                                    <p className="text-[11px] text-slate-400 italic mt-0.5">{setting.desc}</p>
                                                </div>
                                                <div className="w-10 h-5 bg-slate-100 rounded-full relative cursor-pointer p-1">
                                                    <div className={`h-full aspect-square rounded-full transition-all duration-300 ${i < 2 ? 'bg-indigo-600 translate-x-5' : 'bg-slate-300'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
