/**
 * ItineraryView — Your Trip Plan experience.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiMapPin, FiClock, FiAlertTriangle, FiArrowLeft, FiNavigation, FiCoffee, FiMoon, FiShield } from 'react-icons/fi';
import { itineraryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ItineraryView = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        itineraryAPI.getById(id)
            .then(res => {
                setData(res.data.itinerary);
                if (res.data.itinerary?.plan_data?.days?.length > 0) {
                    setActiveDay(res.data.itinerary.plan_data.days[0].day);
                }
            })
            .catch(() => toast.error('Failed to load itinerary'))
            .finally(() => setLoading(false));
    }, [id]);
    const plan = data?.plan_data || {};
    const allMeals = plan.days?.flatMap(d => d.meals?.map(m => m.suggestion) || []) || [];
    const uniqueMeals = [...new Set(allMeals)].filter(m => m && m.length > 4).slice(0, 2);
    const bestHotel = plan.days?.map(d => d.accommodation?.suggestion).filter(Boolean)[0] || 'Premium Local Hotel';
    const topTip = plan.days?.flatMap(d => d.activities?.map(a => a.tips).filter(Boolean))[0] || 'Carry some local currency and a universal power adapter.';

    const downloadPdf = async () => {
        try {
            toast.info('Generating high-quality PDF...', { autoClose: 2000 });
            
            // Dynamically load html2pdf if not present
            if (!window.html2pdf) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            }
            
            const pdfContainer = document.createElement('div');
            pdfContainer.innerHTML = `
                <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
                    <div style="text-align: center; margin-bottom: 40px; border-bottom: 4px solid #4f46e5; padding-bottom: 25px;">
                        <h1 style="color: #4f46e5; font-size: 36px; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">🌍 TripMind Travel Experts ✈️</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                            Official Itinerary Document • Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div style="background: white; padding: 35px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 40px; display: flex; flex-direction: column; gap: 15px; page-break-inside: avoid;">
                        <h2 style="font-size: 32px; margin: 0; color: #0f172a; text-transform: uppercase; font-weight: 800; letter-spacing: -1px;">${plan.destination_name || 'Adventure Trip'} 🗺️</h2>
                        <p style="color: #475569; font-size: 18px; line-height: 1.6; margin: 0;">${plan.trip_summary || 'Your personalized travel experience.'}</p>
                        
                        <div style="display: flex; gap: 15px; margin-top: 10px;">
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; flex: 1;">
                                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; margin-bottom: 5px;">Total Budget Required</div>
                                <div style="color: #0f172a; font-size: 20px; font-weight: 900;">₹${plan.total_estimated_cost || 0}</div>
                            </div>
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; flex: 1;">
                                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; margin-bottom: 5px;">Budget Status</div>
                                <div style="color: ${plan.budget_status === 'within_budget' ? '#059669' : '#e11d48'}; font-size: 16px; font-weight: 800; text-transform: uppercase;">
                                    ${plan.budget_status?.replace('_', ' ') || 'Unknown'} 💸
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px; margin-bottom: 40px; page-break-inside: avoid;">
                        <div style="flex: 1; background: #e0e7ff; padding: 25px; border-radius: 16px; border: 1px solid #c7d2fe;">
                            <h3 style="margin: 0 0 15px 0; color: #3730a3; font-size: 16px; text-transform: uppercase; font-weight: 900;">🌟 Premier Stay Recommendation</h3>
                            <b style="color: #1e3a8a; font-size: 18px;">${bestHotel}</b>
                            <p style="margin: 5px 0 0 0; color: #4f46e5; font-size: 13px;">Highly recommended basecamp for your journey.</p>
                        </div>
                        <div style="flex: 1; background: #fef3c7; padding: 25px; border-radius: 16px; border: 1px solid #fde68a;">
                            <h3 style="margin: 0 0 15px 0; color: #b45309; font-size: 16px; text-transform: uppercase; font-weight: 900;">🍽️ Local Culinary Must-Haves</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 15px; font-weight: bold;">
                                ${uniqueMeals.map(m => `<li style="margin-bottom: 5px;">${m}</li>`).join('')}
                                ${uniqueMeals.length === 0 ? '<li>Local street food exploration</li>' : ''}
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px 25px; border-radius: 16px; border: 1px solid #a7f3d0; margin-bottom: 40px; page-break-inside: avoid;">
                        <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 14px; text-transform: uppercase; font-weight: 900;">💡 Essential Pro-Tip</h3>
                        <p style="margin: 0; color: #065f46; font-size: 15px; line-height: 1.5;">${topTip}</p>
                    </div>


                    ${plan.days?.map(day => `
                        <div style="margin-bottom: 35px; background: white; padding: 35px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-left: 8px solid #4f46e5;">
                            <div style="page-break-inside: avoid; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 25px;">
                                <h3 style="font-size: 24px; color: #1e293b; text-transform: uppercase; margin: 0; font-weight: 800;">
                                    📅 Day ${day.day}: ${day.title}
                                </h3>
                                <div style="background: #e0e7ff; color: #4f46e5; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; text-transform: uppercase;">
                                    Daily Est: ₹${day.daily_total || 0}
                                </div>
                            </div>
                            
                            ${day.activities?.map(act => `
                                <div style="page-break-inside: avoid; margin-bottom: 25px; padding-left: 20px; border-left: 3px dashed #cbd5e1;">
                                    <div style="color: #4f46e5; font-weight: 800; font-size: 15px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">⏰ ${act.time}</div>
                                    <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">📍 ${act.activity}</h4>
                                    <p style="margin: 0 0 10px 0; color: #475569; font-size: 16px; line-height: 1.5;">${act.description}</p>
                                    ${act.tips ? `<p style="margin: 0; color: #059669; font-size: 14px; font-weight: 700; background: #ecfdf5; padding: 8px 12px; border-radius: 8px; display: inline-block;">💡 Tip: ${act.tips}</p>` : ''}
                                </div>
                            `).join('')}
                            
                            <div style="page-break-inside: avoid; margin-top: 25px; padding-top: 25px; border-top: 2px solid #f1f5f9; display: flex; flex-direction: column; gap: 15px;">
                                <h4 style="margin: 0; font-size: 16px; color: #0f172a; text-transform: uppercase; font-weight: 800; display: flex; align-items: center; gap: 8px;">🍽️ Dining & Logistics</h4>
                                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                    ${day.accommodation ? `
                                        <div style="width: 100%; background: #f8fafc; padding: 15px 20px; border-radius: 10px; border: 1px solid #e2e8f0; box-sizing: border-box;">
                                            <h5 style="margin: 0 0 5px 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800;">🏨 Accommodation</h5>
                                            <b style="color: #0f172a; font-size: 16px;">${day.accommodation.suggestion}</b> <span style="color: #64748b;">(${day.accommodation.type})</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${day.meals?.map(meal => `
                                        <div style="flex: 1; min-width: 200px; background: #fffbeb; padding: 15px 20px; border-radius: 10px; border: 1px solid #fef3c7; box-sizing: border-box;">
                                            <h5 style="margin: 0 0 5px 0; color: #d97706; font-size: 12px; text-transform: uppercase; font-weight: 800;">${meal.type === 'Breakfast' ? '🥞' : meal.type === 'Lunch' ? '🌮' : '🍝'} ${meal.type}</h5>
                                            <b style="color: #92400e; font-size: 14px;">${meal.suggestion}</b>
                                        </div>
                                    `).join('') || ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}

                    <div style="page-break-inside: avoid; margin-top: 40px; background: white; padding: 35px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 20px 0; color: #0f172a; font-size: 24px; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">📘 Essential Traveler's Matrix</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                            <thead>
                                <tr style="background-color: #f8fafc;">
                                    <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569; text-transform: uppercase; font-weight: 800;">Category</th>
                                    <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569; text-transform: uppercase; font-weight: 800;">Guideline / Protocol</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">🏥 Medical Safety</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Carry basic first aid, prescriptions, and identify local emergency numbers before arrival. Maintain travel insurance records.</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">🛡️ Security</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Keep digital copies of passport/ID on secure cloud storage. Avoid displaying high-value items in unfamiliar dense areas.</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">🤝 Cultural Rule</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Dress modestly near religious sites and respect local photography laws. Learn basic greeting phrases in the local dialect.</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; color: #0f172a; font-weight: bold;">🔌 Ops Gear</td>
                                    <td style="padding: 15px; color: #64748b;">Verify local power socket types. Pre-download maps for offline use and install translation applications.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="text-align: center; margin-top: 60px; color: #94a3b8; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; page-break-inside: avoid;">
                        ❤️ Have a phenomenal trip! 🌟<br/>
                        <span style="font-size: 11px; margin-top: 8px; display: block;">Generated instantly by TripMind.</span>
                    </div>
                </div>
            `;
            
            const opt = {
                margin:       [0.5, 0.5, 0.5, 0.5],
                filename:     `TripMind_${plan.destination_name || 'Itinerary'}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            await window.html2pdf().set(opt).from(pdfContainer).save();
            toast.success('Premium PDF Downloaded Successfully! 🎉');
        } catch (err) {
            console.error('PDF Generation Error:', err);
            toast.error('Failed to generate PDF. Check browser console.');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
            <LoadingSpinner text="Opening Itinerary..." />
        </div>
    );
    
    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-center p-6">
            <div>
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 uppercase">Trip Not Found</h3>
                <p className="text-slate-500 font-medium mb-8">This itinerary ID does not match our records.</p>
                <Link to="/profile" className="btn-primary"><span>Back to Saved Trips</span></Link>
            </div>
        </div>
    );



    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 selection:bg-indigo-100 selection:text-indigo-900 pt-32 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12">
                    <FiArrowLeft /> Back to Trips
                </Link>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Sidebar: Metadata & Controls */}
                    <aside className="lg:col-span-4 space-y-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-6 border border-slate-200 shadow-sm">
                                Trip Itinerary #{id.slice(-6)}
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-4 uppercase">
                                {plan.destination_name}
                            </h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                                {plan.trip_summary}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <span className="text-2xl font-black text-indigo-600 mb-3 block">₹</span>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Cost</div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tighter">₹{plan.total_estimated_cost}</div>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <FiNavigation className="text-indigo-600 mb-3" />
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tighter">{plan.days?.length} Days</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-8">
                                <button onClick={downloadPdf} className="btn-primary w-full !bg-indigo-600 !text-white group border-none shadow-lg">
                                    <span>Download Itinerary (PDF)</span>
                                    <FiDownload className="group-hover:translate-y-1 transition-transform" />
                                </button>
                                <Link to={`/map/${id}`} className="btn-primary w-full border border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50 transition-all shadow-sm">
                                    <span>View Route Map</span>
                                    <FiNavigation className="text-indigo-600" />
                                </Link>
                            </div>
                        </motion.div>

                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Budget Status</h3>
                            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                plan.budget_status === 'within_budget' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                                <FiShield size={24} />
                                <div>
                                    <div className="text-sm font-bold uppercase tracking-tight">Status: {plan.budget_status?.replace('_', ' ')}</div>
                                    <div className="text-[10px] opacity-80 font-bold uppercase mt-0.5">{plan.budget_warning || 'Trip is within your budget.'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Expert Suggestions</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        <span className="text-lg">🌟</span> Best Hotel
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <div className="text-sm font-bold text-indigo-900">{bestHotel}</div>
                                        <div className="text-[10px] uppercase font-bold text-indigo-500 mt-1">Recommended Basecamp</div>
                                    </div>
                                </div>
                                
                                {uniqueMeals.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            <span className="text-lg">🍽️</span> Top Local Dishes
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {uniqueMeals.map((meal, i) => (
                                                <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs font-bold text-amber-900">
                                                    {meal}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        <span className="text-lg">💡</span> Pro-Tip
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="text-xs font-medium text-emerald-800 leading-relaxed">{topTip}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Day-by-day Itinerary */}
                    <main className="lg:col-span-8">
                        {/* Day Selector Navigation */}
                        <div className="flex overflow-x-auto custom-scroll gap-4 pb-8 mb-12 border-b border-slate-200">
                            {plan.days?.map(day => (
                                <button
                                    key={day.day}
                                    onClick={() => setActiveDay(day.day)}
                                    className={`shrink-0 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeDay === day.day
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                        : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 shadow-sm'
                                    }`}
                                >
                                    Day {day.day}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {plan.days?.filter(d => d.day === activeDay).map(day => (
                                <motion.div
                                    key={day.day}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-12"
                                >
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter mb-2 uppercase">{day.title}</h2>
                                        <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-[0.3em]">Day Total Cost: ₹{day.daily_total}</p>
                                    </div>

                                    {/* Activities Timeline */}
                                    <div className="space-y-6">
                                        {day.activities?.map((act, i) => (
                                            <div key={i} className="group relative pl-12 pb-12 last:pb-0">
                                                {/* Timeline Line */}
                                                <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-slate-100 group-last:bg-transparent" />
                                                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 z-10" />
                                                
                                                <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-indigo-600">
                                                            <FiClock /> {act.time}
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                            Est. Cost: ₹{act.estimated_cost}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase">{act.activity}</h4>
                                                    <p className="text-slate-500 font-medium leading-relaxed mb-6">{act.description}</p>
                                                    
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                            <FiMapPin className="text-rose-500" /> {act.location}
                                                        </div>
                                                        {act.tips && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                                                <span className="w-5 h-5 flex items-center justify-center bg-emerald-100 rounded-full">!</span> 
                                                                {act.tips}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Operational Logistics */}
                                    <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-slate-200">
                                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                                <FiCoffee size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dining</h5>
                                                <div className="space-y-4">
                                                    {day.meals?.map((meal, idx) => (
                                                        <div key={idx} className="border-l-2 border-slate-100 pl-4">
                                                            <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{meal.type}</div>
                                                            <div className="text-xs font-medium text-slate-500 mt-1">{meal.suggestion}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                                <FiMoon size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Accommodation</h5>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{day.accommodation?.suggestion}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stay: {day.accommodation?.type}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ItineraryView;
