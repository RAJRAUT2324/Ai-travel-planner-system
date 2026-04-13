/**
 * Footer — Premium minimalist footer for VoyageAI.
 */

import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiGlobe, FiRadio } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                    {/* Brand */}
                    <div className="md:col-span-4">
                        <Link to="/" className="flex items-center gap-3 group mb-8">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-950 transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-xl">✈️</span>
                            </div>
                            <span className="font-display font-black text-2xl tracking-tighter text-white">
                                VOYAGE<span className="gradient-text">AI</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                            The definitive travel intelligence engine. Crafting high-fidelity itineraries and discovering the world's hidden cycles through neural architecture.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Navigation</h4>
                        <div className="space-y-4">
                            <Link to="/" className="block text-sm font-bold hover:text-white transition-colors">Portal Home</Link>
                            <Link to="/explore" className="block text-sm font-bold hover:text-white transition-colors">Discovery Grid</Link>
                            <Link to="/plan" className="block text-sm font-bold hover:text-white transition-colors">AI Architect</Link>
                        </div>
                    </div>

                    {/* Operational */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Operational</h4>
                        <div className="space-y-4">
                            <span className="block text-sm font-bold hover:text-white cursor-pointer transition-colors">Network Status</span>
                            <span className="block text-sm font-bold hover:text-white cursor-pointer transition-colors">API Logs</span>
                            <span className="block text-sm font-bold hover:text-white cursor-pointer transition-colors">Archive Access</span>
                        </div>
                    </div>

                    {/* Connect */}
                    <div className="md:col-span-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Global Signal</h4>
                        <div className="flex gap-4 mb-8">
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
                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Node Active. All systems nominal.</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 VOYAGE AI INTELLIGENCE CORP.</p>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Terms of Deployment</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Privacy Protocol</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
