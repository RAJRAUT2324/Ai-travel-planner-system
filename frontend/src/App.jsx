/**
 * App — main application with React Router.
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import DestinationDetail from './pages/DestinationDetail';
import PlanTrip from './pages/PlanTrip';
import ItineraryView from './pages/ItineraryView';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import MapPortal from './pages/MapPortal';
import ChatBot from './components/ChatBot';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    if (loading) return null;
    return user && isAdmin ? children : <Navigate to="/admin/login" />;
};

function App() {
    const { pathname } = useLocation();
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {!isAdminPage && <Navbar />}
            <main className={`flex-grow ${!isAdminPage ? 'pt-0' : ''}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/destination/:id" element={<DestinationDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/plan" element={
                        <ProtectedRoute><PlanTrip /></ProtectedRoute>
                    } />
                    <Route path="/itinerary/:id" element={
                        <ProtectedRoute><ItineraryView /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <AdminRoute><AdminDashboard /></AdminRoute>
                    } />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/map/:id?" element={
                        <ProtectedRoute><MapPortal /></ProtectedRoute>
                    } />
                </Routes>
            </main>
            {!isAdminPage && <Footer />}
            <ChatBot />
            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
}

export default App;
