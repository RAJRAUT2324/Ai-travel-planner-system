/**
 * PlanTrip — Premium multi-step AI wizard with Suggestion Selection.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMapPin, FiUsers, FiCalendar, FiArrowRight, FiArrowLeft, FiZap, FiCheck, FiInfo } from 'react-icons/fi';
import { itineraryAPI, destinationsAPI } from '../services/api';
import { toast } from 'react-toastify';

const INTERESTS = ['adventure', 'beach', 'nature', 'food', 'culture', 'luxury', 'religious', 'wildlife', 'romantic', 'nightlife', 'shopping', 'photography'];
const TRANSPORT = ['any', 'flight', 'train', 'bus', 'car', 'self-drive'];
const STAY = ['hotel', 'hostel', 'resort', 'homestay', 'airbnb', 'camping'];
const FOOD = ['any', 'vegetarian', 'vegan', 'non-vegetarian', 'local-cuisine', 'fine-dining'];

const PlanTrip = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [destinations, setDestinations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        budget: '',
        travel_type: 'solo',
        members: 2,
        children: 0,
        duration: 3,
        destination_id: searchParams.get('destination') || '',
        destination_name: '', // For suggested/discovered names
        interests: [],
        transport: 'any',
        stay: 'hotel',
        food: 'any',
    });

    useEffect(() => {
        destinationsAPI.getAllSimple()
            .then(res => setDestinations(res.data.destinations || []))
            .catch(() => { });
    }, []);

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const getSuggestions = async () => {
        if (!form.budget || form.budget <= 0) return toast.warn('Please set a budget first');
        setLoadingSuggestions(true);
        try {
            const res = await itineraryAPI.suggest({
                budget: parseFloat(form.budget),
                travel_type: form.travel_type,
                duration: parseInt(form.duration),
                interests: form.interests
            });
            setSuggestions(res.data.suggestions || []);
            toast.success('AI Suggestions Retrieved');
        } catch (err) {
            toast.error('Failed to get suggestions');
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const selectSuggestion = (sug) => {
        update('destination_name', sug.name);
        update('destination_id', ''); // Clear ID to trigger AI Discovery for this name
        toast.info(`Target Acquired: ${sug.name}`);
    };

    const toggleInterest = (interest) => {
        setForm(f => ({
            ...f,
            interests: f.interests.includes(interest)
                ? f.interests.filter(i => i !== interest)
                : [...f.interests, interest],
        }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!form.budget) return toast.warn('Set a budget');
        }
        setStep(s => Math.min(4, s + 1));
    };
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.budget || parseFloat(form.budget) <= 0) return toast.warn('Please enter a valid budget');
        if (!form.duration || form.duration <= 0) return toast.warn('Please enter trip duration');
        if (form.interests.length === 0) return toast.warn('Please select at least one interest');

        setGenerating(true);
        try {
            // Sanitize payload: don't send empty strings for IDs
            const payload = { 
                ...form, 
                budget: parseFloat(form.budget), 
                duration: parseInt(form.duration),
                destination_id: form.destination_id || null
            };
            const res = await itineraryAPI.generate(payload);
            toast.success('Voyage Blueprint Synchronized');
            navigate(`/itinerary/${res.data.itinerary_id}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Intelligence failed to generate route');
            setGenerating(false);
        }
    };

    if (generating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
                <div className="max-w-md w-full text-center">
                    <div className="relative w-32 h-32 mx-auto mb-12">
                        <motion.div
                            className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse text-indigo-500 opacity-80 mt-1">📡</div>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Synthesizing Odyssey.</h2>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed uppercase tracking-[0.2em] text-[10px]">
                        Running high-fidelity simulations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">Blueprint Engine.</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Phase {step} of 4 — {
                          step === 1 ? 'Target Acquisition' : 
                          step === 2 ? 'Logic Parameters' : 
                          step === 3 ? 'Interest Modulation' : 
                          'Service Configuration'
                        }</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i <= step ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-200'}`} />
                        ))}
                    </div>
                </div>

                <div className="glass-card bg-white p-8 md:p-12 shadow-2xl relative overflow-hidden border-slate-100">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="input-label !text-[10px] uppercase tracking-widest font-black text-slate-400">Total Budget (₹ INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                                            <input type="number" placeholder="e.g. 50000" value={form.budget}
                                                onChange={(e) => update('budget', e.target.value)} className="input-field !pl-12" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="input-label !text-[10px] uppercase tracking-widest font-black text-slate-400">Trip Duration (Days)</label>
                                        <div className="relative">
                                            <FiCalendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" min={1} max={30} value={form.duration}
                                                onChange={(e) => update('duration', e.target.value)} className="input-field !pl-14" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="input-label !text-[10px] uppercase tracking-widest font-black text-slate-400">Target Destination</label>
                                        <button 
                                            type="button" 
                                            onClick={getSuggestions}
                                            disabled={loadingSuggestions}
                                            className="text-indigo-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:underline disabled:opacity-50"
                                        >
                                            <FiZap /> {loadingSuggestions ? 'Syncing...' : 'Get AI Suggestions'}
                                        </button>
                                    </div>
                                    
                                    <div className="grid gap-4">
                                        <select 
                                            value={form.destination_id} 
                                            onChange={(e) => {
                                                update('destination_id', e.target.value);
                                                update('destination_name', '');
                                            }} 
                                            className="input-field"
                                        >
                                            <option value="">AI Mode: Manual Input or Suggestions</option>
                                            {destinations.map(d => (
                                                <option key={d._id} value={d._id}>{d.name} — {d.city}, {d.country}</option>
                                            ))}
                                        </select>
                                        
                                        {/* Manual/Suggested Input display */}
                                        {!form.destination_id && (
                                             <div className="relative">
                                                <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Or type any city (e.g. Zurich)..." 
                                                    value={form.destination_name}
                                                    onChange={(e) => update('destination_name', e.target.value)}
                                                    className="input-field !pl-14"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggestions Row */}
                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-3 gap-4 pt-4">
                                                {suggestions.map((sug, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectSuggestion(sug)}
                                                        className={`p-6 rounded-3xl border-2 text-left transition-all ${
                                                            form.destination_name === sug.name 
                                                            ? 'border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-50' 
                                                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black text-slate-900 mb-2 uppercase">{sug.city}</div>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{sug.country}</div>
                                                        <div className="text-[9px] text-slate-400 font-medium leading-relaxed italic line-clamp-2">
                                                            {sug.reason}
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personnel Manifest.</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { id: 'solo', icon: '🧍' },
                                        { id: 'couple', icon: '💑' },
                                        { id: 'family', icon: '👨‍👩‍👧‍👦' },
                                        { id: 'friends', icon: '👫' }
                                    ].map(type => (
                                        <button 
                                            key={type.id} 
                                            type="button" 
                                            onClick={() => update('travel_type', type.id)}
                                            className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${
                                                form.travel_type === type.id 
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl' 
                                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
                                            }`}
                                        >
                                            <span className="text-3xl">{type.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type.id}</span>
                                        </button>
                                    ))}
                                </div>

                                {form.travel_type === 'family' && (
                                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 grid sm:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="input-label !text-[10px] uppercase tracking-widest font-black text-slate-400">Total Personnel</label>
                                            <input type="number" min={2} value={form.members}
                                                onChange={(e) => update('members', parseInt(e.target.value))} className="input-field shadow-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="input-label !text-[10px] uppercase tracking-widest font-black text-slate-400">Juveniles</label>
                                            <input type="number" min={0} value={form.children}
                                                onChange={(e) => update('children', parseInt(e.target.value))} className="input-field shadow-sm" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Signal Modulation.</h3>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map(interest => (
                                        <button 
                                            key={interest} 
                                            type="button" 
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                form.interests.includes(interest)
                                                    ? 'bg-indigo-600 text-white shadow-xl scale-105'
                                                    : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-indigo-200'
                                            }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Operational Support.</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-4">Transit Interface</label>
                                        <select value={form.transport} onChange={(e) => update('transport', e.target.value)} className="input-field">
                                            {TRANSPORT.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-4">Base Operations</label>
                                        <select value={form.stay} onChange={(e) => update('stay', e.target.value)} className="input-field">
                                            {STAY.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="input-label !text-[10px] uppercase tracking-[0.2em] mb-4">Fuel Signature</label>
                                        <select value={form.food} onChange={(e) => update('food', e.target.value)} className="input-field">
                                            {FOOD.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="p-10 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center gap-8">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm text-2xl font-black ring-4 ring-indigo-100/50">
                                        ✓
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Blueprint Synchronized.</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">All parameters verified. AI synthesis available.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
                        <button 
                            type="button" 
                            onClick={prevStep} 
                            disabled={step === 1}
                            className={`flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:text-slate-900 disabled:opacity-0`}
                        >
                            <FiArrowLeft /> Previous Phase
                        </button>
                        
                        {step < 4 ? (
                            <button 
                                type="button" 
                                onClick={nextStep}
                                className="btn-primary w-full sm:w-auto !py-5 shadow-2xl"
                            >
                                <span>Proceed</span> <FiArrowRight />
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handleSubmit}
                                className="btn-primary w-full sm:w-auto !bg-indigo-600 !py-5 shadow-2xl ring-8 ring-indigo-50"
                            >
                                <span>Synthesize Odyssey</span> <FiSend />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanTrip;
