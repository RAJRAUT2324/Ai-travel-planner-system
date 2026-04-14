/**
 * Home — Simplified TripMind landing experience.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMap, FiStar, FiShield, FiZap, FiNavigation, FiGlobe } from 'react-icons/fi';
import { destinationsAPI } from '../services/api';
import DestinationCard from '../components/DestinationCard';

const Home = () => {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        destinationsAPI.getAll({ page: 1, limit: 3 })
            .then(res => setFeatured(res.data.destinations || []))
            .catch(() => { });
    }, []);

    const features = [
        { icon: <FiZap />, title: 'AI Planning', desc: 'Create your perfect travel schedule automatically.', color: 'indigo' },
        { icon: <FiGlobe />, title: 'Any Destination', desc: 'Search for any city or country around the world.', color: 'rose' },
        { icon: <FiNavigation />, title: 'Best Routes', desc: 'Find the easiest way to travel between stops.', color: 'violet' },
        { icon: <FiShield />, title: 'Smart Tips', desc: 'Get helpful advice for hidden gems and safety.', color: 'emerald' },
    ];

    return (
        <div className="bg-white overflow-hidden">
            {/* Immersive Hero Section */}
            <section className="relative min-h-screen flex items-center pt-32 lg:pt-48">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-violet-100/30 rounded-full blur-[80px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Intelligent Travel Planner
                            </div>
                            
                            <h1 className="section-title mb-8">
                                Plan Your <span className="gradient-text">Next Trip</span> <br />
                                <span className="text-slate-400 font-light">Simply with AI.</span>
                            </h1>
                            
                            <p className="section-subtitle mb-12">
                                TripMind turns your travel ideas into an easy plan. 
                                From quick city tours to mountain climbs, get your schedule in seconds.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link to="/plan" className="btn-primary group">
                                    <span>Get Started</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/explore" className="btn-secondary">
                                    Browse Places
                                </Link>
                            </div>

                            {/* Trust Signals */}
                            <div className="mt-16 pt-12 border-t border-slate-100 flex flex-wrap gap-12">
                                <div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">1.2M+</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Plans Created</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">98.4%</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</div>
                                </div>
                                <div className="flex -space-x-3 items-center">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                        </div>
                                    ))}
                                    <div className="pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">+40k Travelers</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interactive Visuals */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative lg:block hidden"
                        >
                            <div className="relative z-10 glass-card p-1 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=1600&fit=crop" 
                                    alt="Hero" 
                                    className="w-full h-auto rounded-[1.9rem]"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                                    <div className="text-white">
                                        <span className="text-xs font-black tracking-[0.3em] uppercase opacity-70">Popular Place</span>
                                        <h3 className="text-3xl font-black mt-2">Dolomites, Italy</h3>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Design</h2>
                            <h3 className="text-3xl font-black tracking-tighter text-slate-900 mb-6">Made for the modern traveler.</h3>
                            <p className="text-slate-500 font-medium">We built TripMind to make trip planning fast, simple, and fun.</p>
                        </div>
                        <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
                            {features.map((feat, i) => (
                                <motion.div
                                    key={feat.title}
                                    whileHover={{ y: -5 }}
                                    className="p-10 glass-card group cursor-pointer"
                                >
                                    <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-8 text-2xl transition-all duration-500 
                                                   ${feat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' : ''}
                                                   ${feat.color === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600' : ''}
                                                   ${feat.color === 'violet' ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-600' : ''}
                                                   ${feat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' : ''}
                                                   group-hover:text-white group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]`}
                                    >
                                        {feat.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feat.title}</h4>
                                    <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Discovery Section */}
            {featured.length > 0 && (
                <section className="py-32 bg-slate-50/50 relative">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
                        >
                            <div className="max-w-xl">
                                <h2 className="text-xs font-black text-rose-600 uppercase tracking-[0.4em] mb-4">Discovery</h2>
                                <h3 className="section-title tracking-tight">Top Destinations.</h3>
                            </div>
                            <Link to="/explore" className="btn-secondary group flex items-center gap-3">
                                <span>See All Places</span>
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {featured.map((dest, i) => (
                                <DestinationCard key={dest._id} destination={dest} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto glass-card gradient-bg p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to start?</h2>
                        <p className="text-xl text-white/80 font-medium mb-12">
                            Join over 40,000 travelers who use TripMind to plan their trips easily.
                        </p>
                        <Link to="/plan" className="inline-flex items-center gap-4 px-12 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all hover:scale-105 shadow-2xl">
                            PLAN YOUR TRIP <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
