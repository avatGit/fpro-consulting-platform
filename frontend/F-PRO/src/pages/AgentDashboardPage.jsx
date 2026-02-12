import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { SERVER_URL } from '../services/api'
import { useSocket } from '../context/SocketContext' // Import Socket Hook
import Logo from '../components/Logo'
import RentalForm from '../components/RentalForm'
import './AgentDashboardPage.css'

function AgentDashboardPage() {
    const navigate = useNavigate()
    const socket = useSocket() // Access socket
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [loading, setLoading] = useState(true)

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [maintenanceRequests, setMaintenanceRequests] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [showTechnicianModal, setShowTechnicianModal] = useState(false)
    const [showQuoteModal, setShowQuoteModal] = useState(false)
    const [selectedMaintId, setSelectedMaintId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showRentalModal, setShowRentalModal] = useState(false)
    const [editingRental, setEditingRental] = useState(null)

    // Manual Quote State
    const [newQuoteData, setNewQuoteData] = useState({
        userId: '',
        companyId: '', // Optional/derived
        items: [{ product_id: '', quantity: 1, unit_price: 0 }]
    })

    const [stats, setStats] = useState({
        activeRequests: 0,
        acceptedQuotes: 0,
        ordersInProgress: 0,
        urgencies: 0
    })
    const [allInterventions, setAllInterventions] = useState([])
    const [quotes, setQuotes] = useState([])
    const [clients, setClients] = useState([])
    const [rentals, setRentals] = useState([])

    useEffect(() => {
        fetchAgentData()
    }, [])

    // Real-time Notifications Listener
    useEffect(() => {
        if (socket) {
            socket.on('order:new', (data) => {
                // Show notification (for now simple alert, can be improved with toast)
                // In a real app, use a Toast component
                alert(`[NOTIF] Nouvelle commande reçue ! N° ${data.order_number}`);
                fetchAgentData(); // Refresh data
            });

            socket.on('maintenance:new', (data) => {
                alert(`[MAINTENANCE] Nouvelle demande de maintenance !`);
                fetchAgentData(); // Refresh data
            });

            return () => {
                socket.off('order:new');
                socket.off('maintenance:new');
            }
        }
    }, [socket])

    const fetchAgentData = async () => {
        setLoading(true)
        try {
            const results = await Promise.allSettled([
                api.get('/products'),
                api.get('/orders/all'),
                api.get('/maintenance/all'),
                api.get('/maintenance/technicians/available'),
                api.get('/quotes/all/quotes'),
                api.get('/users/clients'),
                api.get('/rentals/all')
            ])

            const rawProds = results[0].status === 'fulfilled' ? (results[0].value.data?.data || []) : []
            const rawOrders = results[1].status === 'fulfilled' ? (results[1].value.data?.data || []) : []
            const rawMaint = results[2].status === 'fulfilled' ? (results[2].value.data?.data || []) : []
            const rawTechs = results[3].status === 'fulfilled' ? (results[3].value.data?.data || []) : []
            const rawQuotes = results[4].status === 'fulfilled' ? (results[4].value.data?.data?.quotes || []) : []
            const rawClients = results[5].status === 'fulfilled' ? (results[5].value.data?.data || []) : []
            const rawRentals = results[6].status === 'fulfilled' ? (results[6].value.data?.data || []) : []

            if (results[4].status === 'rejected') console.warn('Quotes access denied or failed:', results[4].reason)

            setProducts(rawProds)
            setOrders(rawOrders)
            setMaintenanceRequests(rawMaint)
            setTechnicians(rawTechs)
            setQuotes(rawQuotes)
            setClients(rawClients)
            setRentals(rawRentals)


            // Extract all interventions for planning
            const interventions = Array.isArray(rawMaint) ? rawMaint.reduce((acc, current) => {
                if (current.interventions && current.interventions.length > 0) {
                    return [...acc, ...current.interventions.map(i => ({ ...i, request: current }))]
                }
                return acc
            }, []) : []
            setAllInterventions(interventions)

            // Calculate operational stats
            setStats({
                activeRequests: Array.isArray(rawMaint) ? rawMaint.filter(m => {
                    const status = m.status?.toLowerCase()
                    return status === 'new' || status === 'assigned'
                }).length : 0,
                acceptedQuotes: Array.isArray(rawQuotes) ? rawQuotes.filter(q => q.status === 'accepted').length : 0,
                ordersInProgress: Array.isArray(rawOrders) ? rawOrders.filter(o => {
                    const status = o.status?.toLowerCase()
                    return status === 'validated' || status === 'processing' || status === 'shipped'
                }).length : 0,
                urgencies: Array.isArray(rawMaint) ? rawMaint.filter(m => {
                    const prio = m.priority?.toLowerCase()
                    return prio === 'high' || prio === 'urgent'
                }).length : 0
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

    const handleValidateOrder = async (orderId) => {
        if (!window.confirm('Valider cette commande ? Cela impactera le stock.')) return;
        try {
            await api.post(`/orders/${orderId}/validate`)
            fetchAgentData()
            alert('Commande validée avec succès !')
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la validation')
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

    const handleApproveQuote = async (quoteId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir approuver ce devis ? Cela générera automatiquement une commande.')) return;
        try {
            await api.post(`/quotes/${quoteId}/approve`)
            fetchAgentData()
            alert('Devis approuvé et commande générée !')
        } catch (error) {
            alert('Erreur lors de l\'approbation')
        }
    }

    const handleRejectQuote = async (quoteId) => {
        const reason = prompt('Veuillez indiquer la raison du rejet :');
        if (!reason) return;
        try {
            await api.post(`/quotes/${quoteId}/reject`, { reason })
            fetchAgentData()
            alert('Devis rejeté.')
        } catch (error) {
            alert('Erreur lors du rejet')
        }
    }

    const handleCancelOrder = async (orderId) => {
        const reason = prompt('Veuillez indiquer la raison de l\'annulation :');
        if (!reason) return;
        try {
            await api.post(`/orders/${orderId}/cancel`, { reason })
            fetchAgentData()
            alert('Commande annulée avec succès.')
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de l\'annulation')
        }
    }

    const handleConfirmRental = async (rentalId) => {
        try {
            await api.patch(`/rentals/${rentalId}/status`, { status: 'confirmed' })
            fetchAgentData()
            alert('Location confirmée.')
        } catch (error) {
            alert('Erreur lors de la confirmation')
        }
    }

    const handleReturnRental = async (rentalId) => {
        try {
            await api.patch(`/rentals/${rentalId}/status`, { status: 'returned' })
            fetchAgentData()
            alert('Location marquée comme retournée.')
        } catch (error) {
            alert('Erreur lors du retour')
        }
    }

    const handleRefuseRental = async (rentalId) => {
        if (!window.confirm('Voulez-vous vraiment refuser cette location ?')) return;
        try {
            await api.patch(`/rentals/${rentalId}/status`, { status: 'cancelled' })
            fetchAgentData()
            alert('Location refusée (annulée).')
        } catch (error) {
            alert('Erreur lors du refus')
        }
    }

    const handleDeliverRental = async (rentalId) => {
        try {
            await api.patch(`/rentals/${rentalId}/status`, { status: 'active' })
            fetchAgentData()
            alert('Location marquée comme livrée (active).')
        } catch (error) {
            alert('Erreur lors de la livraison')
        }
    }

    const handleUpdateMaintStatus = async (requestId, newStatus) => {
        try {
            await api.patch(`/maintenance/${requestId}/status`, { status: newStatus })
            fetchAgentData()
            alert('Statut mis à jour !')
        } catch (error) {
            alert('Erreur lors de la mise à jour')
        }
    }


    const handleCreateQuote = async () => {
        try {
            // Simplified validation
            if (!newQuoteData.userId || newQuoteData.items.length === 0) {
                alert('Veuillez sélectionner un client et au moins un article.')
                return
            }
            // For simplicity, assuming product selection fills price. In real app, selecting product updates unit_price.
            // Here we just send what we have.
            await api.post('/quotes/manual', newQuoteData)
            setShowQuoteModal(false)
            fetchAgentData()
            alert('Devis créé avec succès !')
            setNewQuoteData({ userId: '', companyId: '', items: [{ product_id: '', quantity: 1, unit_price: 0 }] })
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la création du devis')
        }
    }

    const handleAddQuoteItem = () => {
        setNewQuoteData({
            ...newQuoteData,
            items: [...newQuoteData.items, { product_id: '', quantity: 1, unit_price: 0 }]
        })
    }

    const handleQuoteItemChange = (index, field, value) => {
        const newItems = [...newQuoteData.items]
        newItems[index][field] = value

        // Auto-fill price if product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index].unit_price = product.price
            }
        }

        setNewQuoteData({ ...newQuoteData, items: newItems })
    }

    const handleExportOrders = async () => {
        try {
            const response = await api.get('/reports/orders', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `commandes_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export des commandes');
        }
    }

    const handleExportMaintenance = async () => {
        try {
            const response = await api.get('/reports/maintenance', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `maintenance_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export des interventions');
        }
    }

    const handleCreateRental = async (rentalData) => {
        try {
            const formData = new FormData();
            Object.keys(rentalData).forEach(key => {
                if (key === 'image' && rentalData[key]) {
                    formData.append('image', rentalData[key]);
                } else if (key !== 'type') { // Skip type if it exists, we force it below
                    formData.append(key, rentalData[key]);
                }
            });
            // Force type to 'service' for rentals
            formData.append('type', 'service');

            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Produit de location ajouté avec succès');
            setShowRentalModal(false);
            fetchAgentData(); // Refresh data to see the new product/service if needed
        } catch (error) {
            console.error('Error creating rental product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
            alert(`Erreur lors de la création du produit: ${errorMessage}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <i className="fa-solid fa-chart-pie"></i> },
        { id: 'clients', label: 'Clients', icon: <i className="fa-solid fa-users"></i> },
        { id: 'devis', label: 'Gestion des Devis', icon: <i className="fa-solid fa-file-invoice"></i> },
        { id: 'orders', label: 'Commandes', icon: <i className="fa-solid fa-shopping-basket"></i> },
        { id: 'reports', label: 'Rapports', icon: <i className="fa-solid fa-file-export"></i> },
        { id: 'maintenance', label: 'Interventions', icon: <i className="fa-solid fa-screwdriver-wrench"></i> },
        { id: 'rentals', label: 'Locations', icon: <i className="fa-solid fa-key"></i> },
        { id: 'param', label: 'Paramètres', icon: <i className="fa-solid fa-gears"></i> },
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
        <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F4F7FE' }}>
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #4318FF', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    )

    return (
        <div className="agent-dashboard-page">
            <aside className="agent-sidebar">
                <div className="agent-sidebar-header">
                    <div className="sidebar-logo">
                        <Logo light={true} />
                    </div>
                    <div className="agent-badge-sidebar">Interface Opérationnelle</div>
                </div>

                <nav className="agent-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`agent-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => { setActiveMenu(item.id); setSearchTerm(''); }}
                        >
                            <div className="nav-icon-wrapper">{item.icon}</div>
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-arrow" style={{ opacity: 0.7, fontSize: '1.2rem' }}>›</span>
                        </button>
                    ))}

                    <div style={{ marginTop: 'auto', padding: 'var(--spacing-lg) 0' }}>
                        <button
                            className="agent-nav-item"
                            onClick={handleLogout}
                            style={{ color: '#FFBABA', background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <div className="nav-icon-wrapper">
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <span className="nav-label">Déconnexion</span>
                            <span className="nav-arrow" style={{ opacity: 0.7, fontSize: '1.2rem' }}>›</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="agent-main">
                <header className="agent-header">
                    <div>
                        <div style={{ fontSize: '14px', color: '#A3AED0', fontWeight: '500', marginBottom: '4px' }}>Pages / {menuItems.find(m => m.id === activeMenu)?.label}</div>
                        <h1 className="agent-page-title">{menuItems.find(m => m.id === activeMenu)?.label}</h1>
                    </div>
                    <div className="agent-header-actions">
                        <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F4F7FE' }} />
                            <span className="agent-username" style={{ color: '#2B3674', fontWeight: '700' }}>Sébastien Lemaire</span>
                        </div>
                    </div>
                </header>

                <div className="agent-content">
                    {activeMenu === 'dashboard' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-main-row">
                                        <div className="stat-icon-wrapper" style={{ color: '#F59E0B' }}>
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Demandes Actives</h3>
                                            <div className="stat-number">{stats.activeRequests}</div>
                                        </div>
                                    </div>
                                    <div className="stat-bottom-bar" style={{ background: '#F59E0B' }}></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-main-row">
                                        <div className="stat-icon-wrapper" style={{ color: '#4318FF' }}>
                                            <i className="fa-solid fa-file-circle-check"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Devis Confirmés</h3>
                                            <div className="stat-number">{stats.acceptedQuotes}</div>
                                        </div>
                                    </div>
                                    <div className="stat-bottom-bar" style={{ background: '#4318FF' }}></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-main-row">
                                        <div className="stat-icon-wrapper" style={{ color: '#01B574' }}>
                                            <i className="fa-solid fa-truck-fast"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Commandes en Cours</h3>
                                            <div className="stat-number">{stats.ordersInProgress}</div>
                                        </div>
                                    </div>
                                    <div className="stat-bottom-bar" style={{ background: '#01B574' }}></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-main-row">
                                        <div className="stat-icon-wrapper" style={{ color: '#EE5D50' }}>
                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Urgences</h3>
                                            <div className="stat-number">{stats.urgencies}</div>
                                        </div>
                                    </div>
                                    <div className="stat-bottom-bar" style={{ background: '#EE5D50' }}></div>
                                </div>
                            </div>

                            <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                                <div className="dashboard-left-col">
                                    <div className="recent-activity-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--agent-shadow)', marginBottom: '24px' }}>
                                        <div className="activity-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2B3674' }}>Activité Récente</h2>
                                                <div className="activity-tabs" style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: '700', color: '#A3AED0' }}>
                                                    <span style={{ color: '#4318FF', borderBottom: '2px solid #4318FF', paddingBottom: '4px', cursor: 'pointer' }}>Interventions</span>
                                                    <span style={{ cursor: 'pointer' }}>Situation...</span>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#4318FF', cursor: 'pointer', fontWeight: '700' }}>Voir tout</span>
                                        </div>
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
                                                        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
                                                        .slice(0, 8)
                                                        .map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td><code>{item.order_number}</code></td>
                                                                <td>{item.user?.first_name} {item.user?.last_name}</td>
                                                                <td style={{ color: '#A3AED0', fontWeight: '500' }}>{item.type}</td>
                                                                <td>
                                                                    <span className={`status-badge status-${item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'new' ? 'en-attente' : item.status?.toLowerCase() === 'done' || item.status?.toLowerCase() === 'delivered' ? 'termine' : 'en-cours'}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <aside className="dashboard-right-col">
                                    <div className="urgency-panel">
                                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Demandes Urgentes</h2>
                                        <div className="urgency-list">
                                            {maintenanceRequests.filter(r => {
                                                const prio = r.priority?.toLowerCase()
                                                return (prio === 'high' || prio === 'urgent') && r.status === 'new'
                                            }).slice(0, 2).map(r => (
                                                <div key={r.id} className="urgency-item critique">
                                                    <div className="urgency-header">
                                                        <span className="urgency-ref">#{r.id.substring(0, 8).toUpperCase()}</span>
                                                        <span className="urgency-label" style={{ color: '#EE5D50', background: '#FFF5F4' }}>Critique</span>
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: '#707EAE', margin: '4px 0 16px' }}>{r.description?.substring(0, 50)}...</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '11px', color: '#A3AED0' }}>{new Date(r.createdAt || r.created_at).toLocaleDateString()}</span>
                                                        <button className="btn-affecter-small" onClick={() => { setSelectedMaintId(r.id); setShowTechnicianModal(true); }}>Affecter</button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button style={{ width: '100%', background: '#F4F7FE', border: 'none', padding: '14px', borderRadius: '12px', color: '#4318FF', fontWeight: '800', fontSize: '13px', marginTop: '10px', cursor: 'pointer' }}>
                                                Historique complet ➡
                                            </button>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}

                    {activeMenu === 'orders' && (
                        <div className="agent-table-container">
                            <h3 style={{ marginBottom: '20px', color: '#2B3674' }}>Gestion des Commandes</h3>
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>N° Commande</th>
                                        <th>Client</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'done').map(o => (
                                        <tr key={o.id}>
                                            <td><code>{o.order_number}</code></td>
                                            <td>{o.user?.first_name} {o.user?.last_name}</td>
                                            <td style={{ color: '#A3AED0' }}>{new Date(o.createdAt || o.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge status-${o.status === 'pending' ? 'en-attente' : 'en-cours'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td>
                                                {o.status !== 'cancelled' && o.status !== 'delivered' && (
                                                    <button onClick={() => handleCancelOrder(o.id)} style={{ border: 'none', background: '#FFF5F4', color: '#EE5D50', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>
                                                        Annuler
                                                    </button>
                                                )}
                                                {o.status === 'shipped' && (
                                                    <button className="btn-operational" onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}>
                                                        Confirmer Livraison
                                                    </button>
                                                )}
                                                {o.status === 'pending' && (
                                                    <button className="btn-operational" onClick={() => handleValidateOrder(o.id)}>
                                                        Valider Commande
                                                    </button>
                                                )}
                                                {o.status === 'validated' && (
                                                    <button className="btn-operational" onClick={() => handleUpdateOrderStatus(o.id, 'processing')}>
                                                        Démarrer Préparation
                                                    </button>
                                                )}
                                                {o.status === 'processing' && (
                                                    <button className="btn-operational" onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}>
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
                    {activeMenu === 'clients' && (
                        <div className="agent-table-container">
                            <h3 style={{ marginBottom: '20px', color: '#2B3674' }}>Base Clients</h3>
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Entreprise</th>
                                        <th>Statut</th>
                                        <th>Date d'inscription</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map(client => (
                                        <tr key={client.id}>
                                            <td style={{ fontWeight: 'bold' }}>{client.first_name} {client.last_name}</td>
                                            <td>{client.email}</td>
                                            <td>{client.company?.name || '-'}</td>
                                            <td><span className={`status-badge status-${client.is_active ? 'termine' : 'critique'}`}>{client.is_active ? 'Actif' : 'Inactif'}</span></td>
                                            <td>{new Date(client.createdAt || client.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeMenu === 'rentals' && (
                        <div className="agent-table-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#2B3674', margin: 0 }}>Gestion des Locations</h3>
                                <button
                                    className="btn-operational"
                                    style={{ background: '#4318FF', color: 'white' }}
                                    onClick={() => {
                                        setEditingRental(null);
                                        setShowRentalModal(true);
                                    }}
                                >
                                    <i className="fa-solid fa-plus"></i> Ajouter produit de location
                                </button>
                            </div>
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>Référence</th>
                                        <th>Client</th>
                                        <th>Statut</th>
                                        <th>Prix Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentals.map(rental => (
                                        <tr key={rental.id}>
                                            <td><code>{rental.id.substring(0, 8).toUpperCase()}</code></td>
                                            <td>{rental.user?.first_name} {rental.user?.last_name}</td>
                                            <td><span className={`status-badge status-${rental.status === 'active' || rental.status === 'confirmed' ? 'termine' : rental.status === 'returned' ? 'en-attente' : 'critique'}`}>{rental.status}</span></td>
                                            <td style={{ fontWeight: 'bold' }}>{rental.total_price} €</td>
                                            <td>
                                                {rental.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleConfirmRental(rental.id)} className="btn-operational" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }}>Confirmer</button>
                                                        <button onClick={() => handleRefuseRental(rental.id)} className="btn-operational" style={{ padding: '6px 12px', fontSize: '12px', background: '#FFF5F4', color: '#EE5D50' }}>Refuser</button>
                                                    </>
                                                )}
                                                {rental.status === 'confirmed' && (
                                                    <button onClick={() => handleDeliverRental(rental.id)} className="btn-operational" style={{ padding: '6px 12px', fontSize: '12px', background: '#01B574', color: 'white' }}>Livrer</button>
                                                )}
                                                {rental.status === 'active' && <button onClick={() => handleReturnRental(rental.id)} className="btn-operational" style={{ padding: '6px 12px', fontSize: '12px', background: '#FF9F43' }}>Retourné</button>}
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
                                        <th>Référence</th>
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
                                                <span className={`status-badge status-${(req.priority?.toLowerCase() === 'urgent' || req.priority?.toLowerCase() === 'high') ? 'critique' : ''}`}>
                                                    {req.priority || 'Normal'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${req.status?.toLowerCase() === 'new' ? 'en-attente' : req.status?.toLowerCase() === 'assigned' ? 'en-attente' : req.status?.toLowerCase() === 'in_progress' ? 'en-cours' : 'termine'}`}>
                                                    {req.status === 'in_progress' ? 'En Cours' : req.status === 'assigned' ? 'Assigné' : req.status === 'done' ? 'Terminé' : req.status}
                                                </span>
                                            </td>
                                            <td>
                                                {req.status === 'new' && (
                                                    <button className="btn-operational" onClick={() => { setSelectedMaintId(req.id); setShowTechnicianModal(true); }}>
                                                        Affecter Technicien
                                                    </button>
                                                )}
                                                {req.status === 'assigned' && (
                                                    <button className="btn-operational btn-primary-op" onClick={() => handleUpdateMaintStatus(req.id, 'in_progress')}>
                                                        Démarrer Intervention
                                                    </button>
                                                )}
                                                {req.status === 'in_progress' && (
                                                    <button className="btn-operational btn-termine-op" onClick={() => handleUpdateMaintStatus(req.id, 'done')} style={{ background: '#01B574', color: 'white' }}>
                                                        Terminer Intervention
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeMenu === 'devis' && (
                        <div className="devis-management-view">
                            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 24px', borderRadius: '16px', marginBottom: '24px', boxShadow: 'var(--agent-shadow)', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                    <div className="search-box" style={{ width: '240px' }}>
                                        <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
                                        <input type="text" placeholder="Recherche ref..." className="search-input-field" />
                                    </div>
                                    <select style={{ border: 'none', background: '#F4F7FE', padding: '10px 16px', borderRadius: '12px', color: '#2B3674', fontWeight: 'bold' }}>
                                        <option>Filtrer par statut</option>
                                        <option value="pending">En Attente</option>
                                        <option value="accepted">Accepté</option>
                                        <option value="refused">Refusé</option>
                                    </select>
                                </div>
                                <button className="btn-operational" onClick={() => setShowQuoteModal(true)} style={{ marginRight: '8px', background: '#4318FF', color: 'white' }}>+ Créer Devis</button>
                                <button className="btn-operational" onClick={fetchAgentData}>Actualiser</button>
                            </div>
                            <div className="agent-table-container">
                                <table className="agent-table">
                                    <thead>
                                        <tr>
                                            <th>Référence</th>
                                            <th>Client</th>
                                            <th>Montant</th>
                                            <th>Statut</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotes.length > 0 ? quotes.map(quote => (
                                            <tr key={quote.id}>
                                                <td><code>{quote.id.substring(0, 8).toUpperCase()}</code></td>
                                                <td>{quote.user?.first_name} {quote.user?.last_name || 'Client'}</td>
                                                <td style={{ fontWeight: '700' }}>{quote.total_amount} €</td>
                                                <td style={{ color: '#A3AED0' }}>{new Date(quote.createdAt || quote.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <a href={`${SERVER_URL}/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '14px', marginRight: '4px' }} title="Télécharger PDF">
                                                            <i className="fa-solid fa-file-pdf"></i>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#A3AED0' }}>Aucun devis trouvé</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeMenu === 'reports' && (
                        <div className="reports-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div className="report-card" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--agent-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '24px', background: '#F4F7FE', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-box-open" style={{ color: '#4318FF' }}></i>
                                </div>
                                <h3 style={{ color: '#2B3674', marginBottom: '12px' }}>Export Commandes</h3>
                                <p style={{ color: '#A3AED0', marginBottom: '24px' }}>Télécharger l'historique complet des commandes au format CSV.</p>
                                <button className="btn-operational btn-primary-op" onClick={handleExportOrders} style={{ width: '100%', padding: '16px' }}>
                                    Télécharger CSV
                                </button>
                            </div>

                            <div className="report-card" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--agent-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '24px', background: '#FFF5F4', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-screwdriver-wrench" style={{ color: '#EE5D50' }}></i>
                                </div>
                                <h3 style={{ color: '#2B3674', marginBottom: '12px' }}>Export Interventions</h3>
                                <p style={{ color: '#A3AED0', marginBottom: '24px' }}>Télécharger le registre des demandes de maintenance.</p>
                                <button className="btn-operational btn-secondary-op" onClick={handleExportMaintenance} style={{ width: '100%', padding: '16px', color: '#E02B2B', background: '#FFF5F4' }}>
                                    Télécharger CSV
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main >

            {showTechnicianModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }} onClick={() => setShowTechnicianModal(false)}>
                    <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#2B3674' }}>Affecter un Technicien</h2>
                        <div className="technician-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '12px' }}>
                            {technicians.length > 0 ? technicians.map(tech => (
                                <div key={tech.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', transition: 'all 0.2s' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#1E293B' }}>
                                            {tech.user ? `${tech.user.first_name} ${tech.user.last_name}` : tech.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>Charge : {tech.workload} intervention(s)</div>
                                    </div>
                                    <button className="btn-operational btn-primary-op" onClick={() => handleAssignTechnician(tech.id)}>Choisir</button>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#64748B' }}>Aucun technicien disponible pour le moment.</p>
                            )}
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-operational btn-secondary-op" onClick={() => setShowTechnicianModal(false)}>Annuler</button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showQuoteModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }} onClick={() => setShowQuoteModal(false)}>
                        <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '600px', maxWidth: '95%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#2B3674' }}>Créer un Devis</h2>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700' }}>Client</label>
                                <select
                                    value={newQuoteData.userId}
                                    onChange={(e) => {
                                        const client = clients.find(c => c.id === e.target.value);
                                        setNewQuoteData({ ...newQuoteData, userId: e.target.value, companyId: client?.company_id || '' })
                                    }}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.company?.name || 'Particulier'})</option>
                                    ))}
                                </select>
                            </div>

                            <h3 style={{ fontSize: '16px', color: '#2B3674', marginBottom: '12px' }}>Articles</h3>
                            {newQuoteData.items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleQuoteItemChange(index, 'product_id', e.target.value)}
                                        style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                    >
                                        <option value="">Produit</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price}€)</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleQuoteItemChange(index, 'quantity', parseInt(e.target.value))}
                                        style={{ width: '60px', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                    />
                                    <span style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>{(item.unit_price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}

                            <button onClick={handleAddQuoteItem} style={{ border: 'none', background: 'transparent', color: '#4318FF', fontWeight: '700', cursor: 'pointer', marginBottom: '8px' }}>+ Ajouter un produit</button>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button className="btn-operational btn-secondary-op" onClick={() => setShowQuoteModal(false)}>Annuler</button>
                                <button className="btn-operational btn-primary-op" onClick={handleCreateQuote} style={{ background: '#4318FF', color: 'white' }}>Créer Devis</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {showRentalModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }} onClick={() => setShowRentalModal(false)}>
                    <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '600px', maxWidth: '95%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#2B3674' }}>{editingRental ? 'Modifier produit de location' : 'Nouveau produit de location'}</h2>
                        <RentalForm
                            product={editingRental}
                            onCancel={() => setShowRentalModal(false)}
                            onSave={(id, data) => handleCreateRental(data)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default AgentDashboardPage;
