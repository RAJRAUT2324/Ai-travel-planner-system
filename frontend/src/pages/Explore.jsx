/**
 * Explore — premium destination discovery engine with AI integration.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiZap } from 'react-icons/fi';
import { destinationsAPI } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TAGS = ['beach', 'hill', 'adventure', 'religious', 'luxury', 'nature', 'food', 'culture', 'wildlife', 'romantic'];

const Explore = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [budgetMax, setBudgetMax] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [isDiscovered, setIsDiscovered] = useState(false);

    const fetchDestinations = async () => {
        setLoading(true);
        setIsDiscovered(false);
        const params = { page, limit: 6 };
        if (search) params.search = search;
        if (selectedTags.length > 0) params.tags = selectedTags;
        if (budgetMax) params.budget_max = parseFloat(budgetMax);

        try {
            const res = await destinationsAPI.getAll(params);
            setDestinations(res.data.destinations || []);
            setTotalPages(res.data.pages || 1);
            if (res.data.is_discovered) setIsDiscovered(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, [page, selectedTags]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchDestinations();
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Sub-Header */}
            <div className="pt-24 md:pt-32 pb-16 bg-slate-50 border-b border-slate-100 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 uppercase">Discovery Grid.</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                                Search 500+ curated locations or enter any city to let our AI discover it for you.
                            </p>
                        </motion.div>
                        
                        {/* Responsive Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter Zurich, Tokyo, or Hidden Beaches..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="input-field !pl-16 shadow-sm focus:shadow-indigo-50"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="btn-primary !px-10 flex-1 md:flex-none py-4">
                                        <span>Search</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all shrink-0 ${
                                            showFilters 
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <FiFilter size={20} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Filter Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-12 overflow-hidden"
                            >
                                <div className="p-8 bg-white rounded-3xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Manifest</h3>
                                        {selectedTags.length > 0 && (
                                            <button onClick={() => setSelectedTags([])} className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                <FiX size={14} /> Clear Selection
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    selectedTags.includes(tag)
                                                        ? 'bg-slate-900 text-white shadow-xl'
                                                        : 'bg-slate-50 text-slate-500 border border-slate-50 hover:border-slate-200 hover:bg-white'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-10 border-t border-slate-50">
                                        <div className="max-w-xs space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Bound (Max Budget)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 2500"
                                                value={budgetMax}
                                                onChange={(e) => setBudgetMax(e.target.value)}
                                                onBlur={fetchDestinations}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                        {search ? `Results for "${search}"` : 'Featured Discovery Grid'}
                    </h2>
                    {!search && (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">
                            Staff Picks
                        </span>
                    )}
                </div>

                {isDiscovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <FiZap size={24} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">AI Discovery Protocol Engaged</h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Target synthesized in real-time. Destination data added to global archive.</p>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-6">
                        <LoadingSpinner />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Scaling Global Horizons...</span>
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-40">
                        <div className="text-8xl mb-12 grayscale opacity-20">🧭</div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">No Horizons Resolved.</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto mb-12">Try a different search or let the AI discover a new city for you.</p>
                        <button onClick={() => { setSearch(''); fetchDestinations(); }} className="btn-primary !bg-white !text-slate-900">
                            <span>Clear Data Filters</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-20">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {destinations.map((dest, i) => (
                                <DestinationCard key={dest._id} destination={dest} index={i} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-20 border-t border-slate-100">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-16 h-16 flex items-center justify-center rounded-[1.5rem] border border-slate-200 text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-all font-black"
                                >
                                    ←
                                </button>
                                <div className="flex items-center gap-3">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-12 h-12 rounded-xl text-xs font-black transition-all ${
                                                page === i + 1 
                                                ? 'bg-slate-900 text-white shadow-2xl' 
                                                : 'text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-16 h-16 flex items-center justify-center rounded-[1.5rem] border border-slate-200 text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-all font-black"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
