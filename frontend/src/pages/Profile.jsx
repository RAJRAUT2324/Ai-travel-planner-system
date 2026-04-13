/**
 * Profile — Premium user dashboard with voyage history.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiMapPin, FiClock, FiArrowRight, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { itineraryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
    const { user } = useAuth();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        itineraryAPI.getHistory()
            .then(res => setItineraries(res.data.itineraries || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Grid */}
                <div className="grid lg:grid-cols-12 gap-12 mb-20 items-end">
                    <div className="lg:col-span-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black transform group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl border-4 border-white flex items-center justify-center text-white">
                                    <FiShield size={16} />
                                </div>
                            </div>
                            <div className="text-center md:text-left pt-4">
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{user?.name}</h1>
                                <p className="text-lg text-slate-400 font-medium mb-4">{user?.email}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="tag-badge !bg-indigo-50 !text-indigo-600 border-indigo-100">{user?.role || 'Traveler'} Level</span>
                                    <span className="tag-badge">Verified Member</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">{itineraries.length}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Voyages</div>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">4.9</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Score</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                    <div className="space-y-12">
                        <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                            <div>
                                <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.4em] mb-4">Travel History</h2>
                                <h3 className="text-3xl font-bold tracking-tighter text-slate-900">Your Journeys.</h3>
                            </div>
                        </div>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <LoadingSpinner text="Syncing Records..." />
                        </div>
                    ) : itineraries.length === 0 ? (
                        <div className="glass-card p-20 text-center bg-slate-50 border-dashed border-slate-200">
                            <div className="text-6xl mb-8">🔭</div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mb-4 uppercase">Your Journal is Empty.</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">You haven't planned any trips yet. Start your first journey today!</p>
                            <Link to="/plan" className="btn-primary inline-flex"><span>Plan a New Trip</span></Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {itineraries.map((it, i) => {
                                const plan = it.plan_data || {};
                                const input = it.form_input || {};
                                return (
                                    <motion.div key={it._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <Link to={`/itinerary/${it._id}`} className="group block glass-card p-10 hover:shadow-2xl transition-all duration-500">
                                            <div className="flex flex-col gap-8">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-white tracking-tight leading-tight uppercase transition-colors">
                                                            {it.destination_name || plan.destination_name || 'AI GENERATED TRIP'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mt-3">
                                                            <FiMapPin className="text-indigo-500" /> {it.destination_city || plan.destination_city || 'Undefined Sector'}
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-white/10 flex items-center justify-center text-slate-900 group-hover:text-white transition-all">
                                                        <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</span>
                                                        <div className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{input.duration || '?'} Days</div>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Cost</span>
                                                        <div className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">₹{plan.total_estimated_cost || input.budget || '?'}</div>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</span>
                                                        <div className="text-lg font-black text-slate-900 group-hover:text-white transition-colors">
                                                            {it.created_at ? new Date(it.created_at).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {plan.trip_summary && (
                                                    <p className="text-slate-500 group-hover:text-slate-400 font-medium leading-relaxed line-clamp-2 transition-colors">
                                                        {plan.trip_summary}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
