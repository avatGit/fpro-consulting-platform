import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

import Logo from '../components/Logo'
import './LoginPage.css'

function LoginPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email invalide"
        }

        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await api.post('/auth/login', formData)
            const { token, user, refreshToken } = response.data.data // Assuming standard response structure based on backend

            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))
            // Basic admin check - ideally should be robust
            if (user.role === 'admin') {
                localStorage.setItem('isAdmin', 'true')
            }

            navigate('/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.message || "Email ou mot de passe incorrect"
            }))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-sidebar">
                <Link to="/" className="sidebar-logo">
                    <Logo light />
                </Link>
            </div>

            <div className="login-main">
                <div className="login-content">
                    <div className="login-card">
                        <div className="card-header">
                            <h1 className="page-title">Connexion</h1>
                        </div>

                        <h2 className="form-title">Accéder à votre compte</h2>
                        <p className="form-subtitle">
                            Connectez-vous pour gérer vos commandes et services
                        </p>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Addresse email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                                    placeholder="exemple@entreprise.com"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <span className="form-error">{errors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <span className="form-error">{errors.password}</span>
                                )}
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="checkbox-input"
                                    />
                                    <span>Se souvenir de moi</span>
                                </label>
                                <a href="#" className="forgot-password">
                                    Mot de passe oublié?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                            {errors.submit && (
                                <div className="form-error" style={{ textAlign: 'center', marginTop: '10px' }}>
                                    {errors.submit}
                                </div>
                            )}


                            <p className="register-link">
                                Pas encore de compte? <Link to="/register">S'inscrire</Link>
                            </p>
                        </form>

                        <div className="divider">
                            <span>ou</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn google-btn">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M19.8055 10.2292C19.8055 9.55056 19.7501 8.86667 19.6338 8.19861H10.2002V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0878V17.5866H16.825C18.7173 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4" />
                                    <path d="M10.2002 20C12.9502 20 15.2726 19.1056 16.8286 17.5866L13.6061 15.0878C12.7096 15.6979 11.5521 16.0433 10.2038 16.0433C7.54337 16.0433 5.28174 14.2832 4.48943 11.9169H1.16309V14.4927C2.75516 17.8695 6.30792 20 10.2002 20Z" fill="#34A853" />
                                    <path d="M4.48581 11.9169C4.06674 10.675 4.06674 9.33008 4.48581 8.08817V5.51233H1.16309C-0.387697 8.66733 -0.387697 12.3377 1.16309 15.4927L4.48581 11.9169Z" fill="#FBBC04" />
                                    <path d="M10.2002 3.95671C11.6246 3.93433 13.0006 4.47158 14.0361 5.45925L16.8899 2.60504C15.1815 0.990541 12.9318 0.0961 10.2002 0.125374C6.30792 0.125374 2.75516 2.25587 1.16309 5.51233L4.48581 8.08817C5.27449 5.71671 7.53975 3.95671 10.2002 3.95671Z" fill="#EA4335" />
                                </svg>
                                Continuer avec Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
