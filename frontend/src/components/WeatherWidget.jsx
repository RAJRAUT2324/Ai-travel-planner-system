/**
 * WeatherWidget — Premium environmental module for VoyageAI.
 */

import { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import { FiCloud, FiDroplet, FiWind, FiSun } from 'react-icons/fi';

const WeatherWidget = ({ city }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!city) return;
        setLoading(true);
        weatherAPI.getWeather(city)
            .then(res => {
                if (res.data.success) setWeather(res.data.weather);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [city]);

    if (loading) {
        return (
            <div className="glass-card p-8 animate-pulse bg-slate-50 border-slate-100">
                <div className="h-2 bg-slate-200 rounded-full w-24 mb-6" />
                <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-8 bg-slate-200 rounded-xl w-16" />
                        <div className="h-2 bg-slate-200 rounded-full w-24" />
                    </div>
                </div>
                <div className="h-12 bg-slate-200 rounded-2xl w-full" />
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="glass-card p-8 bg-white border-slate-100 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Environmental Data</h3>
            
            <div className="flex items-center gap-6 mb-8">
                {weather.icon ? (
                    <img src={weather.icon} alt={weather.condition} className="w-20 h-20 drop-shadow-xl" />
                ) : (
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <FiSun size={32} />
                    </div>
                )}
                <div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                        {Math.round(weather.temperature)}°
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                        {weather.description}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <FiCloud className="mx-auto text-slate-400 mb-2" size={14} />
                    <div className="text-[10px] font-black text-slate-900 uppercase">Feels {Math.round(weather.feels_like)}°</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <FiDroplet className="mx-auto text-cyan-400 mb-2" size={14} />
                    <div className="text-[10px] font-black text-slate-900 uppercase">{weather.humidity}%</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <FiWind className="mx-auto text-indigo-400 mb-2" size={14} />
                    <div className="text-[10px] font-black text-slate-900 uppercase">{weather.wind_speed}m/s</div>
                </div>
            </div>

            {weather.travel_advice && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 text-xs font-medium text-slate-600 leading-relaxed italic">
                    " {weather.travel_advice} "
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
