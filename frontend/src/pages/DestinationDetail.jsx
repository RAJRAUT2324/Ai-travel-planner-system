/**
 * DestinationDetail — Premium travel magazine style experience.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCalendar, FiStar, FiSend, FiInfo, FiLayers, FiActivity, FiMap, FiArrowRight } from 'react-icons/fi';
import { destinationsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import DestinationCard from '../components/DestinationCard';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const DestinationDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [dest, setDest] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            destinationsAPI.getById(id),
            reviewsAPI.getByDestination(id),
            destinationsAPI.getSimilar(id),
        ]).then(([destRes, reviewRes, simRes]) => {
            setDest(destRes.data.destination);
            setReviews(reviewRes.data.reviews || []);
            setAvgRating(reviewRes.data.average_rating || 0);
            setSimilar(simRes.data.recommendations || []);
        }).catch(() => toast.error('Failed to load destination'))
            .finally(() => setLoading(false));
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.rating) return toast.warn('Please select a rating');
        if (!reviewForm.comment.trim()) return toast.warn('Please write a comment');
        setSubmitting(true);
        try {
            await reviewsAPI.create({ destination_id: id, ...reviewForm });
            toast.success('Review submitted!');
            setReviewForm({ rating: 0, comment: '' });
            const res = await reviewsAPI.getByDestination(id);
            setReviews(res.data.reviews || []);
            setAvgRating(res.data.average_rating || 0);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review');
        }
        setSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <LoadingSpinner text="Consulting Travel Logs..." />
        </div>
    );
    
    if (!dest) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Horizon Unknown</h3>
                <p className="text-slate-500 font-medium mb-8">This destination doesn't exist in our logs yet.</p>
                <Link to="/explore" className="btn-primary"><span>Back to Discovery</span></Link>
            </div>
        </div>
    );

    const mainImage = dest.image_ids?.length > 0
        ? `/api/destinations/image/${dest.image_ids[0]}`
        : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=1200&fit=crop';

    const tabs = [
        { id: 'about', label: 'Overview', icon: <FiInfo /> },
        { id: 'attractions', label: 'Sights', icon: <FiMap /> },
        { id: 'tips', label: 'Travel Tips', icon: <FiLayers /> },
        { id: 'reviews', label: 'Reviews', icon: <FiStar /> },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Immersive Hero Header */}
            <header className="relative h-[80vh] min-h-[600px] overflow-hidden">
                <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                    src={mainImage} 
                    alt={dest.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 pt-32 pb-20 px-6 sm:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/10 backdrop-blur-md rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-6">
                                <FiMapPin /> {dest.city}, {dest.country}
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 drop-shadow-sm">
                                {dest.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8 text-slate-600 font-bold uppercase tracking-widest text-sm">
                                <span className="flex items-center gap-2 text-rose-600">
                                    <FiActivity /> 4.9 Activity Rate
                                </span>
                                {avgRating > 0 && (
                                    <span className="flex items-center gap-2">
                                        <FiStar className="text-indigo-600" /> {avgRating} Rating
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <FiCalendar /> {dest.best_season || 'Anytime'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Navigation Tab Sidebar (Sticky) */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-32 space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-slate-900 text-white shadow-xl' 
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        {tab.icon} {tab.label}
                                    </span>
                                    {activeTab === tab.id && <FiArrowRight />}
                                </button>
                            ))}
                            
                            <div className="mt-12 p-8 glass-card border-indigo-50 bg-indigo-50/50">
                                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Planning</h3>
                                <p className="text-sm font-medium text-slate-600 mb-6">Ready to blueprint this destination?</p>
                                <Link to={`/plan?destination=${id}`} className="btn-primary w-full !py-3 text-xs">
                                    <span>Initiate Itinerary</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content Area */}
                    <div className="lg:col-span-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-12"
                            >
                                {activeTab === 'about' && (
                                    <div className="space-y-8">
                                        <div className="prose prose-slate max-w-none">
                                            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 mb-6 uppercase">Overview.</h2>
                                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                                {dest.description}
                                            </p>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <span className="text-2xl font-black text-indigo-600 mb-4 block">₹</span>
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget for One Day to Live There</h4>
                                                <p className="text-2xl font-black text-slate-900">₹{dest.budget_min} - ₹{dest.budget_max}</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <FiCalendar className="text-rose-600 mb-4" size={24} />
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Optimal Window</h4>
                                                <p className="text-2xl font-black text-slate-900">{dest.best_season || 'Year-round'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-4">
                                            {dest.tags?.map(tag => (
                                                <span key={tag} className="tag-badge"># {tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'attractions' && (
                                    <div className="space-y-8">
                                        <h2 className="text-3xl font-bold tracking-tighter text-slate-900 uppercase">Local Attractions.</h2>
                                        <div className="grid gap-4">
                                            {dest.nearby_attractions?.map((a, i) => (
                                                <div key={i} className="group p-6 glass-card hover:bg-white flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                                                            {i + 1}
                                                        </div>
                                                        <span className="font-bold text-slate-900">{a}</span>
                                                    </div>
                                                    <FiMap className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            )) || <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No POI data available.</p>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'tips' && (
                                    <div className="space-y-8">
                                        <h2 className="text-3xl font-bold tracking-tighter text-slate-900 uppercase">Travel Tips & Advice.</h2>
                                        <div className="space-y-4">
                                            {dest.travel_tips?.map((tip, i) => (
                                                <div key={i} className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 flex items-start gap-4">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                                        <FiInfo />
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed">{tip}</p>
                                                </div>
                                            )) || <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tips available yet.</p>}
                                            
                                            <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl">
                                                <h4 className="text-xs font-bold text-white/70 uppercase tracking-[0.3em] mb-4">Recommended Stays</h4>
                                                <div className="space-y-2">
                                                    {dest.nearby_hotels?.map((h, i) => (
                                                        <div key={i} className="text-lg font-bold">🏨 {h}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-10">
                                        <h2 className="text-3xl font-bold tracking-tighter text-slate-900 uppercase">Traveler Reviews.</h2>
                                        
                                        {user && (
                                            <form onSubmit={submitReview} className="p-8 glass-card bg-slate-50 border-slate-200">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Write a Review</h4>
                                                <div className="mb-6">
                                                    <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
                                                </div>
                                                <textarea
                                                    placeholder="Encrypt your thoughts here..."
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                    className="input-field mb-6 bg-white min-h-[120px]"
                                                />
                                                <button type="submit" disabled={submitting} className="btn-primary !px-10">
                                                    <span>{submitting ? 'Transmitting...' : 'Upload Review'}</span>
                                                </button>
                                            </form>
                                        )}

                                        <div className="space-y-6">
                                            {reviews.length === 0 ? (
                                                <div className="py-20 text-center text-slate-400">
                                                    <div className="text-4xl mb-4">🛰️</div>
                                                    <p className="font-bold uppercase tracking-widest text-xs">No reviews documented yet.</p>
                                                </div>
                                            ) : (
                                                reviews.map((r) => (
                                                    <div key={r._id} className="p-8 border border-slate-100 rounded-[2rem] hover:shadow-lg transition-all">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                                                                    {(r.user_name || 'X')[0]}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-900">{r.user_name || 'Anonymous Nomad'}</div>
                                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verified Traveler</div>
                                                                </div>
                                                            </div>
                                                            <StarRating rating={r.rating} size={14} />
                                                        </div>
                                                        <p className="text-slate-600 font-medium leading-relaxed">{r.comment}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Visual Modules */}
                    <div className="lg:col-span-3 space-y-8">
                        <WeatherWidget city={dest.city} />
                        
                        {/* Compact Gallery Module */}
                        <div className="glass-card p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Visual Archives</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {dest.image_ids?.slice(1, 5).map((imgId) => (
                                    <div key={imgId} className="rounded-xl overflow-hidden h-24">
                                        <img src={`/api/destinations/image/${imgId}`} alt="Archive" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                    </div>
                                ))}
                                {(!dest.image_ids || dest.image_ids.length <= 1) && (
                                    <div className="col-span-2 py-8 text-center bg-slate-50 rounded-2xl text-slate-300 italic text-xs">
                                        No visual logs available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                {similar.length > 0 && (
                    <div className="mt-32 pt-32 border-t border-slate-100">
                        <div className="max-w-xl mb-16">
                            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Recommendations</h2>
                            <h3 className="text-5xl font-black tracking-tight text-slate-900">Parallel Horizons.</h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similar.slice(0, 4).map((s, i) => (
                                <DestinationCard key={s._id} destination={s} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DestinationDetail;
