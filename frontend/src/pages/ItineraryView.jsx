/**
 * ItineraryView — Premium "Voyage Dossier" experience.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiMapPin, FiClock, FiAlertTriangle, FiArrowLeft, FiNavigation, FiCoffee, FiMoon, FiShield } from 'react-icons/fi';
import { itineraryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ItineraryView = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        itineraryAPI.getById(id)
            .then(res => {
                setData(res.data.itinerary);
                if (res.data.itinerary?.plan_data?.days?.length > 0) {
                    setActiveDay(res.data.itinerary.plan_data.days[0].day);
                }
            })
            .catch(() => toast.error('Failed to load itinerary'))
            .finally(() => setLoading(false));
    }, [id]);

    const downloadPdf = async () => {
        try {
            const res = await itineraryAPI.downloadPdf(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `itinerary_${data?.plan_data?.destination_name || 'trip'}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Itinerary Downloaded');
        } catch {
            toast.error('Download failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
            <LoadingSpinner text="Opening Itinerary..." />
        </div>
    );
    
    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-center p-6">
            <div>
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 uppercase">Trip Not Found</h3>
                <p className="text-slate-500 font-medium mb-8">This itinerary ID does not match our records.</p>
                <Link to="/profile" className="btn-primary"><span>Back to Saved Trips</span></Link>
            </div>
        </div>
    );

    const plan = data.plan_data || {};

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 selection:bg-indigo-100 selection:text-indigo-900 pt-32 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12">
                    <FiArrowLeft /> Back to Trips
                </Link>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Sidebar: Metadata & Controls */}
                    <aside className="lg:col-span-4 space-y-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-6 border border-slate-200 shadow-sm">
                                Trip Itinerary #{id.slice(-6)}
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-4 uppercase">
                                {plan.destination_name}
                            </h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                                {plan.trip_summary}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <span className="text-2xl font-black text-indigo-600 mb-3 block">₹</span>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Cost</div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tighter">₹{plan.total_estimated_cost}</div>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <FiNavigation className="text-indigo-600 mb-3" />
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tighter">{plan.days?.length} Days</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-8">
                                <button onClick={downloadPdf} className="btn-primary w-full !bg-indigo-600 !text-white group border-none shadow-lg">
                                    <span>Download Itinerary (PDF)</span>
                                    <FiDownload className="group-hover:translate-y-1 transition-transform" />
                                </button>
                                <Link to={`/map/${id}`} className="btn-primary w-full border border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50 transition-all shadow-sm">
                                    <span>View Route Map</span>
                                    <FiNavigation className="text-indigo-600" />
                                </Link>
                            </div>
                        </motion.div>

                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Budget Status</h3>
                            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                plan.budget_status === 'within_budget' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                                <FiShield size={24} />
                                <div>
                                    <div className="text-sm font-bold uppercase tracking-tight">Status: {plan.budget_status?.replace('_', ' ')}</div>
                                    <div className="text-[10px] opacity-80 font-bold uppercase mt-0.5">{plan.budget_warning || 'Trip is within your budget.'}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Day-by-day Itinerary */}
                    <main className="lg:col-span-8">
                        {/* Day Selector Navigation */}
                        <div className="flex overflow-x-auto custom-scroll gap-4 pb-8 mb-12 border-b border-slate-200">
                            {plan.days?.map(day => (
                                <button
                                    key={day.day}
                                    onClick={() => setActiveDay(day.day)}
                                    className={`shrink-0 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeDay === day.day
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                        : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 shadow-sm'
                                    }`}
                                >
                                    Day {day.day}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {plan.days?.filter(d => d.day === activeDay).map(day => (
                                <motion.div
                                    key={day.day}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-12"
                                >
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter mb-2 uppercase">{day.title}</h2>
                                        <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-[0.3em]">Day Total Cost: ₹{day.daily_total}</p>
                                    </div>

                                    {/* Activities Timeline */}
                                    <div className="space-y-6">
                                        {day.activities?.map((act, i) => (
                                            <div key={i} className="group relative pl-12 pb-12 last:pb-0">
                                                {/* Timeline Line */}
                                                <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-slate-100 group-last:bg-transparent" />
                                                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 z-10" />
                                                
                                                <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-indigo-600">
                                                            <FiClock /> {act.time}
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                            Est. Cost: ₹{act.estimated_cost}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase">{act.activity}</h4>
                                                    <p className="text-slate-500 font-medium leading-relaxed mb-6">{act.description}</p>
                                                    
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                            <FiMapPin className="text-rose-500" /> {act.location}
                                                        </div>
                                                        {act.tips && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                                                <span className="w-5 h-5 flex items-center justify-center bg-emerald-100 rounded-full">!</span> 
                                                                {act.tips}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Operational Logistics */}
                                    <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-slate-200">
                                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                                <FiCoffee size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dining</h5>
                                                <div className="space-y-4">
                                                    {day.meals?.map((meal, idx) => (
                                                        <div key={idx} className="border-l-2 border-slate-100 pl-4">
                                                            <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{meal.type}</div>
                                                            <div className="text-xs font-medium text-slate-500 mt-1">{meal.suggestion}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                                <FiMoon size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Accommodation</h5>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{day.accommodation?.suggestion}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stay: {day.accommodation?.type}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ItineraryView;
