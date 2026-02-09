import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Logo from '../components/Logo'
import './AgentDashboardPage.css'

function AgentDashboardPage() {
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [loading, setLoading] = useState(true)

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [maintenanceRequests, setMaintenanceRequests] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [showTechnicianModal, setShowTechnicianModal] = useState(false)
    const [selectedMaintId, setSelectedMaintId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [stats, setStats] = useState({
        activeRequests: 0,
        pendingQuotes: 0,
        ordersInProgress: 0,
        urgencies: 0
    })
    const [auditLogs, setAuditLogs] = useState([])
    const [allInterventions, setAllInterventions] = useState([])

    useEffect(() => {
        fetchAgentData()
    }, [])

    const fetchAgentData = async () => {
        setLoading(true)
        try {
            const [prodRes, orderRes, maintRes, techRes, auditRes, quoteRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders/all'),
                api.get('/maintenance/all'),
                api.get('/maintenance/technicians/available'),
                api.get('/admin/audit-logs'),
                api.get('/quotes/all/quotes')
            ])

            const rawOrders = orderRes.data.data || []
            const rawMaint = maintRes.data.data || []
            const rawProds = prodRes.data.data || []
            const rawTechs = techRes.data.data || []
            const rawLogs = auditRes.data.data || []
            const rawQuotes = quoteRes.data.data?.quotes || []

            setProducts(rawProds)
            setOrders(rawOrders)
            setMaintenanceRequests(rawMaint)
            setTechnicians(rawTechs)
            setAuditLogs(rawLogs)

            // Extract all interventions for planning
            const interventions = rawMaint.reduce((acc, current) => {
                if (current.interventions && current.interventions.length > 0) {
                    return [...acc, ...current.interventions.map(i => ({ ...i, request: current }))]
                }
                return acc
            }, [])
            setAllInterventions(interventions)

            // Calculate operational stats
            setStats({
                activeRequests: rawMaint.filter(m => {
                    const status = m.status?.toLowerCase()
                    return status === 'new' || status === 'assigned'
                }).length,
                pendingQuotes: rawQuotes.filter(q => q.status === 'pending').length,
                ordersInProgress: rawOrders.filter(o => {
                    const status = o.status?.toLowerCase()
                    return status === 'validated' || status === 'processing' || status === 'shipped'
                }).length,
                urgencies: rawMaint.filter(m => {
                    const prio = m.priority?.toLowerCase()
                    return prio === 'high' || prio === 'urgent'
                }).length
            })

        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus })
            fetchAgentData()
        } catch (error) {
            alert('Erreur lors de la mise à jour')
        }
    }

    const handleAssignTechnician = async (technicianId) => {
        try {
            await api.post(`/maintenance/${selectedMaintId}/assign`, { technicianId })
            setShowTechnicianModal(false)
            fetchAgentData()
            alert('Technicien assigné avec succès !')
        } catch (error) {
            alert('Erreur lors de l\'assignation')
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard Agent', icon: '📊' },
        { id: 'orders', label: 'Commandes', icon: '🚚' },
        { id: 'maintenance', label: 'Interventions', icon: '🔧' },
        { id: 'planning', label: 'Planning', icon: '📅' },
        { id: 'history', label: 'Historique', icon: '📜' }
    ]

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user?.first_name + ' ' + o.user?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredMaint = maintenanceRequests.filter(m =>
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.user?.first_name + ' ' + m.user?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #1E3A8A', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    )

    return (
        <div className="agent-dashboard-page">
            <aside className="agent-sidebar">
                <div className="agent-sidebar-header">
                    <Logo light={true} />
                    <div className="agent-badge-sidebar">AGENT OPÉRATIONNEL</div>
                </div>
                <nav className="agent-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`agent-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => { setActiveMenu(item.id); setSearchTerm(''); }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                    <div style={{ marginTop: 'auto' }}>
                        <button className="agent-nav-item" onClick={handleLogout} style={{ color: '#FDA4AF' }}>
                            <span className="nav-icon">🚪</span>
                            <span className="nav-label">Déconnexion</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="agent-main">
                <header className="agent-header">
                    <h1 className="agent-page-title">{menuItems.find(m => m.id === activeMenu)?.label}</h1>
                    <div className="agent-header-actions">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-field"
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', width: '100%' }}
                            />
                        </div>
                        <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="user-avatar" style={{ border: '2px solid var(--primary-blue-light)' }}>
                                <div style={{ width: '100%', height: '100%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-blue)' }}>A</div>
                            </div>
                            <span className="agent-username">Agent Logistique</span>
                        </div>
                    </div>
                </header>

                <div className="agent-content">
                    {activeMenu === 'dashboard' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card stat-blue">
                                    <h3>Demandes Actives</h3>
                                    <p className="stat-number">{stats.activeRequests}</p>
                                </div>
                                <div className="stat-card stat-orange">
                                    <h3>Devis en Attente</h3>
                                    <p className="stat-number">{stats.pendingQuotes}</p>
                                </div>
                                <div className="stat-card stat-green">
                                    <h3>Commandes en Cours</h3>
                                    <p className="stat-number">{stats.ordersInProgress}</p>
                                </div>
                                <div className="stat-card stat-red">
                                    <h3>Urgences</h3>
                                    <p className="stat-number">{stats.urgencies}</p>
                                </div>
                            </div>

                            <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                <div className="recent-activity-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>🕒</span> Activité Récente
                                    </h2>
                                    <div className="agent-table-container">
                                        <table className="agent-table">
                                            <thead>
                                                <tr>
                                                    <th>Référence</th>
                                                    <th>Client</th>
                                                    <th>Type</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...orders.map(o => ({ ...o, type: 'Commande' })), ...maintenanceRequests.map(m => ({ ...m, type: 'Maintenance', order_number: m.id.substring(0, 8).toUpperCase() }))]
                                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                    .slice(0, 8)
                                                    .map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td><code>{item.order_number}</code></td>
                                                            <td>{item.user?.first_name} {item.user?.last_name}</td>
                                                            <td>{item.type}</td>
                                                            <td><span className={`status-badge status-${item.status?.toLowerCase()}`}>{item.status}</span></td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="urgency-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>⚠️ Demandes Urgentes</h2>
                                    <div className="urgency-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {maintenanceRequests.filter(r => {
                                            const prio = r.priority?.toLowerCase()
                                            return prio === 'high' || prio === 'urgent'
                                        }).slice(0, 3).map(r => (
                                            <div key={r.id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--error)' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--gray-900)' }}>{r.id.substring(0, 8).toUpperCase()}</span>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--white)', background: 'var(--error)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{r.priority}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '8px 0' }}>{r.description?.substring(0, 80)}...</p>
                                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button className="btn-operational btn-primary-op" style={{ background: 'var(--error)', fontSize: '11px', padding: '6px 12px' }} onClick={() => { setSelectedMaintId(r.id); setShowTechnicianModal(true); }}>Affecter</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeMenu === 'orders' && (
                        <div className="agent-table-container">
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>N° Commande</th>
                                        <th>Client</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'done').map(o => (
                                        <tr key={o.id}>
                                            <td><code>{o.order_number}</code></td>
                                            <td>{o.user?.first_name} {o.user?.last_name}</td>
                                            <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                            <td>
                                                {o.status === 'shipped' && (
                                                    <button className="btn-operational btn-primary-op" onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}>
                                                        Confirmer Livraison
                                                    </button>
                                                )}
                                                {o.status === 'validated' && (
                                                    <button className="btn-operational btn-primary-op" onClick={() => handleUpdateOrderStatus(o.id, 'processing')}>
                                                        Démarrer Préparation
                                                    </button>
                                                )}
                                                {o.status === 'processing' && (
                                                    <button className="btn-operational btn-primary-op" onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}>
                                                        Marquer Expédiée
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeMenu === 'maintenance' && (
                        <div className="agent-table-container">
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>ID Intervention</th>
                                        <th>Client</th>
                                        <th>Priorité</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMaint.map(req => (
                                        <tr key={req.id}>
                                            <td><code>{req.id.substring(0, 8).toUpperCase()}</code></td>
                                            <td>{req.user?.first_name} {req.user?.last_name}</td>
                                            <td>
                                                <span className={`status-badge`} style={{
                                                    background: (req.priority?.toLowerCase() === 'urgent' || req.priority?.toLowerCase() === 'high') ? 'rgba(239, 68, 68, 0.1)' : 'var(--gray-100)',
                                                    color: (req.priority?.toLowerCase() === 'urgent' || req.priority?.toLowerCase() === 'high') ? 'var(--error)' : 'var(--gray-600)'
                                                }}>
                                                    {req.priority || 'Normal'}
                                                </span>
                                            </td>
                                            <td><span className={`status-badge status-${req.status?.toLowerCase()}`}>{req.status}</span></td>
                                            <td>
                                                {req.status === 'new' && (
                                                    <button className="btn-operational btn-primary-op" onClick={() => { setSelectedMaintId(req.id); setShowTechnicianModal(true); }}>
                                                        Affecter Technicien
                                                    </button>
                                                )}
                                                {req.status === 'assigned' && (
                                                    <span style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>Assigné</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeMenu === 'planning' && (
                        <div className="planning-view">
                            <div className="planning-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {allInterventions.length > 0 ? Object.entries(
                                    allInterventions.reduce((groups, intervention) => {
                                        const date = new Date(intervention.scheduled_at).toLocaleDateString()
                                        if (!groups[date]) groups[date] = []
                                        groups[date].push(intervention)
                                        return groups
                                    }, {})
                                ).map(([date, items]) => (
                                    <div key={date} className="planning-day-card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: '10px', marginBottom: '15px', color: '#1E3A8A' }}>{date}</h3>
                                        <div className="day-interventions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {items.map(item => (
                                                <div key={item.id} style={{ padding: '10px', borderRadius: '8px', background: '#F8FAFC', borderLeft: '4px solid #3B82F6' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.request?.subject || 'Intervention'}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                                                        {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#64748B' }}>Aucune intervention planifiée.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeMenu === 'history' && (
                        <div className="history-view">
                            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {auditLogs.length > 0 ? auditLogs.map(log => (
                                    <div key={log.id} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div className="log-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {log.action === 'CREATE' ? '➕' : log.action === 'UPDATE' ? '📝' : log.action === 'DELETE' ? '🗑️' : '🔔'}
                                        </div>
                                        <div className="log-details" style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{log.description || `${log.action} ${log.resource_type}`}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                                                {new Date(log.created_at).toLocaleString()} • Par {log.user?.first_name || 'Système'}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '100px', color: '#64748B' }}>Aucun historique disponible.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showTechnicianModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowTechnicianModal(false)}>
                    <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#1E3A8A' }}>Affecter un Technicien</h2>
                        <div className="technician-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '12px' }}>
                            {technicians.length > 0 ? technicians.map(tech => (
                                <div key={tech.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', transition: 'all 0.2s' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#1E293B' }}>{tech.user?.first_name} {tech.user?.last_name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>Charge : {tech.workload} intervention(s)</div>
                                    </div>
                                    <button className="btn-operational btn-primary-op" onClick={() => handleAssignTechnician(tech.id)}>Choisir</button>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#64748B' }}>Aucun technicien disponible pour le moment.</p>
                            )}
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-operational" onClick={() => setShowTechnicianModal(false)} style={{ background: '#F1F5F9', color: '#64748B' }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AgentDashboardPage;
