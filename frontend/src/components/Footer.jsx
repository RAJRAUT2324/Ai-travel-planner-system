/**
 * Footer — Updated TripMind footer with simplified language and contact details.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiGlobe, FiMail, FiPhone, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-24 border-t border-white/5 relative group/footer">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                    {/* Brand */}
                    <div className="md:col-span-4">
                        <Link to="/" className="flex items-center gap-3 group mb-8">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-950 transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-xl">✈️</span>
                            </div>
                            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">
                                TRIP<span className="gradient-text">MIND</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                            The easy-to-use travel planner. We help you create perfect itineraries and find the best places to visit around the world using AI.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Links</h4>
                        <div className="space-y-4">
                            <Link to="/" className="block text-sm font-bold hover:text-white transition-colors">Home</Link>
                            <Link to="/explore" className="block text-sm font-bold hover:text-white transition-colors">Destinations</Link>
                            <Link to="/plan" className="block text-sm font-bold hover:text-white transition-colors">Plan Trip</Link>
                        </div>
                    </div>

                    {/* Contact Details (Krishna Londe) */}
                    <div className="md:col-span-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Contact Us</h4>
                        <div className="space-y-4">
                            <a href="mailto:krishnalonde2005@gmail.com" className="flex items-center gap-3 text-sm font-bold hover:text-white transition-colors">
                                <FiMail className="text-indigo-500" /> krishnalonde2005@gmail.com
                            </a>
                            <a href="tel:+919356935361" className="flex items-center gap-3 text-sm font-bold hover:text-white transition-colors">
                                <FiPhone className="text-indigo-500" /> +91 9356935361
                            </a>
                            <a href="https://www.linkedin.com/in/krishna-ravindra-londe-76660a290" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold hover:text-white transition-colors">
                                <FiLinkedin className="text-indigo-500" /> Krishna Londe
                            </a>
                        </div>
                    </div>

                    {/* Connect */}
                    <div className="md:col-span-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Follow Us</h4>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                <FiTwitter size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                <FiGithub size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                <FiGlobe size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 relative">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 TRIPMIND TRAVEL TECHNOLOGIES</p>
                    
                    {/* Developer Credits - Only Visible on Footer Hover */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="opacity-0 group-hover/footer:opacity-100 transition-all duration-700 flex flex-col md:items-end"
                    >
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Developed by</p>
                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">RAJ RAUT & SHREYAS DAKHOLE</p>
                    </motion.div>

                    <div className="flex gap-8">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer hover:text-slate-400">Terms</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer hover:text-slate-400">Privacy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
