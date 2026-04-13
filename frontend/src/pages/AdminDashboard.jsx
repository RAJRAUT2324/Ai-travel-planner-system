/**
 * AdminDashboard — admin panel with destinations CRUD, review moderation, and analytics.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMapPin, FiStar, FiMap, FiPlus, FiTrash2, FiEdit2, FiBarChart2, FiX } from 'react-icons/fi';
import { adminAPI, destinationsAPI, reviewsAPI } from '../services/api';
import { toast } from 'react-toastify';

const TABS = ['overview', 'destinations', 'reviews', 'analytics'];
const TAGS_OPTIONS = ['beach', 'hill', 'adventure', 'religious', 'luxury', 'nature', 'food', 'culture', 'wildlife', 'romantic'];

const AdminDashboard = () => {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [destinations, setDestinations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [searches, setSearches] = useState([]);
    const [tags, setTags] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDest, setEditingDest] = useState(null);
    const [destForm, setDestForm] = useState({
        name: '', city: '', country: '', description: '', budget_min: 0, budget_max: 0,
        best_season: '', nearby_hotels: '', nearby_attractions: '', travel_tips: '', tags: [],
    });

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (tab === 'destinations') loadDestinations();
        if (tab === 'reviews') loadReviews();
        if (tab === 'analytics') loadAnalytics();
    }, [tab]);

    const loadStats = () => adminAPI.getStats().then(r => setStats(r.data)).catch(() => { });
    const loadDestinations = () => destinationsAPI.getAll({ limit: 100 }).then(r => setDestinations(r.data.destinations || [])).catch(() => { });
    const loadReviews = () => reviewsAPI.getAll().then(r => setReviews(r.data.reviews || [])).catch(() => { });
    const loadAnalytics = () => {
        adminAPI.getMostSearched().then(r => setSearches(r.data.searches || [])).catch(() => { });
        adminAPI.getPopularTags().then(r => setTags(r.data.tags || [])).catch(() => { });
    };

    const openNewForm = () => {
        setEditingDest(null);
        setDestForm({ name: '', city: '', country: '', description: '', budget_min: 0, budget_max: 0, best_season: '', nearby_hotels: '', nearby_attractions: '', travel_tips: '', tags: [] });
        setShowForm(true);
    };

    const openEditForm = (d) => {
        setEditingDest(d._id);
        setDestForm({
            name: d.name, city: d.city, country: d.country, description: d.description || '',
            budget_min: d.budget_min || 0, budget_max: d.budget_max || 0, best_season: d.best_season || '',
            nearby_hotels: (d.nearby_hotels || []).join(', '), nearby_attractions: (d.nearby_attractions || []).join(', '),
            travel_tips: (d.travel_tips || []).join(', '), tags: d.tags || [],
        });
        setShowForm(true);
    };

    const handleDestSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(destForm).forEach(([k, v]) => {
            if (k === 'tags') formData.append(k, JSON.stringify(v));
            else if (['nearby_hotels', 'nearby_attractions', 'travel_tips'].includes(k))
                formData.append(k, JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)));
            else formData.append(k, v);
        });

        // Handle image files
        const fileInput = document.getElementById('dest-images');
        if (fileInput?.files) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('images', fileInput.files[i]);
            }
        }

        try {
            if (editingDest) {
                await destinationsAPI.update(editingDest, formData);
                toast.success('Destination updated!');
            } else {
                await destinationsAPI.create(formData);
                toast.success('Destination created!');
            }
            setShowForm(false);
            loadDestinations();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
        }
    };

    const deleteDest = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await destinationsAPI.delete(id);
            toast.success('Deleted');
            loadDestinations();
        } catch { toast.error('Delete failed'); }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await reviewsAPI.delete(id);
            toast.success('Review deleted');
            loadReviews();
        } catch { toast.error('Delete failed'); }
    };

    const toggleTag = (tag) => {
        setDestForm(f => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
        }));
    };

    const statCards = [
        { label: 'Total Users', value: stats.total_users || 0, icon: <FiUsers />, color: 'from-blue-500 to-blue-600' },
        { label: 'Destinations', value: stats.total_destinations || 0, icon: <FiMapPin />, color: 'from-green-500 to-green-600' },
        { label: 'Reviews', value: stats.total_reviews || 0, icon: <FiStar />, color: 'from-yellow-500 to-yellow-600' },
        { label: 'Itineraries', value: stats.total_itineraries || 0, icon: <FiMap />, color: 'from-purple-500 to-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage destinations, reviews, and analytics</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm mb-8 overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${tab === t ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                                }`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {tab === 'overview' && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((c, i) => (
                            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="glass-card p-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${c.color} text-white flex items-center justify-center text-xl mb-3`}>
                                    {c.icon}
                                </div>
                                <div className="text-3xl font-display font-bold text-gray-900">{c.value}</div>
                                <div className="text-sm text-gray-500">{c.label}</div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Destinations Tab */}
                {tab === 'destinations' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">All Destinations</h2>
                            <button onClick={openNewForm} className="btn-primary flex items-center gap-2">
                                <FiPlus /> Add Destination
                            </button>
                        </div>

                        {/* Form Modal */}
                        {showForm && (
                            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elevated">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold">{editingDest ? 'Edit' : 'Add'} Destination</h3>
                                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                                    </div>
                                    <form onSubmit={handleDestSubmit} className="space-y-4">
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            <div><label className="input-label">Name*</label><input value={destForm.name} onChange={e => setDestForm(f => ({ ...f, name: e.target.value }))} className="input-field" required /></div>
                                            <div><label className="input-label">City*</label><input value={destForm.city} onChange={e => setDestForm(f => ({ ...f, city: e.target.value }))} className="input-field" required /></div>
                                            <div><label className="input-label">Country*</label><input value={destForm.country} onChange={e => setDestForm(f => ({ ...f, country: e.target.value }))} className="input-field" required /></div>
                                        </div>
                                        <div><label className="input-label">Description*</label>
                                            <textarea value={destForm.description} onChange={e => setDestForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={3} required />
                                        </div>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            <div><label className="input-label">Budget Min ($)</label><input type="number" value={destForm.budget_min} onChange={e => setDestForm(f => ({ ...f, budget_min: e.target.value }))} className="input-field" /></div>
                                            <div><label className="input-label">Budget Max ($)</label><input type="number" value={destForm.budget_max} onChange={e => setDestForm(f => ({ ...f, budget_max: e.target.value }))} className="input-field" /></div>
                                            <div><label className="input-label">Best Season</label><input value={destForm.best_season} onChange={e => setDestForm(f => ({ ...f, best_season: e.target.value }))} className="input-field" placeholder="e.g. Oct-Mar" /></div>
                                        </div>
                                        <div><label className="input-label">Nearby Hotels (comma separated)</label>
                                            <input value={destForm.nearby_hotels} onChange={e => setDestForm(f => ({ ...f, nearby_hotels: e.target.value }))} className="input-field" placeholder="Hotel A, Hotel B" />
                                        </div>
                                        <div><label className="input-label">Nearby Attractions (comma separated)</label>
                                            <input value={destForm.nearby_attractions} onChange={e => setDestForm(f => ({ ...f, nearby_attractions: e.target.value }))} className="input-field" placeholder="Place A, Place B" />
                                        </div>
                                        <div><label className="input-label">Travel Tips (comma separated)</label>
                                            <input value={destForm.travel_tips} onChange={e => setDestForm(f => ({ ...f, travel_tips: e.target.value }))} className="input-field" placeholder="Tip 1, Tip 2" />
                                        </div>
                                        <div>
                                            <label className="input-label">Interest Tags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TAGS_OPTIONS.map(tag => (
                                                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${destForm.tags.includes(tag) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div><label className="input-label">Images</label>
                                            <input id="dest-images" type="file" multiple accept="image/*" className="input-field" />
                                        </div>
                                        <button type="submit" className="btn-primary w-full">
                                            {editingDest ? 'Update Destination' : 'Create Destination'}
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}

                        {/* Destinations Table */}
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Destination</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tags</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {destinations.map(d => (
                                            <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{d.city}, {d.country}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">${d.budget_min} - ${d.budget_max}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(d.tags || []).slice(0, 2).map(t => <span key={t} className="tag-badge text-[10px]">{t}</span>)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => openEditForm(d)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg mr-1"><FiEdit2 size={14} /></button>
                                                    <button onClick={() => deleteDest(d._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {destinations.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">No destinations yet. Add your first one!</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {tab === 'reviews' && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">All Reviews ({reviews.length})</h2>
                        <div className="space-y-3">
                            {reviews.map(r => (
                                <div key={r._id} className="glass-card p-4 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">{r.user_name || 'User'}</span>
                                            <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                                            <span className="text-xs text-gray-400">on {r.destination_name || 'Destination'}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{r.comment}</p>
                                    </div>
                                    <button onClick={() => deleteReview(r._id)} className="btn-danger !py-1.5 !px-3 text-xs shrink-0">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <div className="text-center py-8 text-gray-400">No reviews yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {tab === 'analytics' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiBarChart2 /> Most Searched</h3>
                            {searches.length > 0 ? (
                                <div className="space-y-3">
                                    {searches.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{s._id || 'Unknown'}</span>
                                            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No search data yet.</p>}
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiBarChart2 /> Popular Travel Types</h3>
                            {tags.length > 0 ? (
                                <div className="space-y-3">
                                    {tags.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700 capitalize">{t._id || 'Unknown'}</span>
                                            <span className="text-sm font-bold text-accent-600 bg-accent-50 px-3 py-1 rounded-full">{t.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No tag data yet.</p>}
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-900 mb-4">💰 Average User Budget</h3>
                            <div className="text-4xl font-display font-bold text-green-600">
                                ${stats.avg_budget || 0}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Based on all generated itineraries</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
