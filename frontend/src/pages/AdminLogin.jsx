import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (credentials.email !== 'admin@travelplanner.com' || credentials.password !== 'admin123') {
            toast.error('Unauthorized Access: Invalid Admin Credentials');
            setLoading(false);
            return;
        }

        try {
            const userData = await authLogin(credentials.email, credentials.password);
            if (userData.role === 'admin' || userData.role === 'super_admin') {
                toast.success('Access Authorized: Welcome to the Admin Portal');
                navigate('/admin');
            } else {
                toast.error('Access Denied: Administrative privileges required');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Authorization Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden font-sans">
            {/* Soft Vibrant Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-200/40 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-200/40 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-10 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-xl"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 mb-6">
                        <FiShield className="text-2xl text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        TripMind Admin Portal
                    </h1>

                    <p className="text-slate-400 mt-2 text-xs uppercase tracking-widest">
                        Secure Admin Access
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Email
                        </label>

                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                className="w-full border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none"
                                placeholder="admin@travelplanner.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Password
                        </label>

                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="w-full border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                Login
                                <FiArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        Authorized Access Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
