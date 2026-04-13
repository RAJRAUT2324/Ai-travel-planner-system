/**
 * Register — Premium account creation experience for VoyageAI.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.warn('Please fill all fields');
        if (form.password !== form.confirmPassword) return toast.warn('Passwords do not match');
        if (form.password.length < 6) return toast.warn('Password must be at least 6 characters');

        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Registration successful! Clearance granted.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6 py-20 relative overflow-hidden">
            {/* Background Polish */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-rose-100/30 rounded-full blur-[100px] -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-xl"
            >
                <div className="text-center mb-16">
                    <Link to="/" className="inline-flex items-center gap-3 group mb-8">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300">
                            <span className="text-xl">✈️</span>
                        </div>
                        <span className="font-display font-black text-2xl tracking-tighter text-slate-900">
                            VOYAGE<span className="gradient-text">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">New Personnel</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Initiating traveler onboarding</p>
                </div>

                <div className="glass-card p-12 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Manifest Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input type="text" placeholder="John Doe" value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="input-field !pl-16" required />
                            </div>
                        </div>

                        <div>
                            <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Login Identifier (Email)</label>
                            <div className="relative">
                                <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input type="email" placeholder="nomad@voyage.ai" value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="input-field !pl-16" required />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Access Key</label>
                                <div className="relative">
                                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="password" placeholder="••••••••" value={form.password}
                                        onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="input-field !pl-16" required />
                                </div>
                            </div>
                            <div>
                                <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Verify Key</label>
                                <div className="relative">
                                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="password" placeholder="••••••••" value={form.confirmPassword}
                                        onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                        className="input-field !pl-16" required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full !py-5 group bg-slate-900 mt-4"
                        >
                            <span>{loading ? 'Processing...' : 'Create Collective Access'}</span>
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Known Entity?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                                Resume Session
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
