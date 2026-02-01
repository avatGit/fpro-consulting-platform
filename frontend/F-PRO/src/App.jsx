import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    return isAdmin ? children : <Navigate to="/admin/login" replace />
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={
                    <ProtectedAdminRoute>
                        <AdminDashboardPage />
                    </ProtectedAdminRoute>
                } />
            </Routes>
        </Router>
    )
}

export default App
