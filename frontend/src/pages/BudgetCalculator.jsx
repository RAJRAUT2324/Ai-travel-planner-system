/**
 * BudgetCalculator — AI-powered travel budget planning page.
 * Sends trip params to /api/budget/generate and renders a rich results panel.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDollarSign, FiMapPin, FiCalendar, FiUsers, FiAlertTriangle,
    FiArrowRight, FiLoader, FiShoppingBag, FiStar, FiInfo,
    FiZap, FiTruck, FiCoffee, FiShield, FiCheckCircle
} from 'react-icons/fi';
import { generateBudget } from '../services/budgetService';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const TRAVEL_PARTIES = ['Solo', 'Couple', 'Family', 'Friends Group', 'Business'];

const ACCOMMODATIONS = [
    'Hostel/Dormitory', 'Budget Hotel', '3-Star Hotel',
    '4-Star Hotel', '5-Star/Luxury', 'Airbnb/Apartment', 'Resort'
];

const DIETARY_OPTIONS = [
    'No preference', 'Vegetarian', 'Vegan', 'Halal', 'Jain', 'Gluten-Free', 'Non-Vegetarian'
];

const CATEGORY_ICONS = {
    'Accommodation':    <FiShield />,
    'Food & Dining':    <FiCoffee />,
    'Transport':        <FiTruck />,
    'Activities':       <FiZap />,
    'Shopping':         <FiShoppingBag />,
    'Emergency Buffer': <FiAlertTriangle />,
    'Miscellaneous':    <FiInfo />,
};

const CATEGORY_COLORS = {
    'Accommodation':    'from-indigo-500 to-indigo-600',
    'Food & Dining':    'from-amber-500 to-orange-500',
    'Transport':        'from-emerald-500 to-teal-500',
    'Activities':       'from-violet-500 to-purple-600',
    'Shopping':         'from-rose-500 to-pink-500',
    'Emergency Buffer': 'from-red-400 to-red-500',
    'Miscellaneous':    'from-slate-400 to-slate-500',
};

const TIER_STYLES = {
    'budget':    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'mid-range': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
    'premium':   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500'  },
};

/* ─── Helper ─────────────────────────────────────────────────────────────── */
const fmt = (sym, n) => `${sym}${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const SummaryCard = ({ label, value, sub, accent }) => (
    <div className={`glass-card p-6 border-l-4 ${accent}`}>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>}
    </div>
);

const AllocationBar = ({ item, symbol, total }) => {
    const pct = Math.min(100, Math.round((item.amount / total) * 100));
    const color = CATEGORY_COLORS[item.category] || 'from-slate-400 to-slate-500';
    const icon  = CATEGORY_ICONS[item.category]  || <FiInfo />;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm bg-gradient-to-br ${color}`}>
                        {icon}
                    </span>
                    <span className="font-bold text-slate-700 text-sm">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-sm">{fmt(symbol, item.amount)}</span>
                    <span className="text-xs font-bold text-slate-400 w-10 text-right">{pct}%</span>
                </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

/* ── Travel Mode Costs Card ──────────────────────────────── */
const TravelCostsCard = ({ modes, symbol }) => (
    <div className="glass-card p-8">
        <h2 className="font-black text-slate-900 text-lg mb-2 tracking-tight">🚦 Travel Mode Prices</h2>
        <p className="text-xs text-slate-400 font-medium mb-6">Approximate one-way price per person</p>
        <div className="grid grid-cols-2 gap-4">
            {modes.map((m) => (
                <div key={m.mode} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 hover:border-indigo-100 hover:bg-indigo-50/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="font-black text-slate-800 text-sm">{m.mode}</span>
                    </div>
                    <p className="text-xl font-black text-indigo-600 tracking-tight">{symbol}{Number(m.cost_one_way).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">⏱ {m.duration_hrs}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.note}</p>
                </div>
            ))}
        </div>
    </div>
);

const DayCard = ({ day, symbol }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: day.day * 0.06 }}
        className="glass-card p-6 space-y-4"
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-black flex items-center justify-center shadow-lg shadow-indigo-200">
                    {day.day}
                </span>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Day {day.day}</p>
                    <p className="font-black text-slate-900 text-sm">{day.focus}</p>
                </div>
            </div>
            <span className="text-sm font-black text-indigo-600">{fmt(symbol, day.daily_total)}</span>
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-100">
            {(day.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-emerald-400 shrink-0" size={13} />
                        <span className="text-slate-600 font-medium">{item.description}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold hidden sm:inline">
                            {item.category}
                        </span>
                    </div>
                    <span className="font-bold text-slate-700 shrink-0 ml-2">{fmt(symbol, item.cost)}</span>
                </div>
            ))}
        </div>
    </motion.div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */

const BudgetCalculator = () => {
    const [form, setForm] = useState({
        source: '',
        destination: '',
        total_budget: '',
        currency: 'INR',
        duration: '',
        persons: 1,
        travel_party: 'Solo',
        accommodation: 'Budget Hotel',
        dietary_preference: 'No preference',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [result, setResult]   = useState(null);

    const currencySymbol = CURRENCIES.find(c => c.code === form.currency)?.symbol || '₹';

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!form.destination.trim()) { setError('Please enter a destination.'); return; }
        if (!form.total_budget || Number(form.total_budget) <= 0) { setError('Please enter a valid budget.'); return; }
        if (!form.duration || Number(form.duration) < 1) { setError('Please enter a valid duration (min 1 day).'); return; }

        setLoading(true);
        try {
            const response = await generateBudget({
                ...form,
                total_budget: Number(form.total_budget),
                duration: Number(form.duration),
                persons: Number(form.persons),
            });
            setResult(response.data.budget);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const tierStyle = result ? (TIER_STYLES[result.trip_tier] || TIER_STYLES['mid-range']) : null;

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-violet-100/30 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                        AI-Powered Budget Planner
                    </div>
                    <h1 className="section-title mb-4">
                        Budget <span className="gradient-text">Architect</span>
                    </h1>
                    <p className="section-subtitle mx-auto">
                        Tell us your trip details and our AI will craft a smart, day-by-day budget
                        breakdown tailored to your travel style.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 items-start">

                    {/* ── FORM PANEL ──────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="glass-card p-8 sticky top-32"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Section: Route */}
                            <div>
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <FiMapPin /> Route
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">From (origin city)</label>
                                        <input
                                            id="budget-source"
                                            type="text"
                                            placeholder="e.g. Mumbai (optional)"
                                            className="input-field"
                                            value={form.source}
                                            onChange={e => set('source', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">To (destination) *</label>
                                        <input
                                            id="budget-destination"
                                            type="text"
                                            placeholder="e.g. Dubai"
                                            className="input-field"
                                            value={form.destination}
                                            onChange={e => set('destination', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Trip Details */}
                            <div>
                                <p className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <FiDollarSign /> Trip Details
                                </p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="input-label">Total Budget *</label>
                                            <input
                                                id="budget-total"
                                                type="number"
                                                min="1"
                                                placeholder="e.g. 50000"
                                                className="input-field"
                                                value={form.total_budget}
                                                onChange={e => set('total_budget', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="input-label">Currency</label>
                                            <select
                                                id="budget-currency"
                                                className="input-field"
                                                value={form.currency}
                                                onChange={e => set('currency', e.target.value)}
                                            >
                                                {CURRENCIES.map(c => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.symbol} {c.code} — {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Duration (days) *</label>
                                        <input
                                            id="budget-duration"
                                            type="number"
                                            min="1"
                                            max="30"
                                            placeholder="e.g. 7"
                                            className="input-field"
                                            value={form.duration}
                                            onChange={e => set('duration', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Travel Party */}
                            <div>
                                <p className="text-xs font-black text-violet-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <FiUsers /> Travel Party
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">Party Type</label>
                                        <select
                                            id="budget-party"
                                            className="input-field"
                                            value={form.travel_party}
                                            onChange={e => set('travel_party', e.target.value)}
                                        >
                                            {TRAVEL_PARTIES.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">No. of Travelers</label>
                                        <input
                                            id="budget-persons"
                                            type="number"
                                            min="1"
                                            max="50"
                                            className="input-field"
                                            value={form.persons}
                                            onChange={e => set('persons', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Preferences */}
                            <div>
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <FiStar /> Preferences
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">Accommodation</label>
                                        <select
                                            id="budget-accommodation"
                                            className="input-field"
                                            value={form.accommodation}
                                            onChange={e => set('accommodation', e.target.value)}
                                        >
                                            {ACCOMMODATIONS.map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">Dietary Preference</label>
                                        <select
                                            id="budget-diet"
                                            className="input-field"
                                            value={form.dietary_preference}
                                            onChange={e => set('dietary_preference', e.target.value)}
                                        >
                                            {DIETARY_OPTIONS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium"
                                    >
                                        <FiAlertTriangle className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                id="budget-generate-btn"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        <span>Generating plan…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate budget plan</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* ── RESULTS PANEL ───────────────────────────────────── */}
                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            {!result && !loading && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-card p-16 text-center"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                                        <FiDollarSign className="text-indigo-400" size={36} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-700 mb-3">Your budget plan will appear here</h3>
                                    <p className="text-slate-400 font-medium">Fill in the form and hit <em>Generate budget plan</em>.</p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-card p-16 text-center"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                                        <FiLoader className="text-indigo-500 animate-spin" size={36} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-700 mb-3">AI is crunching the numbers…</h3>
                                    <p className="text-slate-400 font-medium">Groq llama-3.1 is building your personalized budget. Usually takes 3–8 seconds.</p>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8"
                                >
                                    {/* ① Summary Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <SummaryCard
                                            label="Trip Tier"
                                            value={<span className={`capitalize ${tierStyle?.text}`}>{result.trip_tier}</span>}
                                            sub={`${result.destination}${result.source && result.source !== 'N/A' ? ` from ${result.source}` : ''}`}
                                            accent={`border-indigo-400`}
                                        />
                                        <SummaryCard
                                            label="Travelers"
                                            value={result.persons}
                                            sub={result.travel_party || 'Travelers'}
                                            accent="border-violet-400"
                                        />
                                        <SummaryCard
                                            label="Daily / Person"
                                            value={fmt(currencySymbol, result.per_day_per_person)}
                                            sub="per day, per person"
                                            accent="border-emerald-400"
                                        />
                                        <SummaryCard
                                            label="Total Budget"
                                            value={fmt(currencySymbol, result.total_budget)}
                                            sub={`${result.duration} days · ${result.currency}`}
                                            accent="border-rose-400"
                                        />
                                    </div>

                                    {/* ① (b) Travel Mode Costs */}
                                    {result.travel_mode_costs?.length > 0 && (
                                        <TravelCostsCard
                                            modes={result.travel_mode_costs}
                                            symbol={currencySymbol}
                                        />
                                    )}

                                    {/* ② Budget Warning */}
                                    {result.budget_warning && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl"
                                        >
                                            <FiAlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
                                            <div>
                                                <p className="font-black text-amber-800 mb-1">Budget Alert</p>
                                                <p className="text-sm text-amber-700 font-medium">{result.budget_warning}</p>
                                                {result.suggested_min_budget && (
                                                    <p className="text-xs text-amber-600 mt-2 font-bold">
                                                        Suggested minimum: {fmt(result.currency_symbol || currencySymbol, result.suggested_min_budget)}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ③ Budget Allocation */}
                                    <div className="glass-card p-8">
                                        <h2 className="font-black text-slate-900 text-lg mb-6 tracking-tight">
                                            Budget Allocation
                                        </h2>
                                        <div className="space-y-5">
                                            {(result.allocation || []).map(item => (
                                                <AllocationBar
                                                    key={item.category}
                                                    item={item}
                                                    symbol={currencySymbol}
                                                    total={result.total_budget}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* ④ Daily Plan */}
                                    <div>
                                        <h2 className="font-black text-slate-900 text-lg mb-5 tracking-tight">
                                            Daily Management Plan
                                        </h2>
                                        <div className="space-y-4">
                                            {(result.daily_plan || []).map(day => (
                                                <DayCard
                                                    key={day.day}
                                                    day={day}
                                                    symbol={currencySymbol}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* ⑤ Saving Tips */}
                                    {result.saving_tips?.length > 0 && (
                                        <div className="rounded-[2rem] bg-slate-900 p-8 text-white">
                                            <h2 className="font-black text-lg mb-5 tracking-tight">
                                                💡 Money Saving Tips
                                            </h2>
                                            <ul className="space-y-3">
                                                {result.saving_tips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm">
                                                        <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-slate-300 font-medium">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* ⑥ Best Value Experiences */}
                                    {result.best_value_experiences?.length > 0 && (
                                        <div className="rounded-[2rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-500 p-8 text-white">
                                            <h2 className="font-black text-lg mb-5 tracking-tight">
                                                ⚡ Best Value Experiences
                                            </h2>
                                            <div className="space-y-4">
                                                {result.best_value_experiences.map((exp, i) => (
                                                    <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-black text-sm">{exp.activity}</span>
                                                            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">
                                                                {fmt(currencySymbol, exp.cost)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-white/80 font-medium">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ⑦ FX Note */}
                                    {result.fx_note && (
                                        <div className="flex items-start gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <FiInfo className="text-indigo-400 mt-0.5 shrink-0" size={18} />
                                            <div>
                                                <p className="font-black text-indigo-800 text-sm mb-1">Exchange Rate Note</p>
                                                <p className="text-sm text-indigo-700 font-medium">{result.fx_note}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetCalculator;
