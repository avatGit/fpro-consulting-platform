import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import './DashboardPage.css'

function DashboardPage() {
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [previousMenu, setPreviousMenu] = useState('dashboard')
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([
        {
            id: 1,
            ref: 'CMD-1032',
            status: 'En cours',
            date: '12/11/2019',
            items: 'Materiel : 5x PC Dell',
            agent: 'Karim Diallo',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'current' },
                { label: 'Intervention Prevue', status: 'pending' }
            ]
        },
        {
            id: 2,
            ref: 'CMD-832',
            status: 'En attente',
            date: '12/11/2024',
            items: 'Materiel : 1x Imprimante Pro',
            agent: 'Karim Diallo',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'pending' },
                { label: 'Intervention Prevue', status: 'pending' }
            ]
        },
        {
            id: 3,
            ref: 'CMD-1232',
            status: 'Termine',
            date: '02/01/2026',
            items: 'Service : Maintenance Serveur',
            agent: 'Karim Diallo',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'completed' },
                { label: 'Intervention Prevue', status: 'completed' }
            ]
        }
    ])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [feedbacks, setFeedbacks] = useState([
        {
            id: 1,
            category: 'Produit',
            rating: 5,
            message: 'Ordinateur portable tres performant. Livraison rapide.',
            date: '15/01/2026',
            status: 'Analysé'
        },
        {
            id: 2,
            category: 'Service',
            rating: 4,
            message: 'La maintenance de mon serveur a ete faite avec soin.',
            date: '10/01/2026',
            status: 'Pris en compte'
        }
    ])
    const [feedbackForm, setFeedbackForm] = useState({
        category: '',
        rating: 0,
        message: '',
        orderRef: ''
    })
    const [showDevisModal, setShowDevisModal] = useState(false)
    const [devisForm, setDevisForm] = useState({
        client: '',
        address: '',
        products: [{ name: '', quantity: 1, unitPrice: 0 }]
    })
    const [currentDevis, setCurrentDevis] = useState(null)

    const handleAddToCart = (item) => {
        setCart([...cart, { ...item, cartId: Date.now() }])
        alert(`${item.name} ajoute au panier !`)
    }

    const handleRemoveFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId))
    }

    const handleConfirmOrder = () => {
        if (cart.length === 0) return

        const newOrder = {
            id: Date.now(),
            ref: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'En attente',
            date: new Date().toLocaleDateString('fr-FR'),
            items: `Commande de ${cart.length} produit(s)`,
            agent: 'Karim Diallo',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'pending' },
                { label: 'Intervention Prevue', status: 'pending' }
            ]
        }

        setOrders([newOrder, ...orders])
        setCart([])
        setActiveMenu('suivi')
        setSelectedOrder(newOrder)
        alert('Commande confirmee !')
    }

    const handleFeedbackSubmit = (e) => {
        e.preventDefault()
        if (!feedbackForm.category || !feedbackForm.message || feedbackForm.rating === 0) {
            alert('Veuillez remplir tous les champs et donner une note.')
            return
        }

        const newFeedback = {
            id: Date.now(),
            ...feedbackForm,
            date: new Date().toLocaleDateString('fr-FR'),
            status: 'En attente'
        }

        setFeedbacks([newFeedback, ...feedbacks])
        setFeedbackForm({ category: '', rating: 0, message: '', orderRef: '' })
        alert('Merci pour votre retour !')
    }

    // Devis handlers
    const handleAddProduct = () => {
        setDevisForm({
            ...devisForm,
            products: [...devisForm.products, { name: '', quantity: 1, unitPrice: 0 }]
        })
    }

    const handleRemoveProduct = (index) => {
        const newProducts = devisForm.products.filter((_, i) => i !== index)
        setDevisForm({ ...devisForm, products: newProducts })
    }

    const handleProductChange = (index, field, value) => {
        const newProducts = [...devisForm.products]
        newProducts[index][field] = value
        setDevisForm({ ...devisForm, products: newProducts })
    }

    const calculateTotals = () => {
        const totalHT = devisForm.products.reduce((sum, product) => {
            return sum + (product.quantity * product.unitPrice)
        }, 0)
        const tva = totalHT * 0.20
        const totalTTC = totalHT + tva
        return { totalHT, tva, totalTTC }
    }

    const handleGenerateDevis = () => {
        setShowDevisModal(true)
    }

    const handleSubmitDevis = (e) => {
        e.preventDefault()
        if (!devisForm.client || !devisForm.address || devisForm.products.some(p => !p.name || p.quantity <= 0 || p.unitPrice <= 0)) {
            alert('Veuillez remplir tous les champs du devis correctement.')
            return
        }

        // Calculate totals
        const totals = calculateTotals()

        // Create new devis
        const newDevis = {
            id: Date.now(),
            ref: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toLocaleDateString('fr-FR'),
            client: devisForm.client,
            address: devisForm.address,
            products: [...devisForm.products],
            totalHT: totals.totalHT,
            tva: totals.tva,
            totalTTC: totals.totalTTC
        }

        setCurrentDevis(newDevis)
        alert('✓ Devis généré avec succès !')
        setShowDevisModal(false)

        // Reset form
        setDevisForm({
            client: '',
            address: '',
            products: [{ name: '', quantity: 1, unitPrice: 0 }]
        })
    }

    const handlePasserCommande = () => {
        if (!currentDevis) {
            alert('Veuillez d\'abord générer un devis.')
            return
        }

        // Create new order from current devis
        const newOrder = {
            id: Date.now(),
            ref: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'En attente',
            date: new Date().toLocaleDateString('fr-FR'),
            items: `Devis ${currentDevis.ref} - ${currentDevis.products.length} produit(s)`,
            agent: 'Karim Diallo',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'pending' },
                { label: 'Intervention Prevue', status: 'pending' }
            ],
            devisRef: currentDevis.ref,
            client: currentDevis.client,
            totalTTC: currentDevis.totalTTC
        }

        setOrders([newOrder, ...orders])
        setCurrentDevis(null) // Clear current devis
        setActiveMenu('suivi')
        setSelectedOrder(newOrder)
        alert('✓ Votre commande a été validée avec succès ! Consultez la section Suivi.')
    }

    const handleRent = (service) => {
        const newOrder = {
            id: Date.now(),
            ref: `LOK-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'En attente',
            date: new Date().toLocaleDateString('fr-FR'),
            items: `Location : ${service.name} (${service.duration})`,
            agent: 'Karim Diallo',
            type: 'location',
            timeline: [
                { label: 'Demande recue', status: 'completed' },
                { label: 'En cours', status: 'pending' },
                { label: 'Intervention Prevue', status: 'pending' }
            ]
        }

        setOrders([newOrder, ...orders])
        setActiveMenu('suivi')
        setSelectedOrder(newOrder)
        alert(`✓ La location de "${service.name}" a été initiée !`)
    }

    const userData = {
        name: 'John Doe',
        email: 'john.doe@entreprise.com',
        company: 'F-PRO Solutions',
        role: 'Directeur Technique',
        phone: '+226 01 02 03 04',
        joinDate: 'Janvier 2024'
    }

    const stats = [
        {
            id: 1,
            title: 'Commande en cours',
            count: 3,
            color: 'orange'
        },
        {
            id: 2,
            title: 'Devis en Attente',
            count: 2,
            color: 'blue'
        },
        {
            id: 3,
            title: 'Intervention en Cours',
            count: 1,
            color: 'green'
        },
        {
            id: 4,
            title: 'Factures a Payer',
            count: 2,
            color: 'orange'
        }
    ]

    const recentActivities = [
        {
            id: 1,
            type: 'Commande',
            number: '#1245',
            status: 'En Cours',
            statusColor: 'blue'
        },
        {
            id: 2,
            type: 'Devis',
            number: '#845',
            status: 'En attente',
            statusColor: 'orange'
        },
        {
            id: 3,
            type: 'Intervention programmee',
            number: '',
            status: 'Aujourdhuit 10:00',
            statusColor: 'green'
        }
    ]

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'products', label: 'Produits', icon: '📦' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
        { id: 'locations', label: 'Locations', icon: '📍' },
        { id: 'commandes', label: 'Commandes', icon: '🛒' },
        { id: 'suivi', label: 'Suivi', icon: '📈' },
        { id: 'devis', label: 'Devis', icon: '📄' },
        { id: 'retours', label: 'Retours client', icon: '↩️' }
    ]

    const products = [
        {
            id: 1,
            ref: 'REF-LAP-001',
            name: 'Ordinateur Portable',
            description: 'Qualite superieur chez nous',
            price: '850.000 FCFA',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 2,
            ref: 'REF-PRN-002',
            name: 'Imprimante',
            description: 'Qualite superieur chez nous',
            price: '120.000 FCFA',
            rating: 4,
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 3,
            ref: 'REF-SRV-003',
            name: 'Serveur Rack',
            description: 'Qualite superieur chez nous',
            price: '1.500.000 FCFA',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 4,
            ref: 'REF-CAM-004',
            name: 'Camera de surveillance',
            description: 'Qualite superieur chez nous',
            price: '45.000 FCFA',
            rating: 4,
            image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 5,
            ref: 'REF-SCN-005',
            name: 'Scanner Pro',
            description: 'Qualite superieur chez nous',
            price: '75.000 FCFA',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 6,
            ref: 'REF-MON-006',
            name: 'Ecran 4K',
            description: 'Qualite superieur chez nous',
            price: '250.000 FCFA',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80'
        }
    ]

    const rentalServices = [
        {
            id: 1,
            name: 'Location imprimante',
            description: 'Imprimante ultra professionnelle pour tout vos besoin a seuleseulement',
            price: '90 $',
            duration: '2 semaines',
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 2,
            name: 'Location Serveur Rack',
            description: 'Serveur ultra pour tout vos besoin a seuleseulement',
            price: '90 $',
            duration: '1 an',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&w=300&q=80'
        },
        {
            id: 3,
            name: 'Support Technique',
            description: 'Support technique pour tout besoin de support a seulement',
            price: '50 $',
            duration: '2 semaines',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'
        }
    ];

    const getPageTitle = () => {
        const item = menuItems.find(i => i.id === activeMenu)
        return item ? item.label : 'Tableau de bord'
    }

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Logo light />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-arrow">›</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <h1 className="page-title">
                        {activeMenu === 'products' ? 'Catalogue Produits' :
                            activeMenu === 'devis' ? 'Générer un Devis' :
                                getPageTitle()}
                    </h1>

                    <div className="header-actions">
                        {!['maintenance', 'retours', 'profile'].includes(activeMenu) && (
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <span className="search-text">ahsnkendimde</span>
                            </div>
                        )}

                        <button className="notification-btn">
                            <span className="bell-icon">🔔</span>
                            <span className="notification-badge"></span>
                        </button>

                        <div
                            className="user-avatar"
                            onClick={() => {
                                setPreviousMenu(activeMenu)
                                setActiveMenu('profile')
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Voir mon profil"
                        >
                            <img src="https://ui-avatars.com/api/?name=User&background=1e3a8a&color=fff" alt="User" />
                        </div>
                    </div>
                </header>


                {activeMenu === 'dashboard' && (
                    <>
                        {/* Stats Grid */}
                        <section className="stats-section">
                            <div className="stats-grid">
                                {stats.map((stat) => (
                                    <div key={stat.id} className={`stat-card stat-${stat.color}`}>
                                        <h3 className="stat-title">{stat.title}</h3>
                                        <p className="stat-count">{stat.count}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Activities */}
                        <section className="activities-section">
                            <div className="section-header">
                                <h2 className="section-title">Activite Recentes</h2>
                                <button className="nav-arrow-btn">‹</button>
                            </div>

                            <div className="activities-list">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-info">
                                            <span className="activity-type">{activity.type}</span>
                                            {activity.number && (
                                                <span className={`activity-number ${activity.statusColor}`}>
                                                    {activity.number}
                                                </span>
                                            )}
                                            <span className={`activity-status status-${activity.statusColor}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        <button className="details-btn">
                                            Details <span className="arrow">›</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeMenu === 'products' && (
                    <section className="products-section fade-in">
                        <div className="products-grid">
                            {products.map((product) => (
                                <div key={product.id} className="product-card">
                                    <div className="product-card-body">
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-desc">{product.description}</p>
                                            <div className="product-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`star ${i < product.rating ? 'filled' : ''}`}>⭐</span>
                                                ))}
                                            </div>
                                            <div className="product-price-container">
                                                <span className="product-price">{product.price}</span>
                                            </div>
                                        </div>
                                        <div className="product-image">
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                    </div>
                                    <button className="btn-add-cart" onClick={() => handleAddToCart(product)}>Ajouter au panier</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeMenu === 'maintenance' && (
                    <section className="maintenance-section fade-in">
                        <div className="maintenance-card">
                            <div className="maintenance-form">
                                <div className="form-group">
                                    <label>Votre Email</label>
                                    <input type="email" placeholder="exemple@email.com" className="form-input" />
                                </div>

                                <div className="form-group">
                                    <label>Type de Probleme</label>
                                    <select className="form-select">
                                        <option value="">Selectionner un type</option>
                                        <option value="materiel">Materiel (Hardware)</option>
                                        <option value="logiciel">Logiciel (Software)</option>
                                        <option value="reseau">Reseau (Network)</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Niveau d'urgence</label>
                                    <select className="form-select">
                                        <option value="">Selectionner l'urgence</option>
                                        <option value="faible">Faible</option>
                                        <option value="moyen">Moyen</option>
                                        <option value="eleve">Eleve</option>
                                        <option value="critique">Critique</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Veuillez decrire votre probleme ici..."
                                        className="form-textarea"
                                        rows="6"
                                    ></textarea>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-submit-maintenance">Envoyer la demande</button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {activeMenu === 'locations' && (
                    <section className="rental-section fade-in">
                        <div className="rental-grid">
                            {rentalServices.map((service) => (
                                <div key={service.id} className="rental-card">
                                    <h3 className="rental-name">{service.name}</h3>
                                    <div className="rental-image">
                                        <img src={service.image} alt={service.name} />
                                    </div>
                                    <p className="rental-desc">{service.description}</p>
                                    <div className="rental-price-row">
                                        <span className="rental-price">{service.price}/pour</span>
                                        <span className="rental-duration">{service.duration}</span>
                                    </div>
                                    <button className="btn-rent" onClick={() => handleRent(service)}>Louer</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeMenu === 'commandes' && (
                    <section className="orders-section fade-in">
                        <div className="orders-container">
                            <div className="orders-list-card">
                                <h2 className="orders-subtitle">Votre Selection</h2>
                                <div className="orders-list">
                                    {cart.length > 0 ? (
                                        cart.map((item) => (
                                            <div key={item.cartId} className="order-item">
                                                <div className="order-item-info">
                                                    <span className="order-ref">REF: {item.ref}</span>
                                                    <span className="order-price">{item.price}</span>
                                                </div>
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={() => handleRemoveFromCart(item.cartId)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-cart-message">
                                            Votre selection est vide. Veuillez choisir des produits.
                                        </div>
                                    )}
                                </div>
                                <div className="orders-footer">
                                    <button
                                        className="btn-confirm-order"
                                        disabled={cart.length === 0}
                                        onClick={handleConfirmOrder}
                                    >
                                        Confirmer la commande
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {activeMenu === 'suivi' && (
                    <section className="tracking-section fade-in">
                        <div className="tracking-container">
                            {/* Tracking List */}
                            <div className="tracking-list-panel">
                                <div className="tracking-table-header">
                                    <span>Reference</span>
                                    <span>Statut</span>
                                    <span>Date</span>
                                </div>
                                <div className="tracking-list">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`tracking-item ${selectedOrder?.id === order.id ? 'active' : ''}`}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <span className="tracking-ref">{order.ref}</span>
                                            <span className={`tracking-status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                                                {order.status}
                                            </span>
                                            <span className="tracking-date">{order.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tracking Details Panel */}
                            <div className="tracking-details-panel">
                                {selectedOrder ? (
                                    <>
                                        <div className="details-header">
                                            <h3>Details de la commande</h3>
                                        </div>
                                        <div className="details-content">
                                            <div className="detail-row info-main">
                                                <span className="detail-value highlight">Commande #{selectedOrder.ref}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-value">{selectedOrder.items}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Statut:</span>
                                                <span className="detail-value">{selectedOrder.status}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Agent :</span>
                                                <span className="detail-value">{selectedOrder.agent}</span>
                                            </div>
                                            {selectedOrder.type === 'location' && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Type :</span>
                                                    <span className="detail-value" style={{ color: '#10b981', fontWeight: 'bold' }}>Location</span>
                                                </div>
                                            )}

                                            <div className="tracking-timeline">
                                                {selectedOrder.timeline.map((step, index) => (
                                                    <div key={index} className={`timeline-step ${step.status}`}>
                                                        <div className="step-indicator">
                                                            <div className="step-dot"></div>
                                                            {index < selectedOrder.timeline.length - 1 && <div className="step-line"></div>}
                                                        </div>
                                                        <span className="step-label">{step.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-order-selected">
                                        Selectionnez une commande pour voir les details
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeMenu === 'devis' && (
                    <>
                        <section className="devis-section fade-in">
                            <div className="devis-card">
                                {currentDevis ? (
                                    <>
                                        <div className="devis-header">
                                            <div className="devis-title-group">
                                                <h2 className="devis-id">Devis #{currentDevis.ref}</h2>
                                                <div className="devis-print-date">Devis imprimé le : {currentDevis.date}</div>
                                            </div>
                                            <div className="devis-divider"></div>
                                        </div>

                                        <div className="devis-client-info">
                                            <p><strong>Client :</strong> {currentDevis.client}</p>
                                            <p><strong>Addresse :</strong> {currentDevis.address}</p>
                                        </div>

                                        <div className="devis-table-container">
                                            <table className="devis-table">
                                                <thead>
                                                    <tr>
                                                        <th>Produit</th>
                                                        <th>Quantité</th>
                                                        <th>Prix unitaire</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentDevis.products.map((product, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <td>{product.name}</td>
                                                                <td>{product.quantity}</td>
                                                                <td>{product.unitPrice.toFixed(2)}$</td>
                                                                <td>{(product.quantity * product.unitPrice).toFixed(2)} $</td>
                                                            </tr>
                                                            {index < currentDevis.products.length - 1 && (
                                                                <tr className="spacer-row"><td colSpan="4"></td></tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="devis-totals">
                                            <div className="total-row">
                                                <span className="total-label">Total HT :</span>
                                                <span className="total-value">{currentDevis.totalHT.toFixed(2)}$</span>
                                            </div>
                                            <div className="total-row">
                                                <span className="total-label">Total TVA (20%)</span>
                                                <span className="total-value">{currentDevis.tva.toFixed(2)}$</span>
                                            </div>
                                            <div className="total-row main-total">
                                                <span className="total-label">Total TTC :</span>
                                                <span className="total-value">{currentDevis.totalTTC.toFixed(2)}$</span>
                                            </div>
                                            <div className="final-total-display">
                                                <span className="final-label">Total</span>
                                                <div className="final-line"></div>
                                                <span className="final-value">{currentDevis.totalTTC.toFixed(2)}$</span>
                                            </div>
                                        </div>

                                        <div className="devis-actions">
                                            <button className="btn-devis-secondary" onClick={handleGenerateDevis}>
                                                Generer un nouveau Devis
                                            </button>
                                            <button className="btn-devis-primary" onClick={handlePasserCommande}>
                                                Passer la commande
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="devis-empty-state">
                                        <div className="empty-icon">📄</div>
                                        <h3 className="empty-title">Aucun devis généré</h3>
                                        <p className="empty-message">Cliquez sur le bouton ci-dessous pour créer un nouveau devis</p>
                                        <button className="btn-devis-secondary" onClick={handleGenerateDevis}>
                                            Generer le Devis
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Modal for Devis Generation */}
                        {showDevisModal && (
                            <div className="devis-modal-overlay" onClick={() => setShowDevisModal(false)}>
                                <div className="devis-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Générer un nouveau devis</h2>
                                        <button className="modal-close" onClick={() => setShowDevisModal(false)}>✕</button>
                                    </div>

                                    <form className="devis-form" onSubmit={handleSubmitDevis}>
                                        <div className="form-group">
                                            <label>Nom du Client</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Ex: Entreprise SARL"
                                                value={devisForm.client}
                                                onChange={(e) => setDevisForm({ ...devisForm, client: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Adresse du Client</label>
                                            <textarea
                                                className="form-textarea"
                                                placeholder="Ex: 10 Avenue 3, 75001 Paris"
                                                rows="2"
                                                value={devisForm.address}
                                                onChange={(e) => setDevisForm({ ...devisForm, address: e.target.value })}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="form-group">
                                            <label>Produits / Services</label>
                                            <div className="products-list">
                                                {devisForm.products.map((product, index) => (
                                                    <div key={index} className="product-row">
                                                        <input
                                                            type="text"
                                                            className="form-input product-name-input"
                                                            placeholder="Nom du produit"
                                                            value={product.name}
                                                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                            required
                                                        />
                                                        <input
                                                            type="number"
                                                            className="form-input product-qty-input"
                                                            placeholder="Qté"
                                                            min="1"
                                                            value={product.quantity}
                                                            onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            required
                                                        />
                                                        <input
                                                            type="number"
                                                            className="form-input product-price-input"
                                                            placeholder="Prix unitaire"
                                                            min="0"
                                                            step="0.01"
                                                            value={product.unitPrice}
                                                            onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            required
                                                        />
                                                        {devisForm.products.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn-remove-product"
                                                                onClick={() => handleRemoveProduct(index)}
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" className="btn-add-product" onClick={handleAddProduct}>
                                                + Ajouter un produit
                                            </button>
                                        </div>

                                        <div className="devis-preview">
                                            <div className="preview-row">
                                                <span>Total HT:</span>
                                                <span className="preview-value">{calculateTotals().totalHT.toFixed(2)} $</span>
                                            </div>
                                            <div className="preview-row">
                                                <span>TVA (20%):</span>
                                                <span className="preview-value">{calculateTotals().tva.toFixed(2)} $</span>
                                            </div>
                                            <div className="preview-row preview-total">
                                                <span>Total TTC:</span>
                                                <span className="preview-value">{calculateTotals().totalTTC.toFixed(2)} $</span>
                                            </div>
                                        </div>

                                        <div className="modal-actions">
                                            <button type="button" className="btn-modal-cancel" onClick={() => setShowDevisModal(false)}>
                                                Annuler
                                            </button>
                                            <button type="submit" className="btn-modal-submit">
                                                Générer le Devis
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeMenu === 'retours' && (
                    <section className="feedback-section fade-in">
                        <div className="feedback-container">
                            {/* Feedback Form */}
                            <div className="feedback-form-card">
                                <h2 className="feedback-title">Donnez votre avis</h2>
                                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                                    <div className="form-group">
                                        <label>Catégorie</label>
                                        <select
                                            className="form-select"
                                            value={feedbackForm.category}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Produit">Produit</option>
                                            <option value="Service">Service</option>
                                            <option value="Livraison">Livraison</option>
                                            <option value="Support">Support</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Note globale</label>
                                        <div className="rating-selector">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${feedbackForm.rating >= star ? 'filled' : ''}`}
                                                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Référence de commande (Optionnel)</label>
                                        <input
                                            type="text"
                                            placeholder="ex: CMD-1032"
                                            className="form-input"
                                            value={feedbackForm.orderRef}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, orderRef: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Votre commentaire</label>
                                        <textarea
                                            className="form-textarea"
                                            rows="4"
                                            placeholder="Dites-nous ce que vous en pensez..."
                                            value={feedbackForm.message}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn-submit-feedback">Envoyer mon retour</button>
                                </form>
                            </div>

                            {/* Feedback History */}
                            <div className="feedback-history-card">
                                <h2 className="feedback-title">Historique des retours</h2>
                                <div className="feedback-list">
                                    {feedbacks.map((f) => (
                                        <div key={f.id} className="feedback-item">
                                            <div className="feedback-item-header">
                                                <span className="feedback-cat">{f.category}</span>
                                                <span className="feedback-date">{f.date}</span>
                                            </div>
                                            <div className="feedback-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`star ${i < f.rating ? 'filled' : ''}`}>⭐</span>
                                                ))}
                                            </div>
                                            <p className="feedback-msg">{f.message}</p>
                                            <span className={`feedback-status tag-${f.status.toLowerCase().replace(' ', '-')}`}>
                                                {f.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeMenu === 'profile' && (
                    <section className="profile-section fade-in">
                        <button
                            className="btn-back-profile"
                            onClick={() => setActiveMenu(previousMenu)}
                            title={`Retour vers ${menuItems.find(m => m.id === previousMenu)?.label}`}
                        >
                            <span>←</span>
                        </button>
                        <div className="profile-container">
                            {/* Profile Sidebar / Quick Info */}
                            <div className="profile-sidebar-card">
                                <div className="profile-header-bg"></div>
                                <div className="profile-main-info">
                                    <div className="large-avatar">
                                        <img src="https://ui-avatars.com/api/?name=User&background=1e3a8a&color=fff&size=128" alt="User" />
                                    </div>
                                    <h2 className="profile-name">{userData.name}</h2>
                                    <p className="profile-role">{userData.role}</p>
                                    <div className="profile-badges">
                                        <span className="badge-premium">Client Premium</span>
                                    </div>
                                </div>
                                <div className="profile-quick-stats">
                                    <div className="quick-stat">
                                        <span className="stat-val">12</span>
                                        <span className="stat-lbl">Commandes</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="quick-stat">
                                        <span className="stat-val">05</span>
                                        <span className="stat-lbl">Demandes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Profile Details */}
                            <div className="profile-details-content">
                                <div className="details-card">
                                    <h3 className="card-title">Informations Personnelles</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <label>Nom complet</label>
                                            <p>{userData.name}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email Professionnel</label>
                                            <p>{userData.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Entreprise</label>
                                            <p>{userData.company}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Téléphone</label>
                                            <p>{userData.phone}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Membre depuis</label>
                                            <p>{userData.joinDate}</p>
                                        </div>
                                    </div>
                                    <button className="btn-edit-profile">Modifier mes informations</button>
                                </div>

                                <div className="details-card security-card">
                                    <h3 className="card-title">Sécurité & Compte</h3>
                                    <div className="security-settings">
                                        <div className="security-item">
                                            <div className="sec-info">
                                                <h4>Mot de passe</h4>
                                                <p>Dernière modification il y a 3 mois</p>
                                            </div>
                                            <button className="btn-outline-small">Changer</button>
                                        </div>
                                        <div className="security-item">
                                            <div className="sec-info">
                                                <h4>Authentification à deux facteurs</h4>
                                                <p>Ajoutez une couche de sécurité supplémentaire</p>
                                            </div>
                                            <div className="toggle-switch">
                                                <input type="checkbox" id="a2f-toggle" />
                                                <label htmlFor="a2f-toggle"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="details-card preferences-card">
                                    <h3 className="card-title">Préférences</h3>
                                    <div className="pref-settings">
                                        <div className="pref-item">
                                            <div className="pref-info">
                                                <h4>Notifications Email</h4>
                                                <p>Recevoir des alertes pour vos commandes</p>
                                            </div>
                                            <div className="toggle-switch">
                                                <input type="checkbox" id="notif-toggle" defaultChecked />
                                                <label htmlFor="notif-toggle"></label>
                                            </div>
                                        </div>
                                        <div className="pref-item">
                                            <div className="pref-info">
                                                <h4>Langue de l'interface</h4>
                                            </div>
                                            <select className="pref-select">
                                                <option value="fr">Français</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn-logout-alt">Se déconnecter</button>
                            </div>
                        </div>
                    </section>
                )}

            </main>
        </div>
    )
}

export default DashboardPage
