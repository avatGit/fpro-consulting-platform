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
    const [user, setUser] = useState(null)
    const [previousMenu, setPreviousMenu] = useState('dashboard')

    // Profile State
    const [editProfileMode, setEditProfileMode] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [profileFormData, setProfileFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    })
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [maintenanceRequests, setMaintenanceRequests] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [showTechnicianModal, setShowTechnicianModal] = useState(false)
    const [selectedMaintId, setSelectedMaintId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showRentalModal, setShowRentalModal] = useState(false)
    const [editingRental, setEditingRental] = useState(null)

    const [stats, setStats] = useState({
        activeRequests: 0,
        ordersInProgress: 0,
        urgencies: 0
    })
    const [allInterventions, setAllInterventions] = useState([])
    const [clients, setClients] = useState([])
    const [rentals, setRentals] = useState([])

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'))
        setUser(userData)
        fetchAgentData()
    }, [])

    useEffect(() => {
        if (activeMenu !== 'profile') {
            setPreviousMenu(activeMenu)
        }
        if (activeMenu === 'profile' && user) {
            setProfileFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [activeMenu, user])

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
                api.get('/users/clients'),
                api.get('/rentals/all')
            ])

            const rawProds = results[0].status === 'fulfilled' ? (results[0].value.data?.data || []) : []
            const rawOrders = results[1].status === 'fulfilled' ? (results[1].value.data?.data || []) : []
            const rawMaint = results[2].status === 'fulfilled' ? (results[2].value.data?.data || []) : []
            const rawTechs = results[3].status === 'fulfilled' ? (results[3].value.data?.data || []) : []
            const rawClients = results[4].status === 'fulfilled' ? (results[4].value.data?.data || []) : []
            const rawRentals = results[5].status === 'fulfilled' ? (results[5].value.data?.data || []) : []

            setProducts(rawProds)
            setOrders(rawOrders)
            setMaintenanceRequests(rawMaint)
            setTechnicians(rawTechs)
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
            alert('Erreur lors de la validation')
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            const response = await api.put('/auth/profile', profileFormData)
            const updatedUser = response.data.data

            const userName = updatedUser.name ||
                (updatedUser.first_name && updatedUser.last_name ? `${updatedUser.first_name} ${updatedUser.last_name}` :
                    updatedUser.first_name || updatedUser.last_name || 'Agent');

            const fullUser = {
                ...updatedUser,
                name: userName
            }

            setUser(fullUser)
            localStorage.setItem('user', JSON.stringify(fullUser))
            setEditProfileMode(false)
            alert('Profil mis à jour avec succès !')
        } catch (error) {
            console.error('Update profile error:', error)
            alert(error.response?.data?.message || 'Erreur lors de la mise à jour du profil')
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (passwordFormData.new_password !== passwordFormData.confirm_password) {
            alert('Les nouveaux mots de passe ne correspondent pas')
            return
        }
        try {
            await api.post('/auth/change-password', {
                current_password: passwordFormData.current_password,
                new_password: passwordFormData.new_password
            })
            setShowPasswordModal(false)
            setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' })
            alert('Mot de passe modifié avec succès !')
        } catch (error) {
            console.error('Change password error:', error)
            alert(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
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

    const renderProfile = () => {
        if (!user) return null;

        const sidebarStats = [
            { label: 'Commandes', count: stats.ordersInProgress, icon: 'fa-shopping-basket' }
        ];

        return (
            <div className="profile-section-agent fade-in" style={{ padding: '0 5px' }}>
                <button
                    className="btn-operational btn-secondary-op mb-4"
                    onClick={() => setActiveMenu(previousMenu)}
                    style={{ borderRadius: '12px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </button>

                <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                    {/* Sidebar */}
                    <div className="profile-card" style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--agent-shadow)' }}>
                        <div className="avatar-large-wrapper" style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 24px' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${user.first_name || 'Agent'}+${user.last_name || 'User'}&background=4318FF&color=fff&size=256`}
                                alt="Agent"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #F4F7FE' }}
                            />
                            <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px', background: '#05CD99', borderRadius: '50%', border: '3px solid white' }}></div>
                        </div>
                        <h2 style={{ fontSize: '24px', color: '#2B3674', fontWeight: '800', marginBottom: '8px' }}>
                            {user.first_name} {user.last_name}
                        </h2>
                        <div style={{ color: '#4318FF', fontWeight: '700', fontSize: '14px', marginBottom: '24px', background: '#F4F7FE', display: 'inline-block', padding: '6px 16px', borderRadius: '20px' }}>
                            Agent Commercial
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '24px', borderTop: '1px solid #F4F7FE' }}>
                            {sidebarStats.map((stat, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#2B3674' }}>{stat.count}</div>
                                    <div style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="profile-details-column">
                        <div className="profile-card" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--agent-shadow)', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2B3674', margin: 0 }}>Détails du compte</h3>
                                {!editProfileMode && (
                                    <button className="btn-operational btn-primary-op" onClick={() => setEditProfileMode(true)}>
                                        <i className="fa-solid fa-pen-to-square"></i> Modifier
                                    </button>
                                )}
                            </div>

                            {editProfileMode ? (
                                <form onSubmit={handleUpdateProfile}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                        <div className="form-group-op" style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Nom complet</label>
                                            <input
                                                type="text"
                                                className="form-input-op"
                                                value={profileFormData.first_name}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                            />
                                        </div>
                                        <div className="form-group-op">
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Email</label>
                                            <input
                                                type="email"
                                                className="form-input-op"
                                                value={profileFormData.email}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                            />
                                        </div>
                                        <div className="form-group-op">
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Téléphone</label>
                                            <input
                                                type="text"
                                                className="form-input-op"
                                                value={profileFormData.phone}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn-operational btn-primary-op" style={{ background: '#05CD99' }}>Enregistrer</button>
                                        <button type="button" className="btn-operational btn-secondary-op" onClick={() => setEditProfileMode(false)}>Annuler</button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Nom complet</label>
                                        <div style={{ color: '#2B3674', fontWeight: '700' }}>{user.first_name} {user.last_name}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Email professionnel</label>
                                        <div style={{ color: '#2B3674', fontWeight: '700' }}>{user.email}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Téléphone</label>
                                        <div style={{ color: '#2B3674', fontWeight: '700' }}>{user.phone || 'Non renseigné'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Inscrit le</label>
                                        <div style={{ color: '#2B3674', fontWeight: '700' }}>{new Date(user.createdAt || user.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-card" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--agent-shadow)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2B3674', marginBottom: '24px' }}>Sécurité du compte</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F7FE', padding: '24px', borderRadius: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#2B3674', marginBottom: '4px' }}>Modification du mot de passe</div>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#A3AED0' }}>Mettez à jour régulièrement votre mot de passe pour plus de sécurité.</p>
                                </div>
                                <button className="btn-operational btn-primary-op" onClick={() => setShowPasswordModal(true)}>
                                    Changer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showPasswordModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
                        <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#2B3674' }}>Changer le mot de passe</h2>
                            <form onSubmit={handleChangePassword}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        required
                                        className="form-input-op"
                                        value={passwordFormData.current_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, current_password: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        className="form-input-op"
                                        value={passwordFormData.new_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#2B3674', fontWeight: '700', fontSize: '14px' }}>Confirmer le nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        className="form-input-op"
                                        value={passwordFormData.confirm_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F4F7FE' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-operational btn-secondary-op" onClick={() => setShowPasswordModal(false)}>Annuler</button>
                                    <button type="submit" className="btn-operational btn-primary-op" style={{ background: '#4318FF', color: 'white' }}>Mettre à jour</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <i className="fa-solid fa-chart-pie"></i> },
        { id: 'clients', label: 'Clients', icon: <i className="fa-solid fa-users"></i> },
        { id: 'orders', label: 'Commandes', icon: <i className="fa-solid fa-shopping-basket"></i> },
        { id: 'reports', label: 'Rapports', icon: <i className="fa-solid fa-file-export"></i> },
        { id: 'maintenance', label: 'Interventions', icon: <i className="fa-solid fa-screwdriver-wrench"></i> },
        { id: 'rentals', label: 'Locations', icon: <i className="fa-solid fa-key"></i> },
        { id: 'profile', label: 'Mon Profil', icon: <i className="fa-solid fa-user-gear"></i> },

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
                        <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveMenu('profile')}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.first_name || 'Agent'}+${user?.last_name || 'User'}&background=4318FF&color=fff&size=128`}
                                alt="Avatar"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F4F7FE' }}
                            />
                            <span className="agent-username" style={{ color: '#2B3674', fontWeight: '700' }}>
                                {user?.first_name || 'Agent'} {user?.last_name || ''}
                            </span>
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
                                                                <td><code>{item.type === 'Commande' ? item.order_number : `MNT-${item.order_number}`}</code></td>
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
                                            <td><code>LOC-{rental.id.substring(0, 8).toUpperCase()}</code></td>
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

                    {activeMenu === 'profile' && renderProfile()}
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
