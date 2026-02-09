import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AgentDashboardPage from './pages/AgentDashboardPage'
import TechnicianDashboardPage from './pages/TechnicianDashboardPage'

// Protected Route Component for Admin
// Helper to get user role from token (simplified)
const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload).role || 'client'; // Default to client
    } catch (e) {
        return null;
    }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = getUserRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect based on role or to home
        if (userRole === 'admin') return <Navigate to="/admin" replace />;
        if (userRole === 'agent') return <Navigate to="/agent" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['client', 'admin', 'agent']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                {/* Admin & Agent Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/agent" element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                        <AgentDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/technician" element={
                    <ProtectedRoute allowedRoles={['technicien', 'admin']}>
                        <TechnicianDashboardPage />
                    </ProtectedRoute>
                } />

                {/* Legacy redirect or alternate paths */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            </Routes>
        </Router>
    )
}

export default App
