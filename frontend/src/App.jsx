/**
 * App — main application with React Router.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
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
    return user && isAdmin ? children : <Navigate to="/" />;
};

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
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
                    <Route path="/map/:id?" element={
                        <ProtectedRoute><MapPortal /></ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
            <ChatBot />
            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
}

export default App;
