import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import './DashboardPage.css'

function DashboardPage() {
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [previousMenu, setPreviousMenu] = useState('dashboard')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState([
        { id: 1, title: 'Commande en cours', count: 0, color: 'orange' },
        { id: 2, title: 'Devis en Attente', count: 0, color: 'blue' },
        { id: 3, title: 'Intervention en Cours', count: 0, color: 'green' },
        { id: 4, title: 'Factures a Payer', count: 0, color: 'orange' }
    ])
    const [recentActivities, setRecentActivities] = useState([])
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([])
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
    const [quotes, setQuotes] = useState([])
    const [products, setProducts] = useState([])
    const [showDevisModal, setShowDevisModal] = useState(false)
    const [devisForm, setDevisForm] = useState({
        client: '',
        address: '',
        products: [{ name: '', quantity: 1, unitPrice: 0 }]
    })
    const [currentDevis, setCurrentDevis] = useState(null)
    const [user, setUser] = useState({
        name: 'Utilisateur',
        email: 'email@exemple.com',
        role: 'client'
    })
    const [editProfileMode, setEditProfileMode] = useState(false)
    const [profileFormData, setProfileFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: ''
    })
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    // 1. Initial Load: User Info
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                const userName = parsed.name ||
                    (parsed.first_name && parsed.last_name ? `${parsed.first_name} ${parsed.last_name}` :
                        parsed.first_name || parsed.last_name || 'Utilisateur');
                setUser({
                    ...parsed,
                    name: userName,
                    role: parsed.role || 'client',
                    company_id: parsed.company_id || parsed.company?.id
                });
            } catch (e) {
                console.error("Error parsing user from local storage", e);
            }
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    setUser({
                        name: decoded.name || 'Utilisateur',
                        email: decoded.email,
                        role: decoded.role || 'client',
                        company_id: decoded.company_id // Might be in token
                    });
                } catch (e) {
                    console.error("Error decoding token", e);
                }
            }
        }
    }, [])

    useEffect(() => {
        if (activeMenu === 'profile' && user) {
            setProfileFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                email: user.email || ''
            })
        }
    }, [activeMenu, user])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            const response = await api.put('/auth/profile', profileFormData)
            const updatedUser = response.data.data
            const userName = updatedUser.name ||
                (updatedUser.first_name && updatedUser.last_name ? `${updatedUser.first_name} ${updatedUser.last_name}` :
                    updatedUser.first_name || updatedUser.last_name || 'Utilisateur');

            const fullUser = {
                ...updatedUser,
                name: userName
            }
            setUser(fullUser)
            localStorage.setItem('user', JSON.stringify(fullUser))
            setEditProfileMode(false)
            alert('Profil mis à jour avec succès !')
        } catch (error) {
            console.error(error)
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
            console.error(error)
            alert(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
        }
    }

    const handleSwitchRole = async (newRole) => {
        try {
            const response = await api.put('/auth/update-role', { role: newRole })
            const { token, user: updatedUser, refreshToken } = response.data.data

            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)

            const userName = updatedUser.name ||
                (updatedUser.first_name && updatedUser.last_name ? `${updatedUser.first_name} ${updatedUser.last_name}` :
                    updatedUser.first_name || updatedUser.last_name || 'Utilisateur');

            const fullUser = {
                ...updatedUser,
                name: userName
            }
            setUser(fullUser)
            localStorage.setItem('user', JSON.stringify(fullUser))

            if (newRole === 'admin' || newRole === 'agent') {
                localStorage.setItem('isAdmin', 'true')
                window.location.href = '/admin/dashboard'
            } else {
                localStorage.removeItem('isAdmin')
                alert(`Rôle changé en ${newRole} !`)
            }
        } catch (error) {
            console.error(error)
            alert('Erreur lors du changement de rôle')
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/login'
    }

    // Fetch Cart helper
    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            const backendCart = response.data.data;
            const mappedItems = backendCart.items.map(item => ({
                ...item.product,
                cartId: item.id, // backend itemId
                quantity: item.quantity,
                price: `${item.unit_price} FCFA`
            }));
            setCart(mappedItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const mapBackendQuoteToDevisState = (quote) => {
        if (!quote) return null;
        return {
            id: quote.id,
            ref: quote.quote_number,
            quote_number: quote.quote_number,
            date: new Date(quote.created_at).toLocaleDateString('fr-FR'),
            client: quote.company ? quote.company.name : (user.company ? user.company.name : 'Client'),
            address: quote.company ? quote.company.address : (user.company ? user.company.address : 'Adresse non renseignée'),
            total_amount: quote.total_amount,
            totalHT: quote.subtotal,
            tva: quote.vat_amount,
            totalTTC: quote.total_amount,
            status: quote.status,
            products: quote.items ? quote.items.map(item => ({
                name: item.product ? item.product.name : 'Produit',
                quantity: item.quantity,
                unitPrice: item.unit_price,
                total: item.subtotal
            })) : []
        };
    };

    // 2. Navigation Logic: Fetch Data based on activeMenu
    useEffect(() => {
        if (activeMenu === 'dashboard') {
            const fetchDashboardData = async () => {
                try {
                    const response = await api.get('/dashboard/summary')
                    const { counts, recentActivities: activities } = response.data.data

                    setStats([
                        { id: 1, title: 'Commande en cours', count: counts.ordersInProgress, color: 'orange' },
                        { id: 2, title: 'Devis en Attente', count: counts.quotesPending, color: 'blue' },
                        { id: 3, title: 'Intervention en Cours', count: counts.interventionsActive, color: 'green' },
                        { id: 4, title: 'Factures a Payer', count: counts.invoicesUnpaid, color: 'orange' }
                    ])

                    const mappedActivities = activities.map((item, index) => {
                        let typeLabel = item.type
                        let statusLabel = item.status
                        let statusColor = 'blue'

                        if (item.type === 'order') typeLabel = 'Commande'
                        else if (item.type === 'quote') typeLabel = 'Devis'
                        else if (item.type === 'maintenance') typeLabel = 'Intervention'

                        if (['pending', 'new', 'draft', 'sent'].includes(item.status)) {
                            statusLabel = 'En attente'
                            statusColor = 'orange'
                        } else if (['validated', 'processing', 'in_progress', 'assigned'].includes(item.status)) {
                            statusLabel = 'En Cours'
                            statusColor = 'blue'
                        } else if (['shipped', 'delivered', 'done', 'accepted', 'completed'].includes(item.status)) {
                            statusLabel = 'Terminé'
                            statusColor = 'green'
                        } else if (['cancelled', 'refused'].includes(item.status)) {
                            statusLabel = 'Annulé'
                            statusColor = 'red'
                        }

                        const dateObj = new Date(item.date)
                        const dateStr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                        const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                        return {
                            id: item.id || index,
                            type: typeLabel,
                            number: item.number ? `#${item.number}` : '',
                            status: statusLabel,
                            statusColor: statusColor,
                            dateDisplay: `${dateStr} ${timeStr}`
                        }
                    })

                    setRecentActivities(mappedActivities)
                } catch (error) {
                    console.error("Error fetching dashboard data:", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchDashboardData()
            fetchCart()
        } else if (activeMenu === 'commandes') {
            fetchCart()
        } else if (activeMenu === 'suivi') {
            const fetchOrders = async () => {
                setLoading(true)
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    console.log("Fetching Suivi data...");
                    const [ordersRes, maintenanceRes] = await Promise.allSettled([
                        api.get('/orders'),
                        api.get('/maintenance')
                    ]);

                    let fetchedOrders = [];
                    if (ordersRes.status === 'fulfilled') {
                        console.log("Orders received:", ordersRes.value.data);
                        const rawOrders = ordersRes.value.data.data || [];
                        fetchedOrders = rawOrders.map(order => {
                            // Generate Timeline based on status
                            let timeline = [
                                { label: 'Validation', status: 'pending' },
                                { label: 'Préparation', status: 'pending' },
                                { label: 'Expédition', status: 'pending' },
                                { label: 'Livraison', status: 'pending' }
                            ]

                            const s = order.status
                            if (['validated', 'processing', 'shipped', 'delivered', 'done'].includes(s)) {
                                timeline[0].status = 'completed'
                                timeline[1].status = 'current'
                            }
                            if (['processing', 'shipped', 'delivered', 'done'].includes(s)) {
                                timeline[1].status = 'completed'
                                timeline[2].status = 'current'
                            }
                            if (['shipped', 'delivered', 'done'].includes(s)) {
                                timeline[2].status = 'completed'
                                timeline[3].status = 'current'
                            }
                            if (['delivered', 'done'].includes(s)) {
                                timeline[3].status = 'completed'
                            }
                            if (s === 'pending') {
                                timeline[0].status = 'current'
                            }

                            // Map Status Label for CSS classes
                            let statusValue = 'en-attente'
                            let statusText = 'En attente'

                            if (['validated', 'processing'].includes(s)) {
                                statusValue = 'en-cours'
                                statusText = 'En cours'
                            } else if (['shipped'].includes(s)) {
                                statusValue = 'en-cours'
                                statusText = 'Expédié'
                            } else if (['delivered', 'done'].includes(s)) {
                                statusValue = 'termine'
                                statusText = 'Terminé'
                            } else if (s === 'cancelled') {
                                statusValue = 'annule'
                                statusText = 'Annulé'
                            }

                            // Generate Items String - Defensive check for createdAt vs created_at
                            const rawDate = order.createdAt || order.created_at || new Date();

                            let itemsSummary = 'Détails non disponibles'
                            if (order.items && order.items.length > 0) {
                                itemsSummary = order.items.map(i => {
                                    const pName = i.product ? i.product.name : 'Produit inconnu'
                                    return `${i.quantity}x ${pName}`
                                }).join(', ')
                            }

                            return {
                                id: order.id,
                                type: 'Commande',
                                ref: order.order_number,
                                status: statusText,
                                statusClass: statusValue,
                                date: new Date(rawDate).toLocaleDateString('fr-FR'),
                                sortDate: new Date(rawDate),
                                items: itemsSummary,
                                agent: 'Admin',
                                timeline: timeline,
                                totalAmount: order.total_amount
                            }
                        });
                    } else {
                        console.error("Failed to fetch orders:", ordersRes.reason);
                    }

                    let fetchedMaintenance = [];
                    if (maintenanceRes.status === 'fulfilled') {
                        console.log("Maintenance received:", maintenanceRes.value.data);
                        const rawMaint = maintenanceRes.value.data.data || [];
                        fetchedMaintenance = rawMaint.map(req => {
                            let statusText = req.status;
                            let statusValue = 'en-attente';

                            if (statusText === 'new') {
                                statusText = 'Nouveau';
                                statusValue = 'en-attente';
                            } else if (statusText === 'assigned' || statusText === 'in_progress') {
                                statusText = 'En cours';
                                statusValue = 'en-cours';
                            } else if (statusText === 'resolved' || statusText === 'done' || statusText === 'closed') {
                                statusText = 'Terminé';
                                statusValue = 'termine';
                            }

                            const rawDate = req.createdAt || req.created_at || new Date();

                            return {
                                id: req.id,
                                type: 'Maintenance',
                                ref: `MNT-${req.id.substring(0, 8).toUpperCase()}`,
                                status: statusText,
                                statusClass: statusValue,
                                date: new Date(rawDate).toLocaleDateString('fr-FR'),
                                sortDate: new Date(rawDate),
                                items: req.description,
                                agent: 'Agent Technique',
                                timeline: [
                                    { label: 'Demande reçue', status: statusValue === 'en-attente' ? 'current' : 'completed' },
                                    { label: 'Intervention', status: statusValue === 'en-cours' ? 'current' : (statusValue === 'termine' ? 'completed' : 'pending') },
                                    { label: 'Résolution', status: statusValue === 'termine' ? 'completed' : 'pending' }
                                ]
                            }
                        });
                    } else {
                        console.error("Failed to fetch maintenance:", maintenanceRes.reason);
                    }

                    // Merge and sort by raw date objects
                    const allItems = [...fetchedOrders, ...fetchedMaintenance].sort((a, b) => b.sortDate - a.sortDate);
                    console.log("Final orders list for UI:", allItems);
                    setOrders(allItems);

                } catch (err) {
                    console.error("Global error in Suivi fetch:", err)
                } finally {
                    setLoading(false)
                }
            }
            fetchOrders()
        } else if (activeMenu === 'devis') {
            const fetchQuotes = async () => {
                setLoading(true)
                try {
                    const response = await api.get('/quotes')
                    setQuotes(response.data.data)
                } catch (err) {
                    console.error("Error fetching quotes:", err)
                } finally {
                    setLoading(false)
                }
            }
            fetchQuotes()
        } else if (activeMenu === 'products') {
            const fetchProducts = async () => {
                setLoading(true)
                try {
                    const response = await api.get('/products')
                    setProducts(response.data.data)
                } catch (err) {
                    console.error("Error fetching products:", err)
                } finally {
                    setLoading(false)
                }
            }
            fetchProducts()
        }
    }, [activeMenu])

    const handleAddToCart = async (item) => {
        try {
            await api.post('/cart/items', { productId: item.id, quantity: 1 });
            // Refresh cart from server
            await fetchCart();
            alert(`${item.name} ajouté au panier !`);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout au panier");
        }
    }

    const handleRemoveFromCart = async (itemId) => {
        try {
            await api.delete(`/cart/items/${itemId}`);
            await fetchCart();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression de l'article");
        }
    }

    const handleGenerateQuoteFromCart = async () => {
        if (cart.length === 0) return;

        try {
            const response = await api.post('/quotes/generate', { companyId: user.company_id });
            const quote = response.data.data;
            alert('✓ Devis généré avec succès ! Vous pouvez maintenant le télécharger.');

            // Map backend quote to UI state
            const mappedDevis = mapBackendQuoteToDevisState(quote);
            setCurrentDevis(mappedDevis);

            // Refresh list of quotes
            const quotesRes = await api.get('/quotes');
            setQuotes(quotesRes.data.data);

            setCart([]);
            setActiveMenu('devis');
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération du devis. Assurez-vous d'avoir des articles dans le panier.");
        }
    }

    const handleSelectQuote = async (quoteId) => {
        try {
            setLoading(true);
            const response = await api.get(`/quotes/${quoteId}`);
            const quote = response.data.data;
            setCurrentDevis(mapBackendQuoteToDevisState(quote));
        } catch (error) {
            console.error("Error fetching quote details:", error);
            alert("Impossible de charger les détails du devis.");
        } finally {
            setLoading(false);
        }
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

    const handleDownloadPdf = async (quoteId) => {
        try {
            const response = await api.get(`/quotes/${quoteId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `quote-${quoteId}.pdf`); // or extract from header
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Impossible de télécharger le PDF.');
        }
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
            items: `Devis ${currentDevis.quote_number} - ${currentDevis.total_amount} FCFA`,
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

    const [maintenanceForm, setMaintenanceForm] = useState({
        description: '',
        priority: '',
        request_type: ''
    })

    const handleMaintenanceSubmit = async () => {
        if (!maintenanceForm.description || !maintenanceForm.priority || !maintenanceForm.request_type) {
            alert('Veuillez remplir tous les champs')
            return
        }

        try {
            await api.post('/maintenance', maintenanceForm)
            alert('Demande de maintenance envoyée avec succès !')
            setMaintenanceForm({ description: '', priority: '', request_type: '' })
            setActiveMenu('suivi') // Optional: redirect to tracking
        } catch (error) {
            console.error(error)
            alert("Erreur lors de l'envoi de la demande")
        }
    }


    const handleRent = async (service) => {
        try {
            const startDate = new Date().toISOString().split('T')[0]
            // Default rental encoded to 2 weeks
            const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            await api.post('/rentals', {
                items: [{
                    productId: service.id,
                    startDate,
                    endDate,
                    quantity: 1
                }]
            })
            alert(`✓ La location de "${service.name}" a été initiée !`)
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la location")
        }
    }

    // stats and recentActivities are now state variables
    /*
        const stats = [
            // ... (removed hardcoded)
        ]
     
        const recentActivities = [
            // ... (removed hardcoded)
        ]
    */

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

    /*
    const products = [
        {
            id: 1,
            ref: 'REF-LAP-001',
... (truncated)
        }
    ]
    */

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
                                <span className="search-text">{user.role === 'client' ? 'Rechercher un produit...' : 'Recherche...'}</span>
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
                            <img src={`https://ui-avatars.com/api/?name=${(user && user.name ? user.name : 'Utilisateur').replace(' ', '+')}&background=1e3a8a&color=fff`} alt={user?.name || 'User'} />
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
                                            {activity.dateDisplay && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>{activity.dateDisplay}</span>}
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
                            {products && products.length > 0 ? (
                                products.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <div className="product-card-body">
                                            <div className="product-info">
                                                <h3 className="product-name">{product.name}</h3>
                                                <p className="product-desc">{product.description}</p>
                                                <div className="product-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`star ${i < (product.rating || 0) ? 'filled' : ''}`}>⭐</span>
                                                    ))}
                                                </div>
                                                <div className="product-price-container">
                                                    <span className="product-price">{product.base_price ? `${Number(product.base_price).toLocaleString('fr-FR')} FCFA` : product.price}</span>
                                                </div>
                                            </div>
                                            <div className="product-image">
                                                <img src={product.image} alt={product.name} />
                                            </div>
                                        </div>
                                        <button className="btn-add-cart" onClick={() => handleAddToCart(product)}>Ajouter au panier</button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-products-message" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', background: '#f8f9fa', borderRadius: '12px' }}>
                                    <h3>Aucun produit disponible pour le moment</h3>
                                    <p>Veuillez repasser plus tard ou contacter le support.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeMenu === 'maintenance' && (
                    <section className="maintenance-section fade-in">
                        <div className="maintenance-card">
                            <div className="maintenance-form">
                                <div className="form-group">
                                    <label>Votre Email</label>
                                    <input type="email" placeholder={user.email} className="form-input" disabled />
                                </div>

                                <div className="form-group">
                                    <label>Type de Probleme</label>
                                    <select
                                        className="form-select"
                                        value={maintenanceForm.request_type}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, request_type: e.target.value })}
                                    >
                                        <option value="">Selectionner un type</option>
                                        <option value="materiel">Materiel (Hardware)</option>
                                        <option value="logiciel">Logiciel (Software)</option>
                                        <option value="reseau">Reseau (Network)</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Niveau d'urgence</label>
                                    <select
                                        className="form-select"
                                        value={maintenanceForm.priority}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                                    >
                                        <option value="">Selectionner l'urgence</option>
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyen</option>
                                        <option value="high">Eleve</option>
                                        <option value="urgent">Critique</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Veuillez decrire votre probleme ici..."
                                        className="form-textarea"
                                        rows="6"
                                        value={maintenanceForm.description}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-submit-maintenance" onClick={handleMaintenanceSubmit}>Envoyer la demande</button>
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
                                        onClick={handleGenerateQuoteFromCart}
                                    >
                                        Générer le devis
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
                                            <span className={`tracking-status-badge status-${order.statusClass}`}>
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
                                            <h3>Détails du Suivi</h3>
                                        </div>
                                        <div className="details-content">
                                            <div className="detail-row info-main">
                                                <span className="detail-value highlight">{selectedOrder.type} #{selectedOrder.ref}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Articles / Description :</span>
                                                <span className="detail-value">{selectedOrder.items}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Statut Actuel :</span>
                                                <span className={`tracking-status-badge status-${selectedOrder.statusClass}`} style={{ display: 'inline-block', width: 'fit-content', flex: 'none' }}>
                                                    {selectedOrder.status}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Opérateur :</span>
                                                <span className="detail-value">{selectedOrder.agent}</span>
                                            </div>

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
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
                                        <p>Sélectionnez un élément pour voir son état d'avancement</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeMenu === 'devis' && (
                    <section className="devis-section fade-in">
                        {currentDevis ? (
                            <div className="devis-card">
                                <div className="devis-header">
                                    <div className="devis-title-group">
                                        <h2 className="devis-id">Devis #{currentDevis.ref}</h2>
                                        <div className="devis-print-date">Date : {currentDevis.date}</div>
                                    </div>
                                    <div className="devis-divider"></div>
                                </div>

                                <div className="devis-client-info">
                                    <p>Client : {currentDevis.client}</p>
                                    <p>Adresse : {currentDevis.address}</p>
                                </div>

                                <div className="devis-table-container">
                                    <table className="devis-table">
                                        <thead>
                                            <tr>
                                                <th>Produit</th>
                                                <th>Qté</th>
                                                <th>P.U</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentDevis.products.map((product, index) => (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td>{product.name}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{product.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                                                        <td>{(product.quantity * product.unitPrice).toLocaleString('fr-FR')} FCFA</td>
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
                                        <span className="total-value">{currentDevis.totalHT.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <div className="total-row">
                                        <span className="total-label">TVA ({currentDevis.vat_rate || 18}%) :</span>
                                        <span className="total-value">{currentDevis.tva.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <div className="final-total-display">
                                        <span className="final-label">TOTAL TTC</span>
                                        <div className="final-line"></div>
                                        <span className="final-value">{currentDevis.totalTTC.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                </div>

                                <div className="devis-actions">
                                    <button className="btn-devis-secondary" onClick={() => handleDownloadPdf(currentDevis.id)}>
                                        Télécharger le PDF
                                    </button>
                                    <button className="btn-devis-primary" onClick={handlePasserCommande}>
                                        Valider et Passer la commande
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="devis-empty-state">
                                <div className="empty-icon">📄</div>
                                <h3 className="empty-title">Aucun devis généré</h3>
                                <p className="empty-message">Ajoutez des produits à votre panier et générez un devis pour le voir apparaître ici.</p>
                            </div>
                        )}

                        {/* Recent Quotes List (Integrated below if needed, or keeping it clean) */}
                        {quotes.length > 0 && !currentDevis && (
                            <div className="recent-quotes-list" style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto' }}>
                                <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>Historique de vos devis</h3>
                                <div className="tracking-list">
                                    {quotes.map((quote) => (
                                        <div
                                            key={quote.id}
                                            className="tracking-item"
                                            onClick={() => handleSelectQuote(quote.id)}
                                        >
                                            <span className="tracking-ref">{quote.quote_number}</span>
                                            <span className="tracking-date">{new Date(quote.created_at).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {quotes.length > 0 && currentDevis && (
                            <button
                                className="btn-back-profile"
                                style={{ position: 'fixed', bottom: '30px', right: '30px', margin: 0, zIndex: 100 }}
                                onClick={() => setCurrentDevis(null)}
                                title="Voir l'historique des devis"
                            >
                                <span>📋</span>
                            </button>
                        )}
                    </section>
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
                                        <img src={`https://ui-avatars.com/api/?name=${(user && user.name ? user.name : 'Utilisateur').replace(' ', '+')}&background=1e3a8a&color=fff&size=128`} alt="User" />
                                    </div>
                                    <h2 className="profile-name">{user.name}</h2>
                                    <p className="profile-role" style={{ textTransform: 'capitalize' }}>{user.role}</p>
                                    <div className="profile-badges">
                                        <span className="badge-premium">{user.role === 'client' ? 'Client Premium' : 'Staff F-PRO'}</span>
                                    </div>
                                </div>
                                <div className="profile-quick-stats">
                                    <div className="quick-stat">
                                        <span className="stat-val">{stats[0].count}</span>
                                        <span className="stat-lbl">Commandes</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="quick-stat">
                                        <span className="stat-val">{stats[2].count}</span>
                                        <span className="stat-lbl">Interventions</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Profile Details */}
                            <div className="profile-details-content">
                                <div className="details-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 className="card-title" style={{ border: 'none', margin: 0 }}>Informations Personnelles</h3>
                                        {!editProfileMode && (
                                            <button className="btn-edit-profile" onClick={() => setEditProfileMode(true)}>Modifier</button>
                                        )}
                                    </div>

                                    {editProfileMode ? (
                                        <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                                            <div className="details-grid">
                                                <div className="form-group">
                                                    <label>Prénom</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={profileFormData.first_name}
                                                        onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Nom</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={profileFormData.last_name}
                                                        onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-input"
                                                        value={profileFormData.email}
                                                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Téléphone</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={profileFormData.phone}
                                                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" className="btn-modal-submit">Enregistrer</button>
                                                <button type="button" className="btn-modal-cancel" onClick={() => setEditProfileMode(false)}>Annuler</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <label>Nom complet</label>
                                                <p>{user.name}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Email Professionnel</label>
                                                <p>{user.email}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Entreprise</label>
                                                <p>{user.company?.name || 'F-PRO Solutions'}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Téléphone</label>
                                                <p>{user.phone || '+226 XX XX XX XX'}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Membre depuis</label>
                                                <p>{user.created_at ? new Date(user.created_at).getFullYear() : '2024'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="details-card security-card">
                                    <h3 className="card-title">Sécurité & Compte</h3>
                                    <div className="security-settings">
                                        <div className="security-item">
                                            <div className="sec-info">
                                                <h4>Mot de passe</h4>
                                                <p>Sécurisez votre compte avec un mot de passe fort</p>
                                            </div>
                                            <button className="btn-outline-small" onClick={() => setShowPasswordModal(true)}>Changer</button>
                                        </div>
                                        {/* Demo Role Switching */}
                                        <div className="security-item" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                            <div className="sec-info">
                                                <h4 style={{ color: '#0369a1' }}>Mode Développeur / Demo</h4>
                                                <p style={{ color: '#0c4a6e' }}>Changer de rôle pour tester les différentes vues</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <select
                                                    className="pref-select"
                                                    value={user.role}
                                                    onChange={(e) => handleSwitchRole(e.target.value)}
                                                >
                                                    <option value="client">Client</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="agent">Agent</option>
                                                    <option value="technicien">Technicien</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn-logout-alt" onClick={handleLogout}>Se déconnecter</button>
                            </div>
                        </div>

                        {/* Password Modal */}
                        {showPasswordModal && (
                            <div className="devis-modal-overlay">
                                <div className="devis-modal" style={{ maxWidth: '400px' }}>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Changer le mot de passe</h2>
                                        <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
                                    </div>
                                    <form onSubmit={handleChangePassword} className="devis-form" style={{ marginTop: '20px' }}>
                                        <div className="form-group">
                                            <label>Mot de passe actuel</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                required
                                                value={passwordFormData.current_password}
                                                onChange={(e) => setPasswordFormData({ ...passwordFormData, current_password: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                required
                                                value={passwordFormData.new_password}
                                                onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirmer le mot de passe</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                required
                                                value={passwordFormData.confirm_password}
                                                onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })}
                                            />
                                        </div>
                                        <div className="modal-actions">
                                            <button type="button" className="btn-modal-cancel" onClick={() => setShowPasswordModal(false)}>Annuler</button>
                                            <button type="submit" className="btn-modal-submit">Mettre à jour</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    )
}

export default DashboardPage
