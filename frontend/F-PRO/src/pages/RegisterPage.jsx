import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

import Logo from '../components/Logo'
import './RegisterPage.css'

function RegisterPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

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

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Le nom de l'entreprise est requis"
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email invalide"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Le téléphone est requis"
        } else if (!/^\d{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Numéro de téléphone invalide"
        }

        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis"
        } else if (formData.password.length < 6) {
            newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Veuillez confirmer le mot de passe"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
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
            await api.post('/auth/register', formData)
            // Navigate to login page after successful registration
            navigate('/login')
        } catch (error) {
            console.error('Registration error:', error)
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.message || "Une erreur s'est produite lors de l'inscription"
            }))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-sidebar">
                <Link to="/" className="sidebar-logo">
                    <Logo light />
                </Link>
            </div>

            <div className="register-main">
                <div className="register-content">
                    <div className="register-card">
                        <div className="card-header">
                            <h1 className="page-title">Inscription</h1>
                        </div>

                        <h2 className="form-title">Créer un compte entreprise</h2>

                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="form-group">
                                <label htmlFor="companyName" className="form-label">
                                    Nom de l'entreprise
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className={`form-input ${errors.companyName ? 'input-error' : ''}`}
                                    placeholder="Entrez le nom de votre entreprise"
                                />
                                {errors.companyName && (
                                    <span className="form-error">{errors.companyName}</span>
                                )}
                            </div>

                            <div className="form-row">
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
                                    />
                                    {errors.email && (
                                        <span className="form-error">{errors.email}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                                        placeholder="0123456789"
                                    />
                                    {errors.phone && (
                                        <span className="form-error">{errors.phone}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
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
                                    />
                                    {errors.password && (
                                        <span className="form-error">{errors.password}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirmer le mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && (
                                        <span className="form-error">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    "S'inscrire"
                                )}
                            </button>
                            {errors.submit && (
                                <div className="form-error" style={{ textAlign: 'center', marginTop: '10px' }}>
                                    {errors.submit}
                                </div>
                            )}


                            <p className="login-link">
                                Deja un compte? <Link to="/login">Se connecter</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
