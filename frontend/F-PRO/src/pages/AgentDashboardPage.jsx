import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Logo from '../components/Logo'
import './AgentDashboardPage.css'
import './AdminDashboardPage.css' // Reuse general styles

function AgentDashboardPage() {
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [loading, setLoading] = useState(true)

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [maintenanceRequests, setMaintenanceRequests] = useState([])

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showProductModal, setShowProductModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [productForm, setProductForm] = useState({
        name: '', description: '', base_price: 0, stock_quantity: 0, type: 'product', sku: ''
    })

    useEffect(() => {
        fetchAgentData()
    }, [])

    const fetchAgentData = async () => {
        setLoading(true)
        console.log('AgentDashboard: Fetching data...')

        const endpoints = [
            { key: 'products', url: '/products' },
            { key: 'orders', url: '/orders/all' },
            { key: 'maintenance', url: '/maintenance/all' }
        ]

        try {
            const results = await Promise.allSettled(endpoints.map(e => api.get(e.url)))

            results.forEach((result, index) => {
                const key = endpoints[index].key
                if (result.status === 'fulfilled') {
                    const data = result.value.data.data || []
                    console.log(`AgentDashboard: Set ${key}`, data)

                    if (key === 'products') setProducts(data)
                    if (key === 'orders') setOrders(data)
                    if (key === 'maintenance') setMaintenanceRequests(data)
                } else {
                    console.error(`AgentDashboard: Failed to fetch ${key}`, result.reason)
                }
            })
        } catch (error) {
            console.error('Global fetch error:', error)
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

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const handleSubmitProduct = async (e) => {
        e.preventDefault()
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productForm)
            } else {
                await api.post('/products', productForm)
            }
            setShowProductModal(false)
            fetchAgentData()
        } catch (error) {
            alert('Erreur lors de l\'enregistrement')
        }
    }

    const menuItems = [
        { id: 'dashboard', label: 'Vue d\'ensemble', icon: '📊' },
        { id: 'products', label: 'Catalogue', icon: '📦' },
        { id: 'orders', label: 'Livraisons', icon: '🚚' },
        { id: 'maintenance', label: 'Interventions', icon: '🔧' }
    ]

    if (loading) return <div>Chargement...</div>

    return (
        <div className="agent-dashboard-page">
            <aside className="agent-sidebar">
                <div className="agent-sidebar-header">
                    <Logo />
                    <div className="agent-badge-sidebar">AGENT</div>
                </div>
                <nav className="agent-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`agent-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="agent-main">
                <header className="agent-header">
                    <h1 className="agent-page-title">{menuItems.find(m => m.id === activeMenu)?.label || 'Espace Agent'}</h1>
                    <div className="agent-header-actions">
                        <span className="agent-username">👤 Agent</span>
                        <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
                    </div>
                </header>

                <div className="agent-content">
                    {activeMenu === 'dashboard' && (
                        <div className="stats-grid">
                            <div className="stat-card stat-blue">
                                <h3>Commandes à traiter</h3>
                                <p className="stat-number">{orders.filter(o => o.status === 'pending').length}</p>
                            </div>
                            <div className="stat-card stat-orange">
                                <h3>Livraisons à confirmer</h3>
                                <p className="stat-number">{orders.filter(o => o.status === 'shipped').length}</p>
                            </div>
                            <div className="stat-card stat-red">
                                <h3>Interventions en attente</h3>
                                <p className="stat-number">{maintenanceRequests.filter(m => m.status === 'new').length}</p>
                            </div>
                            <div className="stat-card stat-green">
                                <h3>Produits en rupture</h3>
                                <p className="stat-number">{products.filter(p => p.stock_quantity === 0).length}</p>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'products' && (
                        <div className="admin-section">
                            <button className="btn-add" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>+ Nouveau Produit</button>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Nom</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.sku}</td>
                                                <td>{p.name}</td>
                                                <td>{p.stock_quantity}</td>
                                                <td><button className="btn-icon" onClick={() => { setEditingProduct(p); setProductForm(p); setShowProductModal(true); }}>✏️</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'orders' && (
                        <div className="admin-section">
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>N° Commande</th>
                                            <th>Client</th>
                                            <th>Statut</th>
                                            <th>Confirmation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td>{o.order_number}</td>
                                                <td>{o.user?.first_name} {o.user?.last_name}</td>
                                                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                                <td>
                                                    {o.status === 'shipped' && (
                                                        <button className="btn-add" style={{ padding: '5px 10px' }} onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}>
                                                            Confirmer Livraison
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'maintenance' && (
                        <div className="admin-section">
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Client</th>
                                            <th>Priorité</th>
                                            <th>Statut</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenanceRequests.map(req => (
                                            <tr key={req.id}>
                                                <td><code>{req.id.substring(0, 8).toUpperCase()}</code></td>
                                                <td>{req.user?.first_name} {req.user?.last_name}</td>
                                                <td>
                                                    <span className={`urgency-badge urgency-${req.priority?.toLowerCase() || 'normal'}`}>
                                                        {req.priority || 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${req.status?.toLowerCase()}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {req.status === 'assigned' && (
                                                        <button
                                                            className="btn-add"
                                                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                            onClick={async () => {
                                                                try {
                                                                    await api.patch(`/maintenance/${req.id}/status`, { status: 'in_progress' })
                                                                    fetchAgentData()
                                                                } catch (err) {
                                                                    alert('Erreur lors de la mise à jour')
                                                                }
                                                            }}
                                                        >
                                                            Démarrer
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showProductModal && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Produit</h2>
                        <form onSubmit={handleSubmitProduct}>
                            <input type="text" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
                            <input type="text" placeholder="Nom" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                            <input type="number" placeholder="Prix" value={productForm.base_price} onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })} required />
                            <input type="number" placeholder="Stock" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} required />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowProductModal(false)}>Annuler</button>
                                <button type="submit">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AgentDashboardPage;
