import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiMapPin, FiStar, FiMap, FiTrash2,
    FiBarChart2, FiX, FiSettings,
    FiSearch, FiEye, FiActivity, FiUnlock, FiLock, FiLogOut, FiLayout, FiRefreshCw,
    FiShield, FiAlertTriangle, FiCheck, FiTrendingUp, FiClock, FiHash, FiZap, FiGrid
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

// ─── UI COMPONENTS ───────────────────────────────────────────

// Premium Card wrapper with glassmorphism
const DashboardCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
        {children}
    </motion.div>
);

// Modern SVG Line Chart for Activity
const ActivityLineChart = ({ data, label, color = "#6366f1" }) => {
    if (!data || data.length < 2) return <div className="h-40 flex items-center justify-center text-slate-400 text-xs italic">Insufficient data for trend analysis...</div>;

    const width = 400;
    const height = 120;
    const padding = 20;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * (width - padding * 2) + padding,
        y: height - ((d.value / maxVal) * (height - padding * 2) + padding)
    }));

    // Create a smooth SVG path
    const dLine = points.reduce((acc, p, i, a) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const cp1x = a[i - 1].x + (p.x - a[i - 1].x) / 2;
        return `${acc} C ${cp1x},${a[i - 1].y} ${cp1x},${p.y} ${p.x},${p.y}`;
    }, "");

    const dArea = `${dLine} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return (
        <div className="relative group">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-500" /> {label}
            </h4>
            <div className="relative h-32 w-full overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={dLine}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        d={dArea}
                        fill="url(#chartGradient)"
                    />
                    {points.map((p, i) => (
                        <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.05 }}
                            cx={p.x} cy={p.y} r="3"
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            className="cursor-pointer"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
};

// Premium Donut Chart for Categories
const CategoryDonutChart = ({ data, label }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulativePercent = 0;

    const colors = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'];

    return (
        <div className="relative p-5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FiZap className="text-amber-500" /> {label}
            </h4>
            <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {data.map((d, i) => {
                            const percent = (d.value / (total || 1)) * 100;
                            const dashArray = `${percent} ${100 - percent}`;
                            const dashOffset = -cumulativePercent;
                            cumulativePercent += percent;

                            return (
                                <motion.circle
                                    key={i}
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    stroke={colors[i % colors.length]}
                                    strokeWidth="12"
                                    strokeDasharray={total > 0 ? dashArray : "0 100"}
                                    strokeDashoffset={dashOffset}
                                    pathLength="100"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 100 }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                />
                            );
                        })}
                        <circle cx="50" cy="50" r="30" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-slate-800 leading-none">{total}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Hits</span>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {data.slice(0, 5).map((d, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{d.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Enhanced Bar Chart
const AestheticBarChart = ({ data, label, color = 'indigo' }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-100',
        rose: 'from-rose-500 to-rose-600 shadow-rose-100',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100',
        amber: 'from-amber-500 to-amber-600 shadow-amber-100',
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className="p-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <FiGrid className="text-indigo-500" /> {label}
            </h4>
            <div className="flex items-end gap-3 h-32 px-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-20 shadow-lg">
                            {d.label}: {d.value}
                        </div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.value / maxVal) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                            className={`w-full bg-gradient-to-t ${c} rounded-t-lg shadow-sm hover:brightness-110 transition-all`}
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate w-full text-center">
                            {d.shortLabel || d.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Original functional Modals kept but styled premium
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger = true }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100]" onClick={onCancel}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full mx-4 border border-slate-100"
                onClick={e => e.stopPropagation()}
            >
                <div className={`w-14 h-14 rounded-2xl ${danger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center mb-6 shadow-sm`}>
                    {danger ? <FiAlertTriangle size={28} /> : <FiCheck size={28} />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        Go Back
                    </button>
                    <button onClick={onConfirm} className={`flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-xl ${danger ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'}`}>
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DetailPanel = ({ open, item, type, onClose }) => {
    if (!open || !item) return null;

    const renderField = (label, value) => {
        if (value === undefined || value === null || value === '') return null;
        return (
            <div className="py-2.5">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-sm text-slate-800 font-semibold tracking-tight">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex justify-end z-[90]" onClick={onClose}>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-slate-50 flex items-center justify-between z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{type} Information</p>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{item.name || item.user_name || item.destination_name || 'Record Details'}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all">
                        <FiX size={20} />
                    </button>
                </div>
                <div className="px-10 py-8 space-y-6 divide-y divide-slate-50">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {renderField('System ID', item._id)}
                        {type === 'user' && (
                            <>
                                {renderField('Full Name', item.name)}
                                {renderField('Email Address', item.email)}
                                {renderField('Account Role', item.role)}
                                {renderField('System Status', item.is_banned ? '🔒 Banned' : '✅ Active')}
                                {renderField('Joined Date', item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A')}
                            </>
                        )}
                        {type === 'destination' && (
                            <>
                                {renderField('City', item.city)}
                                {renderField('Country', item.country)}
                                {renderField('Budget Range', `$${item.budget_min} - $${item.budget_max}`)}
                                {renderField('Season', item.best_season)}
                            </>
                        )}
                    </div>
                    {type === 'destination' && (
                        <div className="pt-6">
                            {renderField('Description', item.description)}
                            {renderField('Travel Tags', item.tags?.join(' • '))}
                        </div>
                    )}
                    {type === 'review' && (
                        <div className="pt-6">
                            {renderField('Traveler', item.user_name)}
                            {renderField('Rating Scored', `${item.rating}/5 Stars`)}
                            {renderField('Content', item.comment)}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};


// ═════════════════════════════════════════════════════════════
// ─── MAIN ADMIN COMPONENT ──────────────────────────────────
// ═════════════════════════════════════════════════════════════

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_users: 0, total_itineraries: 0, total_destinations: 0, total_reviews: 0 });
    const [users, setUsers] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    // Analytics data
    const [topSearches, setTopSearches] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [dailyCounts, setDailyCounts] = useState([]);

    // Featured
    const [allDestsForFeatured, setAllDestsForFeatured] = useState([]);

    // Modals
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, danger: true });
    const [detailPanel, setDetailPanel] = useState({ open: false, item: null, type: '' });

    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_settings');
            return saved ? JSON.parse(saved) : { autoSync: true, showToasts: true, compactView: false };
        } catch { return { autoSync: true, showToasts: true, compactView: false }; }
    });

    useEffect(() => { localStorage.setItem('admin_settings', JSON.stringify(settings)); }, [settings]);

    const loadBaseStats = useCallback(async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data);
            setLastSync(new Date());
        } catch (err) { console.error(err); }
    }, []);

    const loadDashboardAnalytics = useCallback(async () => {
        try {
            const [searchesRes, tagsRes, activityRes, overviewRes] = await Promise.all([
                adminAPI.getMostSearched(), adminAPI.getPopularTags(),
                adminAPI.getRecentActivity(), adminAPI.getAnalyticsOverview(),
            ]);
            setTopSearches(searchesRes.data.searches || []);
            setPopularTags(tagsRes.data.tags || []);
            setRecentActivity(activityRes.data.activity || []);
            setDailyCounts(overviewRes.data.daily_counts || []);
        } catch (err) { console.error(err); }
    }, []);

    const refreshTabData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                await loadDashboardAnalytics();
                const usersRes = await adminAPI.getUsers();
                setUsers(usersRes.data.users || []);
            } else if (activeTab === 'users') {
                const res = await adminAPI.getUsers(); setUsers(res.data.users || []);
            } else if (activeTab === 'destinations') {
                const res = await adminAPI.getDestinations(); setDestinations(res.data.destinations || []);
            } else if (activeTab === 'reviews') {
                const res = await adminAPI.getReviews(); setReviews(res.data.reviews || []);
            } else if (activeTab === 'itineraries') {
                const res = await adminAPI.getItineraries(); setItineraries(res.data.itineraries || []);
            } else if (activeTab === 'featured') {
                const allRes = await adminAPI.getDestinations(); setAllDestsForFeatured(allRes.data.destinations || []);
            }
            setLastSync(new Date());
        } catch (err) { if (settings.showToasts) toast.error("Sync partial failure."); }
        finally { setLoading(false); }
    }, [activeTab, settings.showToasts, loadDashboardAnalytics]);

    useEffect(() => {
        loadBaseStats(); refreshTabData();
        if (!settings.autoSync) return;
        const pollId = setInterval(() => { loadBaseStats(); if (activeTab === 'dashboard') refreshTabData(); }, 30000);
        return () => clearInterval(pollId);
    }, [activeTab, settings.autoSync, loadBaseStats, refreshTabData]);

    // Actions
    const handleDeleteUser = (u) => {
        if (u._id === user?.id) { toast.warning("Admin self-destruct blocked."); return; }
        setConfirmModal({
            open: true, danger: true, title: 'Terminate User Account',
            message: `Permanently delete ${u.name}'s account data? This cannot be reversed.`,
            onConfirm: async () => {
                try { await adminAPI.deleteUser(u._id); setUsers(p => p.filter(x => x._id !== u._id)); loadBaseStats(); toast.success("User removed."); }
                catch { toast.error("Deletion failed."); }
                setConfirmModal(p => ({ ...p, open: false }));
            }
        });
    };

    const handleToggleBan = (u) => {
        if (u._id === user?.id) return;
        setConfirmModal({
            open: true, danger: !u.is_banned, title: u.is_banned ? 'Lift Suspension' : 'Suspend Account',
            message: `Modify access state for ${u.name}?`,
            onConfirm: async () => {
                try { const res = await adminAPI.toggleBan(u._id); setUsers(p => p.map(x => x._id === u._id ? { ...x, is_banned: res.data.is_banned } : x)); toast.info(res.data.message); }
                catch { toast.error("Ban update failed."); }
                setConfirmModal(p => ({ ...p, open: false }));
            }
        });
    };

    const handleSetRole = (u) => {
        if (u._id === user?.id) return;
        const newRole = u.role === 'admin' ? 'user' : 'admin';
        setConfirmModal({
            open: true, danger: false, title: 'Elevate/Demote Role',
            message: `Change permissions for ${u.name} to ${newRole.toUpperCase()}?`,
            onConfirm: async () => {
                try { await adminAPI.setUserRole(u._id, { role: newRole }); setUsers(p => p.map(x => x._id === u._id ? { ...x, role: newRole } : x)); toast.success("Role updated."); }
                catch { toast.error("Role update failed."); }
                setConfirmModal(p => ({ ...p, open: false }));
            }
        });
    };

    const handleDeleteDestination = (d) => {
        setConfirmModal({
            open: true, danger: true, title: 'Delete Destination', message: `Wipe "${d.name}" from the global nexus?`,
            onConfirm: async () => {
                try { await adminAPI.deleteDestination(d._id); setDestinations(p => p.filter(x => x._id !== d._id)); loadBaseStats(); }
                catch { } setConfirmModal(p => ({ ...p, open: false }));
            }
        });
    };

    const handleToggleFeatured = async (dest) => {
        try {
            const res = await adminAPI.toggleFeatured(dest._id);
            setAllDestsForFeatured(prev => prev.map(d => d._id === dest._id ? { ...d, is_featured: res.data.is_featured } : d));
            toast.success(res.data.is_featured ? "Featured in Spotlight" : "Removed from Spotlight");
        } catch { }
    };

    // Filtered data memoization
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }, [users, searchQuery]);

    const filteredDestinations = useMemo(() => {
        if (!searchQuery) return destinations;
        const q = searchQuery.toLowerCase();
        return destinations.filter(d => d.name?.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q));
    }, [destinations, searchQuery]);

    const filteredItineraries = useMemo(() => {
        if (!searchQuery) return itineraries;
        const q = searchQuery.toLowerCase();
        return itineraries.filter(i => i.user_name?.toLowerCase().includes(q) || i.destination_name?.toLowerCase().includes(q));
    }, [itineraries, searchQuery]);

    const filteredReviews = useMemo(() => {
        if (!searchQuery) return reviews;
        const q = searchQuery.toLowerCase();
        return reviews.filter(r => r.user_name?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q));
    }, [reviews, searchQuery]);

    // Chart Data Preparation
    const lineChartData = useMemo(() => {
        // Group dailyCounts by date, prioritizing 'plan_generated' for volume
        const dates = [...new Set(dailyCounts.map(d => d.date))].sort().slice(-7);
        return dates.map(date => {
            const count = dailyCounts.filter(d => d.date === date && d.event_type === 'plan_generated').reduce((acc, curr) => acc + curr.count, 0);
            return { label: date, value: count };
        });
    }, [dailyCounts]);

    const donutChartData = useMemo(() => popularTags.slice(0, 5).map(t => ({ label: t._id, value: t.count })), [popularTags]);
    const topSearchedData = useMemo(() => topSearches.slice(0, 7).map(s => ({ label: s._id, shortLabel: s._id.slice(0, 5), value: s.count })), [topSearches]);


    return (
        <div className="flex h-screen bg-[#fcfcfd] text-slate-900 font-sans overflow-hidden">
            {/* ─── SIDEBAR ─── */}
            <aside className="w-72 bg-white border-r border-slate-100/80 flex flex-col z-20">
                <div className="px-10 py-10 border-b border-slate-50 mb-6">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <FiActivity size={22} />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-800 uppercase">TRIPMIND <span className="text-indigo-600 font-medium lowercase">admin</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                    {SIDEBAR_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold tracking-tight ${activeTab === item.id
                                ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                        >
                            <span className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-300'}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-8 border-t border-slate-50 mt-auto bg-slate-50/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{user?.name[0]}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate leading-none mb-1">{user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all text-xs font-black uppercase tracking-widest">
                        <FiLogOut size={16} /> Logout System
                    </button>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="px-10 py-8 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-slate-50 z-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">{activeTab}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{lastSync.toLocaleTimeString()} Sync Point</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => { loadBaseStats(); refreshTabData(); }}
                            disabled={loading}
                            className={`w-11 h-11 flex items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100 text-slate-400 hover:text-indigo-600 transition-all ${loading ? 'animate-spin' : ''}`}
                        >
                            <FiRefreshCw size={18} />
                        </button>
                        {['users', 'destinations', 'reviews', 'itineraries'].includes(activeTab) && (
                            <div className="relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder={`Search for ${activeTab}...`}
                                    className="bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all w-80 shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-10 py-10 scrollbar-hide space-y-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        >
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-4 gap-8">
                                        {[
                                            { label: 'Total Users', value: stats.total_users, icon: <FiUsers size={24} />, grad: 'from-indigo-600 to-indigo-800' },
                                            { label: 'Itineraries', value: stats.total_itineraries, icon: <FiMap size={24} />, grad: 'from-rose-500 to-rose-700' },
                                            { label: 'Destinations', value: stats.total_destinations, icon: <FiMapPin size={24} />, grad: 'from-amber-500 to-amber-700' },
                                            { label: 'Platform Reviews', value: stats.total_reviews, icon: <FiStar size={24} />, grad: 'from-emerald-500 to-emerald-700' },
                                        ].map((stat, i) => (
                                            <DashboardCard key={i} className="group overflow-hidden">
                                                <div className="p-8">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.grad} flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform duration-500`}>
                                                        {stat.icon}
                                                    </div>
                                                    <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value.toLocaleString()}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className={`h-full bg-gradient-to-r ${stat.grad}`} />
                                                </div>
                                            </DashboardCard>
                                        ))}
                                    </div>

                                    {/* GRAPH SECTION */}
                                    <div className="grid grid-cols-3 gap-8">
                                        <DashboardCard className="col-span-2 p-10">
                                            <ActivityLineChart label="Traffic Overview" data={lineChartData} color="#6366f1" />
                                        </DashboardCard>
                                        <DashboardCard className="p-5">
                                            <CategoryDonutChart label="Interest Mix" data={donutChartData} />
                                        </DashboardCard>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8">
                                        <DashboardCard className="p-4">
                                            <AestheticBarChart label="Search Volume" data={topSearchedData} color="indigo" />
                                        </DashboardCard>
                                        
                                        <DashboardCard className="col-span-2 p-10">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
                                                <FiClock size={16} className="text-indigo-500" /> Recent Updates
                                            </h3>
                                            <div className="space-y-4">
                                                {recentActivity.slice(0, 6).map((a, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-indigo-600">
                                                                <FiZap size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{a.event_type?.replace('_', ' ')}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">ID Cluster: {a._id.slice(-8)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-slate-800">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </DashboardCard>
                                    </div>
                                </div>
                            )}

                            {/* DATA TABLES (Common Structure) */}
                            {['users', 'destinations', 'reviews', 'itineraries'].includes(activeTab) && (
                                <DashboardCard className="overflow-hidden">
                                    <div className="overflow-x-auto min-h-[500px] relative">
                                        {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center"><FiRefreshCw size={32} className="text-indigo-600 animate-spin" /></div>}
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/40 border-b border-slate-50">
                                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Traveler info</th>
                                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context</th>
                                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {/* Rendering Logic remains same as before but with enhanced styles */}
                                                {(activeTab === 'users' ? filteredUsers : activeTab === 'destinations' ? filteredDestinations : activeTab === 'itineraries' ? filteredItineraries : filteredReviews).map((item, i) => (
                                                    <tr key={item._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center font-black text-indigo-600 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                                    {(item.name || item.user_name || item.destination_name || 'V')[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 tracking-tight leading-tight mb-1">{item.name || item.user_name || item.destination_name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">UUID: {item._id.slice(-12)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-black text-slate-800">{item.email || item.city || item.destination_name || 'System Object'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.role || item.country || (item.rating ? `${item.rating} Stars` : 'Telemetry')}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${item.is_banned ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                                {item.is_banned ? 'RESTRICTED' : 'OPERATIONAL'}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                                <button onClick={() => setDetailPanel({ open: true, item, type: activeTab.slice(0, -1) })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"><FiEye size={16} /></button>
                                                                {activeTab === 'users' && <button onClick={() => handleToggleBan(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:shadow-lg transition-all"><FiLock size={16} /></button>}
                                                                <button onClick={() => {
                                                                    if (activeTab === 'users') handleDeleteUser(item);
                                                                    if (activeTab === 'destinations') handleDeleteDestination(item);
                                                                }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all"><FiTrash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>
                            )}

                            {/* FEATURED & SETTINGS (Similar high-end polish) */}
                            {activeTab === 'featured' && (
                                <DashboardCard className="p-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Featured Places</h3>
                                            <p className="text-sm font-medium text-slate-400">Choose the best destinations to show on the home page.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {allDestsForFeatured.map(d => (
                                            <div key={d._id} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all duration-500 ${d.is_featured ? 'bg-indigo-600 text-white shadow-indigo-200 rotate-12' : 'bg-white text-slate-300'}`}>
                                                        {d.is_featured ? '⭐' : d.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 tracking-tight text-lg mb-1">{d.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.city}, {d.country}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggleFeatured(d)}
                                                    className={`w-14 h-8 rounded-full relative transition-all duration-500 ${d.is_featured ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                >
                                                    <motion.div 
                                                        animate={{ x: d.is_featured ? 24 : 4 }}
                                                        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardCard>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* MODALS ── Global Scope */}
            <AnimatePresence>
                {confirmModal.open && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(p => ({ ...p, open: false }))} />}
                {detailPanel.open && <DetailPanel {...detailPanel} onClose={() => setDetailPanel({ open: false, item: null, type: '' })} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
