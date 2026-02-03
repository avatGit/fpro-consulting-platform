import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import './AdminLoginPage.css'

function AdminLoginPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        // Credentials admin hardcodés
        if (formData.username === 'admin' && formData.password === 'admin123') {
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('adminUsername', formData.username)
            navigate('/admin/dashboard')
        } else {
            setError('Identifiants administrateur incorrects')
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-badge">ADMIN</div>

                    <div className="admin-login-header">
                        <Logo />
                        <h1 className="admin-login-title">Espace Administrateur</h1>
                        <p className="admin-login-subtitle">Connectez-vous pour accéder au panneau d'administration</p>
                    </div>

                    <form className="admin-login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="admin-error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Nom d'utilisateur</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-input"
                                placeholder="admin"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-admin-login">
                            Se connecter
                        </button>
                    </form>

                    <div className="admin-login-footer">
                        <button className="btn-back-home" onClick={() => navigate('/')}>
                            ← Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage
