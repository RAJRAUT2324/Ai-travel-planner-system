/**
 * DestinationCard — Ultra-premium glassmorphic card for destination discovery.
 * Fallback images cycle through a curated pool of 5 travel photos so every
 * card looks distinct even when GridFS images are not available.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';

/** Pool of 5 distinct, high-quality travel destination images from Unsplash */
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',  // Mountain lake
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',  // Snowy peaks
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',  // Beach paradise
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',  // Colosseum Rome
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop',  // City skyline lights
];

/**
 * Pick a fallback image deterministically from the pool based on the
 * destination id or name — same destination always gets the same image.
 */
const getFallbackImage = (id = '', name = '') => {
    const seed = `${id}${name}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) & 0xffff;
    }
    return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
};

const DestinationCard = ({ destination, index = 0 }) => {
    const { _id, name, city, country, budget_min, budget_max, tags, image_ids, best_season } = destination;

    const fallback = getFallbackImage(_id, name);

    const imageUrl = image_ids?.length > 0
        ? `/api/destinations/image/${image_ids[0]}`
        : fallback;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <Link to={`/destination/${_id}`} className="group relative block">
                <div className="glass-card overflow-hidden h-[400px] flex flex-col hover:-translate-y-2 transition-transform duration-500">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden mask-blur">
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                            onError={(e) => {
                                // On load error fall back to the pool image for this card
                                if (e.target.src !== fallback) {
                                    e.target.src = fallback;
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                        
                        {/* Stats Overlay */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                            {best_season?.split(' ')[0] || 'Year-round'}
                          </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 px-8 pb-8 flex flex-col -mt-12 relative z-10">
                        <div className="mb-4">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{country}</span>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1 group-hover:gradient-text transition-colors">
                                {name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-2 font-bold text-xs uppercase tracking-wider">
                                <FiMapPin className="text-indigo-400" /> {city}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting from</span>
                                <div className="text-xl font-black text-slate-900 tracking-tighter">
                                    ₹{budget_min || 0}
                                </div>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default DestinationCard;

