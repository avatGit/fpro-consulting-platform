import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Logo from '../components/Logo'
import './TechnicianDashboardPage.css'

function TechnicianDashboardPage() {
    const navigate = useNavigate()
    const [interventions, setInterventions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('today')

    useEffect(() => {
        fetchInterventions()
    }, [])

    const fetchInterventions = async () => {
        setLoading(true)
        try {
            const res = await api.get('/interventions/my')
            setInterventions(res.data.data || [])
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, status) => {
        try {
            if (status === 'in_progress') {
                await api.post(`/interventions/${id}/start`)
            } else if (status === 'completed') {
                // For now, simple report data
                await api.post(`/interventions/${id}/report`, {
                    work_done: 'Maintenance effectuée avec succès',
                    parts_replaced: [],
                    next_steps: 'RAS'
                })
            }
            fetchInterventions()
        } catch (error) {
            alert('Erreur lors de la mise à jour')
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const getFilteredInterventions = () => {
        const today = new Date().toDateString()
        if (activeTab === 'today') {
            return interventions.filter(i => new Date(i.scheduled_at).toDateString() === today)
        }
        return interventions.filter(i => new Date(i.scheduled_at).toDateString() !== today)
    }

    if (loading) return <div className="loading">Chargement...</div>

    return (
        <div className="technician-dashboard">
            <header className="tech-header">
                <Logo />
                <div className="tech-user-info">
                    <span>Espace Technicien</span>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </header>

            <main className="tech-main">
                <div className="tech-tabs">
                    <button
                        className={`tech-tab ${activeTab === 'today' ? 'active' : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        Aujourd'hui
                    </button>
                    <button
                        className={`tech-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        À venir
                    </button>
                </div>

                <div className="intervention-list">
                    {getFilteredInterventions().length > 0 ? getFilteredInterventions().map(i => (
                        <div key={i.id} className={`intervention-card status-${i.status}`}>
                            <div className="card-header">
                                <span className="ref">#{i.id.substring(0, 8).toUpperCase()}</span>
                                <span className={`badge badge-${i.status}`}>{i.status}</span>
                            </div>
                            <div className="card-body">
                                <h3>{i.request?.subject || 'Intervention'}</h3>
                                <p className="description">{i.request?.description}</p>
                                <div className="meta">
                                    <span>📍 {i.request?.location || 'Site client'}</span>
                                    <span>⏰ {new Date(i.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div className="card-actions">
                                {i.status === 'scheduled' && (
                                    <button
                                        className="btn-tech btn-start"
                                        onClick={() => handleStatusUpdate(i.id, 'in_progress')}
                                    >
                                        Démarrer
                                    </button>
                                )}
                                {i.status === 'in_progress' && (
                                    <button
                                        className="btn-tech btn-complete"
                                        onClick={() => handleStatusUpdate(i.id, 'completed')}
                                    >
                                        Clôturer
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">Aucune intervention prévue.</div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default TechnicianDashboardPage;
