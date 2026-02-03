import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import './AdminDashboardPage.css'

function AdminDashboardPage() {
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState('dashboard')

    // États pour les données
    const [products, setProducts] = useState([
        { id: 1, ref: 'REF-LAP-001', name: 'Ordinateur Portable', description: 'Qualité supérieure', price: 850000, stock: 15, rating: 5, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80' },
        { id: 2, ref: 'REF-PRN-002', name: 'Imprimante', description: 'Qualité supérieure', price: 120000, stock: 8, rating: 4, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=300&q=80' }
    ])

    const [rentalServices, setRentalServices] = useState([
        { id: 1, name: 'Location imprimante', description: 'Imprimante professionnelle', price: '90 $', duration: '2 semaines', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=300&q=80' }
    ])

    const [orders, setOrders] = useState([
        { id: 1, ref: 'CMD-1032', status: 'En cours', date: '12/11/2024', client: 'F-PRO Solutions', items: 'Materiel : 5x PC Dell', agent: 'Karim Diallo', totalTTC: 4250000 },
        { id: 2, ref: 'CMD-832', status: 'En attente', date: '12/11/2024', client: 'Tech Corp', items: 'Materiel : 1x Imprimante Pro', agent: 'Non assigné', totalTTC: 120000 }
    ])

    const [maintenanceRequests, setMaintenanceRequests] = useState([
        { id: 1, ref: 'MAINT-001', email: 'client@example.com', type: 'Matériel', urgency: 'Élevé', status: 'Reçue', date: '20/01/2026', description: 'Problème avec serveur', technicien: 'Non assigné' }
    ])

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [selectedMaintenance, setSelectedMaintenance] = useState(null)
    const [showProductModal, setShowProductModal] = useState(false)
    const [showRentalModal, setShowRentalModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingRental, setEditingRental] = useState(null)

    const [productForm, setProductForm] = useState({
        name: '', description: '', price: 0, stock: 0, rating: 5, image: ''
    })

    const [rentalForm, setRentalForm] = useState({
        name: '', description: '', price: '', duration: '', image: ''
    })

    const handleLogout = () => {
        localStorage.removeItem('isAdmin')
        localStorage.removeItem('adminUsername')
        navigate('/admin/login')
    }

    const handleViewAsClient = () => {
        navigate('/dashboard')
    }

    // Gestion Produits
    const handleAddProduct = () => {
        setEditingProduct(null)
        setProductForm({ name: '', description: '', price: 0, stock: 0, rating: 5, image: '' })
        setShowProductModal(true)
    }

    const handleEditProduct = (product) => {
        setEditingProduct(product)
        setProductForm(product)
        setShowProductModal(true)
    }

    const handleSubmitProduct = (e) => {
        e.preventDefault()
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...productForm, id: p.id, ref: p.ref } : p))
        } else {
            const newProduct = {
                ...productForm,
                id: Date.now(),
                ref: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }
            setProducts([...products, newProduct])
        }
        setShowProductModal(false)
    }

    const handleDeleteProduct = (id) => {
        if (window.confirm('Supprimer ce produit ?')) {
            setProducts(products.filter(p => p.id !== id))
        }
    }

    // Gestion Locations
    const handleAddRental = () => {
        setEditingRental(null)
        setRentalForm({ name: '', description: '', price: '', duration: '', image: '' })
        setShowRentalModal(true)
    }

    const handleSubmitRental = (e) => {
        e.preventDefault()
        if (editingRental) {
            setRentalServices(rentalServices.map(r => r.id === editingRental.id ? { ...rentalForm, id: r.id } : r))
        } else {
            setRentalServices([...rentalServices, { ...rentalForm, id: Date.now() }])
        }
        setShowRentalModal(false)
    }

    const handleDeleteRental = (id) => {
        if (window.confirm('Supprimer ce service ?')) {
            setRentalServices(rentalServices.filter(r => r.id !== id))
        }
    }

    // Gestion Commandes
    const handleUpdateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
    }

    const handleAssignAgent = (orderId, agent) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, agent } : o))
        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, agent })
        }
    }

    // Gestion Maintenance
    const handleUpdateMaintenanceStatus = (id, newStatus) => {
        setMaintenanceRequests(maintenanceRequests.map(m => m.id === id ? { ...m, status: newStatus } : m))
        if (selectedMaintenance?.id === id) {
            setSelectedMaintenance({ ...selectedMaintenance, status: newStatus })
        }
    }

    const handleAssignTechnicien = (id, technicien) => {
        setMaintenanceRequests(maintenanceRequests.map(m => m.id === id ? { ...m, technicien } : m))
        if (selectedMaintenance?.id === id) {
            setSelectedMaintenance({ ...selectedMaintenance, technicien })
        }
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'products', label: 'Produits', icon: '📦' },
        { id: 'rentals', label: 'Locations', icon: '📍' },
        { id: 'orders', label: 'Commandes', icon: '🛒' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
    ]

    const stats = [
        { title: 'Commandes ce mois', count: orders.length, color: 'orange' },
        { title: 'En attente', count: orders.filter(o => o.status === 'En attente').length, color: 'blue' },
        { title: 'Maintenance actives', count: maintenanceRequests.filter(m => m.status !== 'Résolue').length, color: 'red' },
        { title: 'Produits en stock', count: products.reduce((sum, p) => sum + p.stock, 0), color: 'green' }
    ]

    return (
        <div className="admin-dashboard-page">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Logo />
                    <div className="admin-badge-sidebar">ADMIN</div>
                </div>

                <nav className="admin-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="btn-view-client" onClick={handleViewAsClient}>
                        👁️ Voir comme Client
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1 className="admin-page-title">{menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}</h1>
                    <div className="admin-header-actions">
                        <span className="admin-username">👤 {localStorage.getItem('adminUsername')}</span>
                        <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Dashboard */}
                    {activeMenu === 'dashboard' && (
                        <div className="admin-stats-section">
                            <div className="stats-grid">
                                {stats.map((stat, i) => (
                                    <div key={i} className={`stat-card stat-${stat.color}`}>
                                        <h3>{stat.title}</h3>
                                        <p className="stat-number">{stat.count}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="recent-activity">
                                <h2>Activités Récentes</h2>
                                <div className="activity-list">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="activity-item">
                                            <span className="activity-icon">🛒</span>
                                            <div className="activity-details">
                                                <strong>Nouvelle commande {order.ref}</strong>
                                                <span>{order.client} - {order.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    {activeMenu === 'products' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <button className="btn-add" onClick={handleAddProduct}>+ Ajouter un produit</button>
                            </div>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Nom</th>
                                            <th>Prix</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td><img src={product.image} alt={product.name} className="table-img" /></td>
                                                <td><strong>{product.name}</strong><br /><small>{product.ref}</small></td>
                                                <td>{product.price.toLocaleString()} FCFA</td>
                                                <td><span className={`stock-badge ${product.stock < 5 ? 'low' : ''}`}>{product.stock}</span></td>
                                                <td>
                                                    <button className="btn-icon" onClick={() => handleEditProduct(product)}>✏️</button>
                                                    <button className="btn-icon" onClick={() => handleDeleteProduct(product.id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Rentals */}
                    {activeMenu === 'rentals' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <button className="btn-add" onClick={handleAddRental}>+ Ajouter un service</button>
                            </div>
                            <div className="rental-grid">
                                {rentalServices.map(rental => (
                                    <div key={rental.id} className="rental-admin-card">
                                        <img src={rental.image} alt={rental.name} />
                                        <h3>{rental.name}</h3>
                                        <p>{rental.description}</p>
                                        <div className="rental-price">{rental.price} / {rental.duration}</div>
                                        <div className="card-actions">
                                            <button className="btn-icon">✏️</button>
                                            <button className="btn-icon" onClick={() => handleDeleteRental(rental.id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orders */}
                    {activeMenu === 'orders' && (
                        <div className="admin-section orders-section">
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id} className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`} onClick={() => setSelectedOrder(order)}>
                                        <div className="order-header">
                                            <strong>{order.ref}</strong>
                                            <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                                        </div>
                                        <div className="order-info">
                                            <span>👤 {order.client}</span>
                                            <span>📅 {order.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedOrder && (
                                <div className="order-details">
                                    <h3>Détails Commande #{selectedOrder.ref}</h3>
                                    <div className="detail-group">
                                        <label>Client:</label>
                                        <span>{selectedOrder.client}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Produits:</label>
                                        <span>{selectedOrder.items}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Total:</label>
                                        <span>{selectedOrder.totalTTC?.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Statut:</label>
                                        <select value={selectedOrder.status} onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}>
                                            <option value="En attente">En attente</option>
                                            <option value="En cours">En cours</option>
                                            <option value="Terminé">Terminé</option>
                                            <option value="Annulé">Annulé</option>
                                        </select>
                                    </div>
                                    <div className="detail-group">
                                        <label>Agent:</label>
                                        <select value={selectedOrder.agent} onChange={(e) => handleAssignAgent(selectedOrder.id, e.target.value)}>
                                            <option value="Non assigné">Non assigné</option>
                                            <option value="Karim Diallo">Karim Diallo</option>
                                            <option value="Marie Dupont">Marie Dupont</option>
                                            <option value="Jean Martin">Jean Martin</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Maintenance */}
                    {activeMenu === 'maintenance' && (
                        <div className="admin-section maintenance-section">
                            <div className="maintenance-list">
                                {maintenanceRequests.map(req => (
                                    <div key={req.id} className={`maintenance-card ${selectedMaintenance?.id === req.id ? 'selected' : ''}`} onClick={() => setSelectedMaintenance(req)}>
                                        <div className="maintenance-header">
                                            <strong>{req.ref}</strong>
                                            <span className={`urgency-badge urgency-${req.urgency.toLowerCase()}`}>{req.urgency}</span>
                                        </div>
                                        <div className="maintenance-info">
                                            <span>📧 {req.email}</span>
                                            <span>🔧 {req.type}</span>
                                        </div>
                                        <span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedMaintenance && (
                                <div className="maintenance-details">
                                    <h3>Demande #{selectedMaintenance.ref}</h3>
                                    <div className="detail-group">
                                        <label>Email:</label>
                                        <span>{selectedMaintenance.email}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Type:</label>
                                        <span>{selectedMaintenance.type}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Description:</label>
                                        <p>{selectedMaintenance.description}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label>Statut:</label>
                                        <select value={selectedMaintenance.status} onChange={(e) => handleUpdateMaintenanceStatus(selectedMaintenance.id, e.target.value)}>
                                            <option value="Reçue">Reçue</option>
                                            <option value="En cours">En cours</option>
                                            <option value="Résolue">Résolue</option>
                                        </select>
                                    </div>
                                    <div className="detail-group">
                                        <label>Technicien:</label>
                                        <select value={selectedMaintenance.technicien} onChange={(e) => handleAssignTechnicien(selectedMaintenance.id, e.target.value)}>
                                            <option value="Non assigné">Non assigné</option>
                                            <option value="Tech A">Technicien A</option>
                                            <option value="Tech B">Technicien B</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</h2>
                        <form onSubmit={handleSubmitProduct}>
                            <input type="text" placeholder="Nom" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                            <input type="text" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
                            <input type="number" placeholder="Prix (FCFA)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) })} required />
                            <input type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} required />
                            <input type="text" placeholder="URL Image" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} required />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowProductModal(false)}>Annuler</button>
                                <button type="submit">{editingProduct ? 'Modifier' : 'Ajouter'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rental Modal */}
            {showRentalModal && (
                <div className="modal-overlay" onClick={() => setShowRentalModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingRental ? 'Modifier' : 'Ajouter'} un service</h2>
                        <form onSubmit={handleSubmitRental}>
                            <input type="text" placeholder="Nom" value={rentalForm.name} onChange={(e) => setRentalForm({ ...rentalForm, name: e.target.value })} required />
                            <input type="text" placeholder="Description" value={rentalForm.description} onChange={(e) => setRentalForm({ ...rentalForm, description: e.target.value })} required />
                            <input type="text" placeholder="Prix (ex: 90 $)" value={rentalForm.price} onChange={(e) => setRentalForm({ ...rentalForm, price: e.target.value })} required />
                            <input type="text" placeholder="Durée (ex: 2 semaines)" value={rentalForm.duration} onChange={(e) => setRentalForm({ ...rentalForm, duration: e.target.value })} required />
                            <input type="text" placeholder="URL Image" value={rentalForm.image} onChange={(e) => setRentalForm({ ...rentalForm, image: e.target.value })} required />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRentalModal(false)}>Annuler</button>
                                <button type="submit">{editingRental ? 'Modifier' : 'Ajouter'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboardPage
