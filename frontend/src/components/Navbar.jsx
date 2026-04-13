/**
 * Navbar — premium floating navigation with glassmorphism and smooth animations.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiCompass, FiHome, FiPlusCircle, FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Portal', icon: <FiHome /> },
        { to: '/explore', label: 'Destinations', icon: <FiCompass /> },
        { to: '/plan', label: 'AI Planner', icon: <FiPlusCircle />, protected: true },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 sm:px-8 ${scrolled ? 'pt-2 md:pt-4' : 'pt-4 md:pt-6'}`}>
            <nav className={`max-w-7xl mx-auto transition-all duration-500 rounded-2xl md:rounded-3xl border ${
                scrolled 
                ? 'bg-white/60 backdrop-blur-2xl shadow-xl border-white/20' 
                : 'bg-transparent border-transparent'
            }`}>
                <div className="px-6 sm:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Brand Logo */}
                        <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-lg md:text-xl">✈️</span>
                            </div>
                            <span className="font-display font-black text-xl md:text-2xl tracking-tighter text-slate-900 uppercase">
                                VOYAGE<span className="gradient-text">AI</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Items */}
                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => {
                                if (link.protected && !user) return null;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`nav-link flex items-center gap-2 group ${isActive(link.to) ? 'active' : ''}`}
                                    >
                                        <span className={`transition-transform duration-300 group-hover:-translate-y-0.5 ${isActive(link.to) ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                    {isAdmin && (
                                        <Link to="/admin" className="p-3 text-rose-500 hover:bg-white rounded-xl transition-all shadow-sm" title="Admin Dashboard">
                                            <FiBarChart2 size={20} />
                                        </Link>
                                    )}
                                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                                            {user.name[0]}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                                    </Link>
                                    <button onClick={logout} className="p-3 text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
                                        <FiLogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Sign In</Link>
                                    <Link to="/register" className="btn-primary !py-3 !px-6 group">
                                        <span>Start Experience</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Button */}
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-900 hover:bg-slate-200 transition-colors"
                        >
                            {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden absolute top-[100%] left-0 right-0 mt-4 mx-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 overscroll-contain"
                        >
                            <div className="space-y-4">
                                {navLinks.map((link) => {
                                    if (link.protected && !user) return null;
                                    return (
                                        <Link 
                                            key={link.to} 
                                            to={link.to} 
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-lg font-bold transition-all
                                            ${isActive(link.to) ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600'}`}
                                        >
                                            {link.icon} {link.label}
                                        </Link>
                                    );
                                })}
                                <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                                    {user ? (
                                        <>
                                            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl text-lg font-bold text-slate-600">
                                                <FiUser /> Profile Settings
                                            </Link>
                                            <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-3 w-full px-6 py-4 bg-rose-50 rounded-2xl text-lg font-bold text-rose-600">
                                                <FiLogOut /> Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-600">
                                                Sign In
                                            </Link>
                                            <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold">
                                                Join Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
