/**
 * Login — Premium authentication interface for VoyageAI.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.warn('Please fill all fields');
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Access Granted. Welcome back.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Authentication Failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6 py-20 relative overflow-hidden">
            {/* Background Polish */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-rose-100/30 rounded-full blur-[100px] -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Resuming Session</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Security clearance required</p>
                </div>

                <div className="glass-card p-12 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Encoded Identity (Email)</label>
                            <div className="relative">
                                <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="nomad@voyage.ai" 
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="input-field !pl-16 shadow-sm focus:shadow-indigo-50" 
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-3">Access Key (Password)</label>
                            <div className="relative">
                                <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="input-field !pl-16 shadow-sm focus:shadow-indigo-50" 
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full !py-5 group bg-slate-900 hover:bg-slate-800"
                        >
                            <span>{loading ? 'Validating...' : 'Authorize Access'}</span>
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            New Explorer?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                                Join our Collective
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
