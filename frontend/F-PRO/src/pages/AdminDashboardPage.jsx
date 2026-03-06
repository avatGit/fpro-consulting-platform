import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { SERVER_URL } from '../services/api';
import adminApi from '../services/adminApi';
import Logo from '../components/Logo';
import '../styles/Forms.css';
import {
    StatCard,
    DataTable,
    Modal,
    Badge,
    ActionButton,
    SearchBar,
    FilterDropdown,
    Pagination,
    LoadingSpinner,
    EmptyState
} from '../components/admin/AdminComponents';
import Toast, { ToastContainer } from '../components/admin/Toast';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import './AdminReset.css';
import './AdminDashboardNew.css';
import '../components/admin/AdminComponents.css';
import '../components/admin/Toast.css';
import '../components/admin/ConfirmationModal.css';

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Dashboard State
    const [dashboardStats, setDashboardStats] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);

    // Users State
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userFilter, setUserFilter] = useState({ role: '', status: '', search: '' });
    const [userPage, setUserPage] = useState(1);

    // Quotes State
    const [quotes, setQuotes] = useState([]);
    const [quoteFilter, setQuoteFilter] = useState({ status: '', search: '' });
    const [selectedQuote, setSelectedQuote] = useState(null);

    // Invoices State
    const [invoices, setInvoices] = useState([]);
    const [invoiceStats, setInvoiceStats] = useState(null);
    const [invoiceFilter, setInvoiceFilter] = useState({ status: '', search: '' });
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditFilter, setAuditFilter] = useState({ action: '', resourceType: '', search: '' });
    const [auditPage, setAuditPage] = useState(1);

    // Settings State
    const [settings, setSettings] = useState([]);
    const [settingsCategory, setSettingsCategory] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState({ status: '', search: '' });
    const [quoteTab, setQuoteTab] = useState('devis'); // 'devis' or 'commandes'

    // Products State
    const [products, setProducts] = useState([]);
    const [productFilter, setProductFilter] = useState({ type: '', search: '' });

    // Maintenance State
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [maintenanceFilter, setMaintenanceFilter] = useState({ status: '', search: '' });

    // Technicians State (Standalone)
    const [technicians, setTechnicians] = useState([]);
    const [showTechnicianModal, setShowTechnicianModal] = useState(false);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showQuoteEditModal, setShowQuoteEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);

    // Profile State
    const [editProfileMode, setEditProfileMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [previousModule, setPreviousModule] = useState('dashboard');

    // Notifications & Confirmations
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'info',
        onConfirm: () => { },
        requireInput: false,
        inputLabel: '',
        inputPlaceholder: ''
    });

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showConfirm = (options) => {
        setConfirmModal({
            isOpen: true,
            title: options.title || 'Confirmation',
            message: options.message || 'Êtes-vous sûr ?',
            confirmText: options.confirmText || 'Confirmer',
            type: options.type || 'info',
            onConfirm: options.onConfirm,
            requireInput: options.requireInput || false,
            inputLabel: options.inputLabel || '',
            inputPlaceholder: options.inputPlaceholder || ''
        });
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        if (activeModule !== 'profile') {
            setPreviousModule(activeModule);
        }
        loadModuleData(activeModule);
    }, [activeModule]);

    const loadModuleData = async (module) => {
        setLoading(true);
        try {
            switch (module) {
                case 'dashboard':
                    await loadDashboard();
                    break;
                case 'users':
                    await loadUsers();
                    break;
                case 'quotes':
                    await Promise.all([loadQuotes(), loadOrders()]);
                    break;
                case 'invoices':
                    await loadInvoices();
                    break;
                case 'audit':
                    await loadAuditLogs();
                    break;
                case 'settings':
                    await loadSettings();
                    break;
                case 'orders':
                    await loadOrders();
                    break;
                case 'technicians':
                    await loadTechnicians();
                    break;
                case 'products':
                    await loadProducts();
                    break;
                case 'maintenance':
                    await Promise.all([loadMaintenance(), loadUsers(), loadTechnicians()]);
                    break;
                case 'profile':
                    if (user) {
                        setProfileFormData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            email: user.email || '',
                            phone: user.phone || ''
                        });
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${module}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/auth/profile', profileFormData);
            const updatedUser = response.data.data;

            // Reconstruct the name for UI consistency if needed
            const userName = updatedUser.name ||
                (updatedUser.first_name && updatedUser.last_name ? `${updatedUser.first_name} ${updatedUser.last_name}` :
                    updatedUser.first_name || updatedUser.last_name || 'Admin');

            const fullUser = {
                ...updatedUser,
                name: userName
            };

            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
            setEditProfileMode(false);
            addToast('Profil mis à jour avec succès', 'success');
        } catch (error) {
            console.error('Update profile error:', error);
            addToast(error.response?.data?.message || 'Erreur lors de la mise à jour du profil', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordFormData.new_password !== passwordFormData.confirm_password) {
            addToast('Les nouveaux mots de passe ne correspondent pas', 'error');
            return;
        }
        try {
            await api.post('/auth/change-password', {
                current_password: passwordFormData.current_password,
                new_password: passwordFormData.new_password
            });
            setShowPasswordModal(false);
            setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' });
            addToast('Mot de passe modifié avec succès', 'success');
        } catch (error) {
            console.error('Change password error:', error);
            addToast(error.response?.data?.message || 'Erreur lors du changement de mot de passe', 'error');
        }
    };

    // Load Functions
    const loadDashboard = async () => {
        try {
            console.log('Loading dashboard stats...');
            const [stats, activity] = await Promise.all([
                adminApi.getDashboardStats(),
                adminApi.getActivityLogs(10)
            ]);
            console.log('Dashboard stats loaded:', stats);
            setDashboardStats(stats.data);
            setActivityLogs(activity.data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Optionally set empty stats to avoid UI breaking if it was expecting structure
        }
    };

    const loadUsers = async () => {
        try {
            const response = await adminApi.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadQuotes = async () => {
        try {
            console.log('Loading quotes with filter:', quoteFilter);
            const response = await adminApi.getAllQuotes(quoteFilter);
            console.log('Quotes response:', response);
            console.log('Quotes data:', response.data);
            setQuotes(response.data.quotes || response.data);
        } catch (error) {
            console.error('Error loading quotes:', error);
        }
    };

    const loadInvoices = async () => {
        const [invoicesRes, statsRes] = await Promise.all([
            adminApi.getAllInvoices(invoiceFilter),
            adminApi.getInvoiceStats()
        ]);
        setInvoices(invoicesRes.data.invoices || invoicesRes.data);
        setInvoiceStats(statsRes.data);
    };

    const loadAuditLogs = async () => {
        try {
            const response = await adminApi.getAuditLogs({ ...auditFilter, page: auditPage, limit: 20 });
            setAuditLogs(response.data.logs || response.data);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const response = await adminApi.getSettings(settingsCategory);
            setSettings(response.data);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await adminApi.getAllOrders(orderFilter);
            setOrders(response.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadMaintenance = async () => {
        try {
            const response = await adminApi.getAllMaintenanceRequests(maintenanceFilter);
            setMaintenanceRequests(response.data);
        } catch (error) {
            console.error('Error loading maintenance:', error);
        }
    };

    const loadTechnicians = async () => {
        try {
            const response = await adminApi.getAllTechnicians();
            setTechnicians(response.data);
        } catch (error) {
            console.error('Error loading technicians:', error);
        }
    };

    // Action Handlers
    const handleBulkUserAction = async (action, value = null) => {
        if (selectedUsers.length === 0) {
            alert('Veuillez sélectionner au moins un utilisateur');
            return;
        }
        try {
            await adminApi.bulkUpdateUsers(selectedUsers, action, value);
            setSelectedUsers([]);
            await loadUsers();
            alert('Opération réussie');
        } catch (error) {
            alert('Erreur lors de l\'opération');
        }
    };

    const handleApproveQuote = async (quoteId) => {
        showConfirm({
            title: 'Approuver le devis',
            message: 'Êtes-vous sûr de vouloir approuver ce devis ? Une commande sera générée automatiquement.',
            confirmText: 'Approuver',
            type: 'info',
            onConfirm: async () => {
                try {
                    await adminApi.approveQuote(quoteId);
                    await Promise.all([loadQuotes(), loadOrders()]);
                    addToast('Devis approuvé et commande générée avec succès !', 'success');
                } catch (error) {
                    console.error('Error approving quote:', error);
                    addToast(error.response?.data?.message || 'Erreur lors de l\'approbation du devis', 'error');
                }
            }
        });
    };

    const handleRejectQuote = async (quoteId) => {
        showConfirm({
            title: 'Rejeter le devis',
            message: 'Veuillez indiquer la raison du rejet de ce devis.',
            confirmText: 'Rejeter',
            type: 'danger',
            requireInput: true,
            inputLabel: 'Motif du rejet',
            inputPlaceholder: 'Ex: Prix trop élevé, informations manquantes...',
            onConfirm: async (reason) => {
                try {
                    await adminApi.rejectQuote(quoteId, reason);
                    await loadQuotes();
                    addToast('Devis rejeté', 'warning');
                } catch (error) {
                    console.error('Error rejecting quote:', error);
                    addToast(error.response?.data?.message || 'Erreur lors du rejet du devis', 'error');
                }
            }
        });
    };

    const handleCreateInvoice = async (orderId) => {
        showConfirm({
            title: 'Créer une facture',
            message: 'Voulez-vous générer une facture pour cette commande ?',
            confirmText: 'Générer',
            type: 'info',
            onConfirm: async () => {
                try {
                    await adminApi.createInvoice(orderId);
                    await loadInvoices();
                    addToast('Facture générée avec succès', 'success');
                } catch (error) {
                    console.error('Error creating invoice:', error);
                    addToast(error.response?.data?.message || 'Erreur lors de la création de la facture', 'error');
                }
            }
        });
    };

    const handleUpdateInvoiceStatus = async (invoiceId, status) => {
        try {
            await adminApi.updateInvoiceStatus(invoiceId, status);
            await loadInvoices();
            addToast(`Statut de la facture mis à jour : ${status}`, 'success');
        } catch (error) {
            console.error('Error updating invoice status:', error);
            addToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const handleToggleUserStatus = async (userId) => {
        try {
            await adminApi.toggleUserStatus(userId);
            await loadUsers();
            addToast('Statut utilisateur mis à jour', 'success');
        } catch (error) {
            console.error('Error toggling user status:', error);
            addToast('Erreur lors du changement de statut', 'error');
        }
    };

    const handleValidateOrder = async (orderId) => {
        showConfirm({
            title: 'Valider la commande',
            message: 'Confirmez-vous la validation de cette commande ? Cela déduira les produits du stock.',
            confirmText: 'Valider la commande',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await adminApi.validateOrder(orderId);
                    await loadOrders();
                    await loadDashboard();
                    addToast('Commande validée avec succès', 'success');
                } catch (error) {
                    console.error('Validation error:', error);
                    addToast(error.response?.data?.message || 'Erreur lors de la validation', 'error');
                }
            }
        });
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await adminApi.updateOrderStatus(orderId, status);
            await loadOrders();
            await loadDashboard();
            addToast('Statut mis à jour avec succès', 'success');
        } catch (error) {
            console.error('Status update error:', error);
            addToast('Erreur lors de la mise à jour du statut', 'error');
        }
    };

    const handleAutoAssignTechnician = async (requestId) => {
        showConfirm({
            title: 'Assignation automatique',
            message: 'Voulez-vous assigner automatiquement le technicien le moins chargé à cette demande ?',
            confirmText: 'Assigner auto',
            type: 'info',
            onConfirm: async () => {
                try {
                    await adminApi.autoAssignTechnician(requestId);
                    await loadMaintenance();
                    addToast('Technicien assigné automatiquement', 'success');
                } catch (error) {
                    console.error('Auto-assign error:', error);
                }
            }
        });
    };

    const handleUpdateMaintenanceStatus = async (requestId, status) => {
        try {
            await adminApi.updateMaintenanceStatus(requestId, status);
            await loadMaintenance();
            addToast(`Statut de l'intervention mis à jour : ${status}`, 'success');
        } catch (error) {
            console.error('Error updating maintenance status:', error);
            addToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const handleAssignTechnician = async (requestId, technicianId) => {
        try {
            await adminApi.assignTechnician(requestId, technicianId);
            await loadMaintenance();
            addToast('Technicien assigné avec succès', 'success');
        } catch (error) {
            console.error('Error assigning technician:', error);
            addToast('Erreur lors de l\'assignation', 'error');
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            await adminApi.createProduct(productData);
            await loadProducts();
            setShowProductModal(false);
            addToast('Produit créé avec succès', 'success');
        } catch (error) {
            console.error('Error creating product:', error);
            addToast('Erreur lors de la création du produit', 'error');
        }
    };

    const handleEditProduct = async (productId, productData) => {
        try {
            await adminApi.updateProduct(productId, productData);
            await loadProducts();
            setShowProductModal(false);
            addToast('Produit mis à jour avec succès', 'success');
        } catch (error) {
            console.error('Error updating product:', error);
            addToast('Erreur lors de la mise à jour du produit', 'error');
        }
    };

    const handleDeleteProduct = async (productId) => {
        showConfirm({
            title: 'Supprimer le produit',
            message: 'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteProduct(productId);
                    await loadProducts();
                    addToast('Produit supprimé', 'success');
                } catch (error) {
                    console.error('Error deleting product:', error);
                    addToast('Erreur lors de la suppression', 'error');
                }
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Helper to render Quote Details in Modal
    const renderQuoteDetails = () => {
        if (!selectedQuote) return null;

        return (
            <div className="detail-view">
                <div className="detail-header">
                    <div className="detail-id">
                        <span className="label">Numéro de devis</span>
                        <h3>{selectedQuote.quote_number}</h3>
                    </div>
                    <Badge text={selectedQuote.status} variant={getStatusVariant(selectedQuote.status)} />
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>Informations Client</h4>
                        <div className="info-group">
                            <i className="fa-solid fa-user"></i>
                            <div>
                                <p className="info-label">Nom complet</p>
                                <p className="info-value">{selectedQuote.user?.first_name} {selectedQuote.user?.last_name}</p>
                            </div>
                        </div>
                        <div className="info-group">
                            <i className="fa-solid fa-envelope"></i>
                            <div>
                                <p className="info-label">Email</p>
                                <p className="info-value">{selectedQuote.user?.email}</p>
                            </div>
                        </div>
                        {selectedQuote.company && (
                            <div className="info-group">
                                <i className="fa-solid fa-building"></i>
                                <div>
                                    <p className="info-label">Entreprise</p>
                                    <p className="info-value">{selectedQuote.company.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-card">
                        <h4>Récapitulatif</h4>
                        <div className="info-group">
                            <i className="fa-solid fa-calendar-alt"></i>
                            <div>
                                <p className="info-label">Date de création</p>
                                <p className="info-value">{new Date(selectedQuote.createdAt || selectedQuote.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="info-group">
                            <i className="fa-solid fa-money-bill-wave"></i>
                            <div>
                                <p className="info-label">Montant Total</p>
                                <p className="info-value" style={{ fontSize: '18px', fontWeight: '800', color: '#11047A' }}>
                                    {parseFloat(selectedQuote.total_amount || 0).toLocaleString()} FCFA
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="items-section">
                    <h4>Articles du devis</h4>
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Produit/Service</th>
                                <th>Quantité</th>
                                <th>Prix Unitaire</th>
                                <th>Soustotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedQuote.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <i className={item.product?.type === 'service' ? 'fa-solid fa-concierge-bell' : 'fa-solid fa-box'} style={{ color: '#4318FF' }}></i>
                                            {item.product?.name || 'Produit inconnu'}
                                        </div>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{parseFloat(item.unit_price || 0).toLocaleString()} FCFA</td>
                                    <td>{parseFloat(item.total_price || 0).toLocaleString()} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="detail-actions">
                    <p style={{ color: '#A3AED0', fontSize: '13px', fontStyle: 'italic' }}>
                        Note: Les actions de devis sont gérées par les Agents.
                    </p>
                </div>
            </div>
        );
    };

    // Helper to render Order Details in Modal
    const renderOrderDetails = () => {
        if (!selectedOrder) return null;

        return (
            <div className="detail-view">
                <div className="detail-header">
                    <div className="detail-id">
                        <span className="label">Numéro de commande</span>
                        <h3>{selectedOrder.order_number}</h3>
                    </div>
                    <Badge text={selectedOrder.status} variant={getStatusVariant(selectedOrder.status)} />
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>Client</h4>
                        <p><strong>{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</strong></p>
                        <p>{selectedOrder.user?.email}</p>
                    </div>
                    <div className="detail-card">
                        <h4>Récapitulatif</h4>
                        <p>Date: {new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleString()}</p>
                        <p>Total: {parseFloat(selectedOrder.total_amount || 0).toLocaleString()} FCFA</p>
                    </div>
                </div>

                <div className="items-section">
                    <h4>Articles</h4>
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Quantité</th>
                                <th>Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.product?.name || 'Produit'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{parseFloat(item.unit_price || 0).toLocaleString()} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="detail-actions">
                    {selectedOrder.status === 'delivered' && (
                        <button className="btn btn-info" onClick={() => {
                            setShowOrderModal(false);
                            handleCreateInvoice(selectedOrder.id);
                        }}>
                            <i className="fa-solid fa-file-invoice"></i> Générer Facture
                        </button>
                    )}
                    {(selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled') && (
                        <p style={{ color: '#A3AED0', fontSize: '13px', fontStyle: 'italic' }}>
                            Note: Les actions opérationnelles sur les commandes sont gérées par les Agents.
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderInvoiceDetails = () => {
        if (!selectedInvoice) return null;

        return (
            <div className="detail-view">
                <div className="detail-header">
                    <div className="detail-id">
                        <span className="label">Numéro de facture</span>
                        <h3>{selectedInvoice.invoice_number}</h3>
                    </div>
                    <Badge text={selectedInvoice.status} variant={getStatusVariant(selectedInvoice.status)} />
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>Client / Entreprise</h4>
                        <p><strong>{selectedInvoice.company?.name || 'N/A'}</strong></p>
                        <p>{selectedInvoice.company?.address}</p>
                    </div>
                    <div className="detail-card">
                        <h4>Récapitulatif</h4>
                        <p>Date d'émission: {new Date(selectedInvoice.issue_date).toLocaleDateString()}</p>
                        <p>Date d'échéance: {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: '#11047A', marginTop: '10px' }}>
                            Total: {parseFloat(selectedInvoice.total_amount || 0).toLocaleString()} FCFA
                        </p>
                    </div>
                </div>

                <div className="detail-actions">
                    {selectedInvoice.status !== 'paid' && (
                        <button className="btn btn-success" onClick={() => {
                            setShowInvoiceModal(false);
                            handleUpdateInvoiceStatus(selectedInvoice.id, 'paid');
                        }}>
                            <i className="fa-solid fa-check-circle"></i> Marquer comme payée
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                        <i className="fa-solid fa-print"></i> Imprimer
                    </button>
                </div>
            </div>
        );
    };

    const renderMaintenanceDetails = () => {
        if (!selectedMaintenance) return null;

        return (
            <div className="detail-view">
                <div className="detail-header">
                    <div className="detail-id">
                        <span className="label">Intervention ID</span>
                        <h3>#{selectedMaintenance.id}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Badge text={selectedMaintenance.priority} variant={getPriorityVariant(selectedMaintenance.priority)} />
                        <Badge text={selectedMaintenance.status} variant={getStatusVariant(selectedMaintenance.status)} />
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>Description du problème</h4>
                        <p className="description-text">{selectedMaintenance.description}</p>
                    </div>
                    <div className="detail-card">
                        <h4>Attribution</h4>
                        <div className="info-group">
                            <i className="fa-solid fa-user-tie"></i>
                            <div>
                                <p className="info-label">Technicien</p>
                                <p className="info-value">{selectedMaintenance.technician ? `${selectedMaintenance.technician.first_name} ${selectedMaintenance.technician.last_name}` : 'Non assigné'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-actions">
                    <p style={{ color: '#A3AED0', fontSize: '13px', fontStyle: 'italic' }}>
                        Note: L'affectation des techniciens est gérée par les Agents.
                    </p>
                </div>
            </div>
        );
    };

    // --- Components for Modals (to avoid hook violations) ---

    const QuoteEditForm = ({ quote, onCancel, onSuccess, onToast, loadData }) => {
        const [editItems, setEditItems] = useState(quote.items || []);

        const updateQuantity = (idx, newQty) => {
            const items = [...editItems];
            items[idx].quantity = Math.max(1, parseInt(newQty) || 1);
            items[idx].total_price = items[idx].quantity * items[idx].unit_price;
            setEditItems(items);
        };

        const removeItem = (idx) => {
            setEditItems(editItems.filter((_, i) => i !== idx));
        };

        const calculateSubtotal = () => editItems.reduce((acc, item) => acc + (parseFloat(item.total_price) || 0), 0);

        const handleSubmit = async (e) => {
            e.preventDefault();
            const subtotal = calculateSubtotal();
            const vatRate = 18;
            const vatAmount = subtotal * (vatRate / 100);
            const totalAmount = subtotal + vatAmount;

            const data = {
                items: editItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.total_price
                })),
                subtotal,
                vat_amount: vatAmount,
                total_amount: totalAmount
            };

            try {
                await adminApi.updateQuote(quote.id, data);
                await loadData();
                onSuccess();
                onToast('Devis mis à jour avec succès', 'success');
            } catch (error) {
                console.error('Error updating quote:', error);
                onToast('Erreur lors de la mise à jour du devis', 'error');
            }
        };

        return (
            <div className="quote-edit-form">
                <form onSubmit={handleSubmit}>
                    <div className="items-list" style={{ marginBottom: '20px' }}>
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Prix Unitaire</th>
                                    <th style={{ width: '100px' }}>Quantité</th>
                                    <th>Total</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {editItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.product?.name}</td>
                                        <td>{parseFloat(item.unit_price).toLocaleString()} FCFA</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(idx, e.target.value)}
                                                className="form-control"
                                                style={{ padding: '5px' }}
                                            />
                                        </td>
                                        <td>{parseFloat(item.total_price).toLocaleString()} FCFA</td>
                                        <td>
                                            <button type="button" className="btn-icon btn-danger" onClick={() => removeItem(idx)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="quote-summary" style={{ background: '#F4F7FE', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Sous-total:</span>
                            <span style={{ fontWeight: '600' }}>{calculateSubtotal().toLocaleString()} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>TVA (18%):</span>
                            <span>{(calculateSubtotal() * 0.18).toLocaleString()} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#11047A', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E9EDF7' }}>
                            <span>Total TTC:</span>
                            <span>{(calculateSubtotal() * 1.18).toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>
                        <button type="submit" className="btn btn-primary" style={{ background: '#4318FF', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: '600' }}>
                            Sauvegarder les modifications
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const ProductForm = ({ product, onCancel, onSave }) => {
        const isEditing = !!product;
        const [imagePreview, setImagePreview] = useState(product?.image_url ? `${SERVER_URL}${product.image_url}` : null);
        const [selectedFile, setSelectedFile] = useState(null);

        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            if (selectedFile) {
                formData.set('image', selectedFile);
            }

            onSave(isEditing ? product.id : null, formData);
        };

        return (
            <div className="premium-form-container animate-fade-in shadow-none p-0 bg-transparent">
                <form onSubmit={handleSubmit}>
                    {/* Image Upload Section */}
                    <div className="form-section">
                        <label className="form-group-label">Image du produit</label>
                        {!imagePreview ? (
                            <div className="premium-upload-zone" onClick={() => document.getElementById('admin-product-image').click()}>
                                <input
                                    type="file"
                                    id="admin-product-image"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="upload-icon">
                                    <i className="fa-solid fa-cloud-upload-alt"></i>
                                </div>
                                <div className="upload-text">Cliquez pour télécharger une image</div>
                                <div className="upload-hint">JPG, PNG, WEBP (max 5MB)</div>
                            </div>
                        ) : (
                            <div className="premium-preview-container">
                                <img src={imagePreview} alt="Preview" />
                                <button
                                    className="premium-btn premium-btn-danger"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setImagePreview(null);
                                        setSelectedFile(null);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <i className="fa-solid fa-trash"></i> Retirer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="form-group-label">Nom du produit</label>
                                <input name="name" defaultValue={product?.name} required className="premium-input" placeholder="Ex: Vidéoprojecteur" />
                            </div>
                            <div className="form-group">
                                <label className="form-group-label">SKU</label>
                                <input name="sku" defaultValue={product?.sku} required className="premium-input" placeholder="Ex: PROD-001" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="form-group-label">Type de produit</label>
                                <select name="type" defaultValue={product?.type || 'product'} className="premium-input">
                                    <option value="product">Produit physique</option>
                                    <option value="service">Service / Forfait</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group-label">Prix de base (FCFA)</label>
                                <input name="base_price" type="number" step="0.01" defaultValue={product?.base_price} required className="premium-input" />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-group-label">Description</label>
                            <textarea name="description" defaultValue={product?.description} className="premium-textarea" rows="3" placeholder="Caractéristiques et détails..." />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-group-label">Quantité en stock</label>
                                <input name="stock_quantity" type="number" defaultValue={product?.stock_quantity || 0} required className="premium-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-group-label">Seuil d'alerte (Stock bas)</label>
                                <input name="min_threshold" type="number" defaultValue={product?.min_threshold || 5} required className="premium-input" />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onCancel} className="premium-btn premium-btn-secondary">Annuler</button>
                        <button type="submit" className="premium-btn premium-btn-primary">
                            <i className="fa-solid fa-check"></i>
                            {isEditing ? 'Mettre à jour' : 'Ajouter au catalogue'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const UserForm = ({ user, onCancel, onSave }) => {
        const isEditing = !!user;
        return (
            <div className="premium-form-container animate-fade-in shadow-none p-0 bg-transparent">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const userData = Object.fromEntries(formData.entries());
                    onSave(isEditing ? user.id : null, userData);
                }}>
                    <div className="form-section">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="form-group-label">Prénom</label>
                                <input name="first_name" defaultValue={user?.first_name} required className="premium-input" placeholder="Prénom" />
                            </div>
                            <div className="form-group">
                                <label className="form-group-label">Nom</label>
                                <input name="last_name" defaultValue={user?.last_name} required className="premium-input" placeholder="Nom" />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-group-label">Email Professionnel</label>
                            <input name="email" type="email" defaultValue={user?.email} required className="premium-input" placeholder="email@exemple.com" />
                        </div>

                        {!isEditing && (
                            <div className="form-group mb-4">
                                <label className="form-group-label">Mot de passe provisoire</label>
                                <input name="password" type="password" required className="premium-input" placeholder="••••••••" />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-group-label">Rôle / Accès</label>
                            <select name="role" defaultValue={user?.role || 'client'} className="premium-input">
                                <option value="client">Client</option>
                                <option value="admin">Administrateur</option>
                                <option value="agent">Agent</option>
                                <option value="technicien">Technicien</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions mt-4" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="premium-btn premium-btn-secondary" onClick={onCancel}>Annuler</button>
                        <button type="submit" className="premium-btn premium-btn-primary">
                            <i className="fa-solid fa-user-plus"></i>
                            {isEditing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const TechnicianForm = ({ onCancel, onSave }) => {
        const [skills, setSkills] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            data.skills = skills.split(',').map(s => s.trim()).filter(s => s);
            onSave(data);
        };

        return (
            <div className="premium-form-container animate-fade-in shadow-none p-0 bg-transparent">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-group mb-4">
                            <label className="form-group-label">Nom complet du technicien</label>
                            <input name="name" required className="premium-input" placeholder="ex: Jean Dupont" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="form-group-label">Coordonnées (Téléphone)</label>
                                <input name="phone" required className="premium-input" placeholder="+221 ..." />
                            </div>
                            <div className="form-group">
                                <label className="form-group-label">Email (Optionnel)</label>
                                <input name="email" type="email" className="premium-input" placeholder="email@exemple.com" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section border-0">
                        <div className="form-group">
                            <label className="form-group-label">Spécialités / Compétences</label>
                            <input
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="premium-input"
                                placeholder="Électricité, Climatisation, Plomberie..."
                            />
                            <small className="text-muted mt-2 d-block" style={{ fontSize: '11px', color: '#A3AED0' }}>
                                Séparez les compétences par des virgules.
                            </small>
                        </div>
                    </div>

                    <div className="form-actions mt-4" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="premium-btn premium-btn-secondary" onClick={onCancel}>Annuler</button>
                        <button type="submit" className="premium-btn premium-btn-primary">
                            <i className="fa-solid fa-save"></i>
                            Enregistrer le profil
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderProfile = () => {
        if (!user) return null;

        const sidebarStats = [
            { label: 'Utilisateurs', count: dashboardStats?.overview?.totalUsers || 0, icon: 'fa-users' },
            { label: 'Commandes', count: dashboardStats?.overview?.totalOrders || 0, icon: 'fa-shopping-cart' }
        ];

        return (
            <div className="profile-section fade-in" style={{ padding: '0 20px' }}>
                <button
                    className="btn btn-secondary mb-4"
                    onClick={() => setActiveModule(previousModule)}
                    style={{ borderRadius: '10px' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </button>

                <div className="profile-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                    {/* Profile Summary Card */}
                    <div className="profile-sidebar-card card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div className="profile-main-info">
                            <div className="large-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px', border: '4px solid #F4F7FE', overflow: 'hidden' }}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.first_name || 'Admin'}+${user.last_name || 'User'}&background=11047A&color=fff&size=200`}
                                    alt="Admin"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h2 style={{ fontSize: '24px', color: '#2B3674', fontWeight: '800' }}>
                                {user.first_name} {user.last_name}
                            </h2>
                            <p style={{ color: '#A3AED0', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</p>
                            <div className="badge-premium" style={{ background: '#E9EDF7', color: '#4318FF', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', marginTop: '10px', fontWeight: '700', fontSize: '13px' }}>
                                Administrateur Système
                            </div>
                        </div>

                        <div className="quick-stats-row" style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px', borderTop: '1px solid #F4F7FE', paddingTop: '20px' }}>
                            {sidebarStats.map((stat, idx) => (
                                <div key={idx} className="quick-stat">
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#2B3674' }}>{stat.count}</div>
                                    <div style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="profile-details-column">
                        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2B3674', margin: 0 }}>Informations Personnelles</h3>
                                {!editProfileMode && (
                                    <button className="btn btn-primary btn-sm" onClick={() => setEditProfileMode(true)}>
                                        <i className="fa-solid fa-edit"></i> Modifier
                                    </button>
                                )}
                            </div>

                            {editProfileMode ? (
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                        <div className="form-group">
                                            <label className="form-group-label">Prénom</label>
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={profileFormData.first_name}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-group-label">Nom</label>
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={profileFormData.last_name}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-group-label">Email</label>
                                            <input
                                                type="email"
                                                className="premium-input"
                                                value={profileFormData.email}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-group-label">Téléphone</label>
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={profileFormData.phone}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-success">Enregistrer</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditProfileMode(false)}>Annuler</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    <div className="detail-item">
                                        <label style={{ display: 'block', fontSize: '13px', color: '#A3AED0', marginBottom: '5px' }}>Nom Complet</label>
                                        <div style={{ fontWeight: '600', color: '#2B3674' }}>{user.first_name} {user.last_name}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label style={{ display: 'block', fontSize: '13px', color: '#A3AED0', marginBottom: '5px' }}>Email</label>
                                        <div style={{ fontWeight: '600', color: '#2B3674' }}>{user.email}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label style={{ display: 'block', fontSize: '13px', color: '#A3AED0', marginBottom: '5px' }}>Rôle</label>
                                        <div style={{ fontWeight: '600', color: '#2B3674', textTransform: 'capitalize' }}>{user.role}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label style={{ display: 'block', fontSize: '13px', color: '#A3AED0', marginBottom: '5px' }}>Téléphone</label>
                                        <div style={{ fontWeight: '600', color: '#2B3674' }}>{user.phone || 'Non renseigné'}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label style={{ display: 'block', fontSize: '13px', color: '#A3AED0', marginBottom: '5px' }}>Membre depuis</label>
                                        <div style={{ fontWeight: '600', color: '#2B3674' }}>{new Date(user.createdAt || user.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ padding: '30px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2B3674', marginBottom: '20px' }}>Sécurité</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F7FE', padding: '20px', borderRadius: '15px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#2B3674' }}>Mot de passe</div>
                                    <div style={{ fontSize: '13px', color: '#A3AED0' }}>Dernière modification : Il y a un mois</div>
                                </div>
                                <button className="btn btn-outline-primary" onClick={() => setShowPasswordModal(true)}>
                                    Changer le mot de passe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Modal Integration */}
                {showPasswordModal && (
                    <div className="modal-backdrop show" style={{ zIndex: 1200 }}></div>
                ) && (
                        <Modal
                            isOpen={true}
                            title="Changer le mot de passe"
                            onClose={() => setShowPasswordModal(false)}
                            size="small"
                        >
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group mb-3">
                                    <label className="form-group-label">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        className="premium-input"
                                        required
                                        value={passwordFormData.current_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, current_password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-group-label">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        className="premium-input"
                                        required
                                        value={passwordFormData.new_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-group-label">Confirmer le nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        className="premium-input"
                                        required
                                        value={passwordFormData.confirm_password}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary">Mettre à jour</button>
                                </div>
                            </form>
                        </Modal>
                    )}
            </div>
        );
    };

    // Render Functions


    const renderDashboard = () => (
        <div className="dashboard-container">
            {/* 1. Top Stats Row - Exactly 4 cards as in design */}
            <div className="stats-grid">
                <StatCard
                    icon="fa-solid fa-users"
                    label="Active Users"
                    value={dashboardStats?.overview?.totalUsers ?? '-'}
                    color="primary"
                />
                <StatCard
                    icon="fa-solid fa-shopping-cart"
                    label="Commandes"
                    value={dashboardStats?.overview?.totalOrders ?? '-'}
                    color="info" // Blue
                />
                <StatCard
                    icon="fa-solid fa-euro-sign"
                    label="Revenus du mois"
                    value={dashboardStats?.overview?.monthRevenue ? `${dashboardStats.overview.monthRevenue.toLocaleString()} €` : '0 €'}
                    color="success" // Green
                />
                <StatCard
                    icon="fa-solid fa-tools"
                    label="Maintenance"
                    value={dashboardStats?.overview?.activeMaintenance ?? '-'}
                    color="warning" // Yellow
                />
            </div>

            {/* 2. Main Content Grid - Full Width */}
            <div className="dashboard-sections-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '30px' }}>

                {/* Main Column: Tables/Lists */}
                <div className="dashboard-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Urgencies / Recent Orders Table */}
                    <div className="dashboard-section card">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2B3674' }}>Activités Récentes</h2>
                            <button className="btn-icon"><i className="fa-solid fa-ellipsis-h"></i></button>
                        </div>

                        <div className="recent-orders-list">
                            {(!dashboardStats?.recentOrders || dashboardStats.recentOrders.length === 0) ? (
                                <EmptyState
                                    icon="fa-solid fa-shopping-cart"
                                    message="Aucune commande récente"
                                />
                            ) : (
                                dashboardStats.recentOrders.map(order => (
                                    <div key={order.id} className="urgency-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(order.status) }}></div>
                                            <span style={{ fontWeight: '600', color: '#2B3674' }}>{order.order_number}</span>
                                            <span style={{ color: '#A3AED0', fontSize: '14px' }}>{new Date(order.createdAt || order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Badge text={order.status} variant={getStatusVariant(order.status)} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const filteredUsers = users.filter(user => {
            const matchesRole = !userFilter.role || user.role === userFilter.role;
            const matchesStatus = userFilter.status === '' ||
                (userFilter.status === 'active' ? user.is_active : !user.is_active);
            const matchesSearch = !userFilter.search ||
                user.first_name?.toLowerCase().includes(userFilter.search.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(userFilter.search.toLowerCase()) ||
                user.email?.toLowerCase().includes(userFilter.search.toLowerCase());
            return matchesRole && matchesStatus && matchesSearch;
        });

        const userColumns = [
            {
                label: 'Nom',
                field: 'name',
                render: (row) => (
                    <div className="user-cell">
                        <div className="user-avatar-small">
                            {row.first_name ? row.first_name[0] : 'U'}{row.last_name ? row.last_name[0] : ''}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{row.first_name} {row.last_name}</span>
                        </div>
                    </div>
                )
            },
            { label: 'Email', field: 'email' },
            { label: 'Rôle', field: 'role', render: (row) => <Badge text={row.role} variant="primary" /> },
            {
                label: 'Statut',
                field: 'is_active',
                render: (row) => <Badge text={row.is_active ? 'Actif' : 'Inactif'} variant={row.is_active ? 'success' : 'danger'} />
            },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        <ActionButton
                            icon="fa-solid fa-edit"
                            onClick={() => {
                                setEditingUser(row);
                                setShowUserModal(true);
                            }}
                            tooltip="Modifier"
                            variant="primary"
                        />
                        <ActionButton
                            icon={row.is_active ? 'fa-solid fa-ban' : 'fa-solid fa-check'}
                            onClick={() => handleToggleUserStatus(row.id)}
                            tooltip={row.is_active ? 'Désactiver' : 'Activer'}
                            variant={row.is_active ? 'warning' : 'success'}
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Utilisateurs</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredUsers.length} utilisateur(s) trouvé(s)
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => {
                            setEditingUser(null);
                            setShowUserModal(true);
                        }}>
                            <i className="fa-solid fa-plus"></i> Nouvel Utilisateur
                        </button>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                        <div className="toolbar-filters" style={{ display: 'flex', gap: '15px' }}>
                            <FilterDropdown
                                label="Rôle"
                                options={[
                                    { value: 'admin', label: 'Admin' },
                                    { value: 'agent', label: 'Agent' },
                                    { value: 'client', label: 'Client' },
                                    { value: 'technicien', label: 'Technicien' }
                                ]}
                                value={userFilter.role}
                                onChange={(value) => setUserFilter({ ...userFilter, role: value })}
                            />

                            <FilterDropdown
                                label="Statut"
                                options={[
                                    { value: 'active', label: 'Actif' },
                                    { value: 'inactive', label: 'Inactif' }
                                ]}
                                value={userFilter.status}
                                onChange={(value) => setUserFilter({ ...userFilter, status: value })}
                            />
                        </div>

                        {selectedUsers.length > 0 && (
                            <div className="bulk-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600' }}>{selectedUsers.length} sélectionné(s)</span>
                                <button onClick={() => handleBulkUserAction('activate')} className="btn btn-success btn-sm">
                                    <i className="fa-solid fa-check"></i>
                                </button>
                                <button onClick={() => handleBulkUserAction('deactivate')} className="btn btn-danger btn-sm">
                                    <i className="fa-solid fa-ban"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    <DataTable
                        columns={userColumns}
                        data={filteredUsers}
                        selectedRows={selectedUsers}
                        onSelectRow={(id) => {
                            setSelectedUsers(prev =>
                                prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
                            );
                        }}
                        loading={loading}
                        emptyMessage="Aucun utilisateur trouvé"
                    />
                </div>
            </div>
        );
    };

    const renderQuotes = () => {
        const filteredQuotes = quotes.filter(quote => {
            const matchesStatus = !quoteFilter.status || quote.status === quoteFilter.status;
            const matchesSearch = !quoteFilter.search ||
                quote.quote_number?.toLowerCase().includes(quoteFilter.search.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        const quoteColumns = [
            { label: 'N° Devis', field: 'quote_number' },
            {
                label: 'Client',
                render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'N/A'
            },
            { label: 'Montant', render: (row) => `${parseFloat(row.total_amount || 0).toLocaleString()} FCFA` },
            {
                label: 'Date', render: (row) => {
                    const dateVal = row.createdAt || row.created_at;
                    if (!dateVal) return 'N/A';
                    const date = new Date(dateVal);
                    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString();
                }
            },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton
                            icon="fa-solid fa-eye"
                            onClick={() => {
                                setSelectedQuote(row);
                                setShowQuoteModal(true);
                            }}
                            tooltip="Voir détails"
                            variant="primary"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header" style={{ borderBottom: '1px solid #E9EDF7', marginBottom: '20px', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <h2
                                onClick={() => setQuoteTab('devis')}
                                style={{
                                    cursor: 'pointer',
                                    color: quoteTab === 'devis' ? '#2B3674' : '#A3AED0',
                                    borderBottom: quoteTab === 'devis' ? '3px solid #4318FF' : 'none',
                                    paddingBottom: '10px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Gestion des Devis
                            </h2>
                            <h2
                                onClick={() => setQuoteTab('commandes')}
                                style={{
                                    cursor: 'pointer',
                                    color: quoteTab === 'commandes' ? '#2B3674' : '#A3AED0',
                                    borderBottom: quoteTab === 'commandes' ? '3px solid #4318FF' : 'none',
                                    paddingBottom: '10px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Gestion des Commandes
                            </h2>
                        </div>
                    </div>

                    {quoteTab === 'devis' ? (
                        <>
                            <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                                <FilterDropdown
                                    label="Statut"
                                    options={[
                                        { value: 'accepted', label: 'Accepté' },
                                        { value: 'refused', label: 'Refusé' }
                                    ]}
                                    value={quoteFilter.status}
                                    onChange={(value) => setQuoteFilter({ ...quoteFilter, status: value })}
                                />
                            </div>
                            <DataTable
                                columns={quoteColumns}
                                data={filteredQuotes}
                                loading={loading}
                                emptyMessage="Aucun devis trouvé"
                            />
                        </>
                    ) : (
                        renderOrdersContent()
                    )}
                </div>
            </div>
        );
    };

    // New helper to render only the orders content (without the full dashboard-container wrapper)
    const renderOrdersContent = () => {
        const filteredOrders = orders.filter(order => {
            const matchesStatus = !orderFilter.status || order.status === orderFilter.status;
            const matchesSearch = !orderFilter.search ||
                order.order_number?.toLowerCase().includes(orderFilter.search.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        const orderColumns = [
            { label: 'N° Commande', field: 'order_number' },
            {
                label: 'Client',
                render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'N/A'
            },
            { label: 'Montant', render: (row) => `${parseFloat(row.total_amount || 0).toLocaleString()} FCFA` },
            {
                label: 'Statut',
                render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} />
            },
            { label: 'Date', render: (row) => new Date(row.createdAt || row.created_at).toLocaleDateString() },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        {/* Validation & Progress */}
                        {row.status === 'pending' && (
                            <ActionButton
                                icon="fa-solid fa-check-circle"
                                onClick={() => handleValidateOrder(row.id)}
                                tooltip="Valider (Mettre en cours)"
                                variant="success"
                            />
                        )}

                        {(row.status === 'validated' || row.status === 'processing') && (
                            <ActionButton
                                icon="fa-solid fa-clipboard-check"
                                onClick={() => handleUpdateOrderStatus(row.id, 'delivered')}
                                tooltip="Terminer la commande"
                                variant="success"
                            />
                        )}

                        {row.status === 'shipped' && (
                            <ActionButton
                                icon="fa-solid fa-clipboard-check"
                                onClick={() => handleUpdateOrderStatus(row.id, 'delivered')}
                                tooltip="Marquer comme terminé"
                                variant="success"
                            />
                        )}

                        {/* Invoice & Cancel */}
                        {!row.invoice && row.status === 'delivered' && (
                            <ActionButton
                                icon="fa-solid fa-file-invoice"
                                onClick={() => handleCreateInvoice(row.id)}
                                tooltip="Créer facture"
                                variant="success"
                            />
                        )}
                        {row.status === 'pending' && (
                            <ActionButton
                                icon="fa-solid fa-times-circle"
                                onClick={() => handleUpdateOrderStatus(row.id, 'cancelled')}
                                tooltip="Annuler"
                                variant="danger"
                            />
                        )}

                        {/* View Details */}
                        <ActionButton
                            icon="fa-solid fa-eye"
                            onClick={() => {
                                setSelectedOrder(row);
                                setShowOrderModal(true);
                            }}
                            tooltip="Voir détails"
                            variant="primary"
                        />
                    </div>
                )
            }
        ];

        return (
            <>
                <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>

                    <FilterDropdown
                        label="Statut"
                        options={[
                            { value: 'pending', label: 'En attente' },
                            { value: 'processing', label: 'En cours' },
                            { value: 'delivered', label: 'Terminée' }
                        ]}
                        value={orderFilter.status}
                        onChange={(value) => setOrderFilter({ ...orderFilter, status: value })}
                    />
                </div>

                <DataTable
                    columns={orderColumns}
                    data={filteredOrders}
                    loading={loading}
                    emptyMessage="Aucune commande trouvée"
                />
            </>
        );
    };

    const renderInvoices = () => {
        const filteredInvoices = invoices.filter(invoice => {
            const matchesStatus = !invoiceFilter.status || invoice.status === invoiceFilter.status;
            const matchesSearch = !invoiceFilter.search ||
                invoice.invoice_number?.toLowerCase().includes(invoiceFilter.search.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        const invoiceColumns = [
            { label: 'N° Facture', field: 'invoice_number' },
            {
                label: 'Client',
                render: (row) => row.company?.name || 'N/A'
            },
            { label: 'Montant TTC', render: (row) => `${parseFloat(row.total_amount || 0).toLocaleString()} FCFA` },
            {
                label: 'Statut',
                render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} />
            },
            { label: 'Date émission', render: (row) => new Date(row.issue_date).toLocaleDateString() },
            { label: 'Échéance', render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : 'N/A' },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        {row.status !== 'paid' && (
                            <ActionButton
                                icon="fa-solid fa-check-circle"
                                onClick={() => handleUpdateInvoiceStatus(row.id, 'paid')}
                                tooltip="Marquer comme payé"
                                variant="success"
                            />
                        )}
                        <ActionButton
                            icon="fa-solid fa-eye"
                            onClick={() => {
                                setSelectedInvoice(row);
                                setShowInvoiceModal(true);
                            }}
                            tooltip="Voir détails"
                            variant="primary"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                {invoiceStats && (
                    <div className="stats-grid" style={{ marginBottom: '30px' }}>
                        <StatCard
                            icon="fa-solid fa-file-invoice-dollar"
                            value={invoiceStats.totalInvoices || 0}
                            label="Total Factures"
                            color="primary"
                        />
                        <StatCard
                            icon="fa-solid fa-check-circle"
                            value={invoiceStats.paidInvoices || 0}
                            label="Factures Payées"
                            color="success"
                        />
                        <StatCard
                            icon="fa-solid fa-exclamation-triangle"
                            value={invoiceStats.overdueInvoices || 0}
                            label="Factures En Retard"
                            color="danger"
                        />
                        <StatCard
                            icon="fa-solid fa-dollar-sign"
                            value={`${(invoiceStats.totalRevenue || 0).toLocaleString()} FCFA`}
                            label="Revenu Total"
                            color="warning"
                        />
                    </div>
                )}

                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Factures</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredInvoices.length} facture(s) trouvée(s)
                            </p>
                        </div>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>

                        <FilterDropdown
                            label="Statut"
                            options={[
                                { value: 'draft', label: 'Brouillon' },
                                { value: 'sent', label: 'Envoyée' },
                                { value: 'paid', label: 'Payée' },
                                { value: 'overdue', label: 'En retard' }
                            ]}
                            value={invoiceFilter.status}
                            onChange={(value) => setInvoiceFilter({ ...invoiceFilter, status: value })}
                        />
                    </div>

                    <DataTable
                        columns={invoiceColumns}
                        data={filteredInvoices}
                        loading={loading}
                        emptyMessage="Aucune facture trouvée"
                    />
                </div>
            </div>
        );
    };

    const renderAuditLogs = () => {
        const auditColumns = [
            { label: 'Date', render: (row) => new Date(row.createdAt || row.created_at).toLocaleString() },
            {
                label: 'Utilisateur',
                render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Système'
            },
            { label: 'Action', render: (row) => <Badge text={row.action} variant="info" /> },
            { label: 'Ressource', field: 'resource_type' },
            { label: 'Description', field: 'description' },
            { label: 'IP', field: 'ip_address' }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Journal des Connexions</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                Historique des actions administratives
                            </p>
                        </div>
                        <button className="btn-icon"><i className="fa-solid fa-download"></i></button>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                        <div className="toolbar-filters" style={{ display: 'flex', gap: '15px' }}>
                            <FilterDropdown
                                label="Action"
                                options={[
                                    { value: 'CREATE', label: 'Création' },
                                    { value: 'UPDATE', label: 'Modification' },
                                    { value: 'DELETE', label: 'Suppression' },
                                    { value: 'APPROVE', label: 'Approbation' },
                                    { value: 'REJECT', label: 'Rejet' }
                                ]}
                                value={auditFilter.action}
                                onChange={(value) => setAuditFilter({ ...auditFilter, action: value })}
                            />

                            <FilterDropdown
                                label="Ressource"
                                options={[
                                    { value: 'User', label: 'Utilisateur' },
                                    { value: 'Order', label: 'Commande' },
                                    { value: 'Quote', label: 'Devis' },
                                    { value: 'Invoice', label: 'Facture' }
                                ]}
                                value={auditFilter.resourceType}
                                onChange={(value) => setAuditFilter({ ...auditFilter, resourceType: value })}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={auditColumns}
                        data={auditLogs}
                        loading={loading}
                        emptyMessage="Aucun log trouvé"
                    />

                    {auditLogs.length > 0 && (
                        <div className="pagination-wrapper" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination
                                currentPage={auditPage}
                                totalPages={10}
                                onPageChange={setAuditPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };


    const renderOrders = () => {
        const filteredOrders = orders.filter(order => {
            const matchesStatus = !orderFilter.status || order.status === orderFilter.status;
            const matchesSearch = !orderFilter.search ||
                order.order_number?.toLowerCase().includes(orderFilter.search.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        const orderColumns = [
            { label: 'N° Commande', field: 'order_number' },
            {
                label: 'Client',
                render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'N/A'
            },
            { label: 'Montant', render: (row) => `${parseFloat(row.total_amount || 0).toLocaleString()} FCFA` },
            {
                label: 'Statut',
                render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} />
            },
            { label: 'Date', render: (row) => new Date(row.createdAt || row.created_at).toLocaleDateString() },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        <ActionButton
                            icon="fa-solid fa-eye"
                            onClick={() => {
                                console.log('Opening Order Modal for:', row.order_number);
                                setSelectedOrder(row);
                                setShowOrderModal(true);
                            }}
                            tooltip="Voir détails"
                            variant="primary"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Commandes</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredOrders.length} commande(s) trouvée(s)
                            </p>
                        </div>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>

                        <FilterDropdown
                            label="Statut"
                            options={[
                                { value: 'pending', label: 'En attente' },
                                { value: 'processing', label: 'En cours' },
                                { value: 'delivered', label: 'Terminée' }
                            ]}
                            value={orderFilter.status}
                            onChange={(value) => setOrderFilter({ ...orderFilter, status: value })}
                        />
                    </div>

                    <DataTable
                        columns={orderColumns}
                        data={filteredOrders}
                        loading={loading}
                        emptyMessage="Aucune commande trouvée"
                    />
                </div>
            </div>
        );
    };

    const renderProducts = () => {
        const filteredProducts = products.filter(product => {
            const matchesType = !productFilter.type || product.type === productFilter.type;
            const matchesSearch = !productFilter.search ||
                product.name?.toLowerCase().includes(productFilter.search.toLowerCase());
            return matchesType && matchesSearch;
        });

        const productColumns = [
            {
                label: 'Nom',
                field: 'name',
                render: (row) => (
                    <div className="product-cell">
                        <div className="product-icon-small">
                            <i className={row.type === 'service' ? 'fa-solid fa-concierge-bell' : 'fa-solid fa-box'}></i>
                        </div>
                        <span>{row.name}</span>
                    </div>
                )
            },
            { label: 'SKU', field: 'sku' },
            { label: 'Type', render: (row) => <Badge text={row.type} variant="info" /> },
            { label: 'Prix', render: (row) => `${parseFloat(row.base_price || 0).toLocaleString()} FCFA` },
            {
                label: 'Stock',
                render: (row) => (
                    <Badge
                        text={`${row.stock_quantity || 0} un.`}
                        variant={row.stock_quantity < 5 ? 'danger' : 'success'}
                    />
                )
            },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        <ActionButton
                            icon="fa-solid fa-edit"
                            onClick={() => {
                                setEditingProduct(row);
                                setShowProductModal(true);
                            }}
                            tooltip="Modifier"
                            variant="primary"
                        />
                        <ActionButton
                            icon="fa-solid fa-trash"
                            onClick={() => handleDeleteProduct(row.id)}
                            tooltip="Supprimer"
                            variant="danger"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Stocks</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredProducts.length} produit(s) en stock
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => {
                            setEditingProduct(null);
                            setShowProductModal(true);
                        }}>
                            <i className="fa-solid fa-plus"></i> Nouvel Article
                        </button>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>

                        <FilterDropdown
                            label="Type"
                            options={[
                                { value: 'product', label: 'Produit' },
                                { value: 'service', label: 'Service' }
                            ]}
                            value={productFilter.type}
                            onChange={(value) => setProductFilter({ ...productFilter, type: value })}
                        />
                    </div>

                    <DataTable
                        columns={productColumns}
                        data={filteredProducts}
                        loading={loading}
                        emptyMessage="Aucun produit trouvé"
                    />
                </div>
            </div>
        );
    };

    const renderMaintenance = () => {
        const filteredMaintenance = maintenanceRequests.filter(req => {
            const matchesStatus = !maintenanceFilter.status || req.status === maintenanceFilter.status;
            return matchesStatus;
        });

        const maintenanceColumns = [
            { label: 'ID', field: 'id' },
            {
                label: 'Client',
                render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'N/A'
            },
            { label: 'Priorité', render: (row) => <Badge text={row.priority} variant={getPriorityVariant(row.priority)} /> },
            { label: 'Statut', render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} /> },
            { label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        <ActionButton
                            icon="fa-solid fa-eye"
                            onClick={() => {
                                console.log('Opening Maintenance Modal for:', row.id);
                                setSelectedMaintenance(row);
                                setShowMaintenanceModal(true);
                            }}
                            tooltip="Voir détails"
                            variant="primary"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Demandes de Maintenance</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredMaintenance.length} demande(s) trouvée(s)
                            </p>
                        </div>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px' }}>
                        <FilterDropdown
                            label="Statut"
                            options={[
                                { value: 'new', label: 'Nouvelle' },
                                { value: 'assigned', label: 'Assignée' },
                                { value: 'in_progress', label: 'En cours' },
                                { value: 'completed', label: 'Terminée' }
                            ]}
                            value={maintenanceFilter.status}
                            onChange={(value) => setMaintenanceFilter({ ...maintenanceFilter, status: value })}
                        />
                    </div>

                    <DataTable
                        columns={maintenanceColumns}
                        data={filteredMaintenance}
                        loading={loading}
                        emptyMessage="Aucune demande trouvée"
                    />
                </div>
            </div>
        );
    };

    const handleDeleteTechnician = async (techId) => {
        showConfirm({
            title: 'Supprimer le technicien',
            message: 'Êtes-vous sûr de vouloir supprimer ce technicien ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteTechnician(techId);
                    await loadTechnicians();
                    addToast('Technicien supprimé', 'success');
                } catch (error) {
                    addToast('Erreur lors de la suppression', 'error');
                }
            }
        });
    };

    const renderTechnicians = () => {
        const techColumns = [
            { label: 'Nom', field: 'name' },
            { label: 'Téléphone', field: 'phone' },
            { label: 'Email', field: 'email' },
            {
                label: 'Compétences',
                render: (row) => (row.skills || []).map(s => <Badge key={s} text={s} variant="info" style={{ marginRight: '4px' }} />)
            },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        <ActionButton
                            icon="fa-solid fa-trash"
                            onClick={() => handleDeleteTechnician(row.id)}
                            tooltip="Supprimer"
                            variant="danger"
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Techniciens Standalone</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                Techniciens externes sans compte plateforme
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowTechnicianModal(true)}>
                            <i className="fa-solid fa-plus"></i> Nouveau Technicien
                        </button>
                    </div>

                    <DataTable
                        columns={techColumns}
                        data={technicians}
                        loading={loading}
                        emptyMessage="Aucun technicien trouvé"
                    />
                </div>
            </div>
        );
    };

    const getStatusVariant = (status) => {
        const variants = {
            pending: 'warning',
            accepted: 'success',
            refused: 'danger',
            validated: 'info',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            completed: 'success',
            cancelled: 'danger',
            paid: 'success',
            draft: 'default',
            sent: 'info',
            overdue: 'danger',
            new: 'warning',
            assigned: 'info',
            in_progress: 'primary'
        };
        return variants[status] || 'default';
    };

    const getPriorityVariant = (priority) => {
        const variants = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            urgent: 'danger'
        };
        return variants[priority] || 'default';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#FFB547', // Warning/Orange
            accepted: '#05CD99', // Success/Green
            refused: '#EE5D50', // Danger/Red
            validated: '#4318FF', // Info/Blue
            processing: '#4318FF',
            shipped: '#4318FF',
            delivered: '#05CD99',
            completed: '#05CD99',
            cancelled: '#EE5D50',
            paid: '#05CD99',
            new: '#FFB547',
            assigned: '#4318FF',
            in_progress: '#4318FF'
        };
        return colors[status] || '#A3AED0'; // Default Gray
    };

    // Helper to get title based on active module
    const getPageTitle = () => {
        switch (activeModule) {
            case 'dashboard': return 'Dashboard Admin';
            case 'users': return 'Gestion des Utilisateurs';
            case 'quotes': return 'Gestion des Devis';
            case 'invoices': return 'Gestion des Factures';
            case 'audit': return 'Journal des Connexions';
            case 'orders': return 'Gestion des Commandes';
            case 'products': return 'Gestion des Stocks';
            case 'maintenance': return 'Interventions Maintenance';
            case 'technicians': return 'Gestion des Techniciens';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="sidebar-logo">
                        <Logo light={true} />
                    </div>
                    <div className="admin-badge-sidebar">Interface Administrateur</div>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeModule === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveModule('dashboard')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <span className="nav-label">Tableau de bord</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveModule('users')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <span className="nav-label">Utilisateurs</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'quotes' ? 'active' : ''}`}
                        onClick={() => setActiveModule('quotes')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-boxes-stacked"></i>
                        </div>
                        <span className="nav-label">Logistique</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'invoices' ? 'active' : ''}`}
                        onClick={() => setActiveModule('invoices')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                        <span className="nav-label">Facturation</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveModule('products')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-box-open"></i>
                        </div>
                        <span className="nav-label">Gestion Stocks</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setActiveModule('maintenance')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-screwdriver-wrench"></i>
                        </div>
                        <span className="nav-label">Interventions</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'technicians' ? 'active' : ''}`}
                        onClick={() => setActiveModule('technicians')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-user-wrench"></i>
                        </div>
                        <span className="nav-label">Techniciens</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'audit' ? 'active' : ''}`}
                        onClick={() => setActiveModule('audit')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span className="nav-label">Sécurité & Audit</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeModule === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveModule('profile')}
                    >
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <span className="nav-label">Mon Profil</span>
                        <span className="nav-arrow">›</span>
                    </button>

                    <div style={{ marginTop: 'auto', paddingBottom: 'var(--spacing-xl)' }}>
                        <button
                            className="admin-nav-item"
                            onClick={handleLogout}
                            style={{ color: '#FFBABA', background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <div className="nav-icon-wrapper">
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <span className="nav-label">Déconnexion</span>
                            <span className="nav-arrow">›</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Pages / {getPageTitle()}</h1>
                        <h2>{getPageTitle()}</h2>
                    </div>

                    <div className="header-right">
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveModule('profile')}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#2B3674', lineHeight: '1.2' }}>
                                    {user?.first_name || 'Admin'} {user?.last_name || 'User'}
                                </span>
                                <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '500' }}>
                                    {user?.role === 'admin' ? 'Administrateur' : (user?.role || 'Utilisateur')}
                                </span>
                            </div>
                            <div className="profile-image" style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)' }}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.first_name || 'Admin'}+${user?.last_name || 'User'}&background=11047A&color=fff&size=128`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Module Content */}
                <div className="module-content">
                    {loading ? (
                        <div className="loading-container">
                            <LoadingSpinner />
                            <p>Chargement des données...</p>
                        </div>
                    ) : (
                        <>
                            {activeModule === 'dashboard' && renderDashboard()}
                            {activeModule === 'users' && renderUsers()}
                            {activeModule === 'quotes' && renderQuotes()}
                            {activeModule === 'invoices' && renderInvoices()}
                            {activeModule === 'audit' && renderAuditLogs()}

                            {activeModule === 'orders' && renderOrders()}
                            {activeModule === 'products' && renderProducts()}
                            {activeModule === 'maintenance' && renderMaintenance()}
                            {activeModule === 'technicians' && renderTechnicians()}
                            {activeModule === 'profile' && renderProfile()}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showUserModal && (
                <Modal
                    isOpen={true}
                    title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                    onClose={() => {
                        setShowUserModal(false);
                        setEditingUser(null);
                    }}
                    size="medium"
                >
                    <UserForm
                        user={editingUser}
                        onCancel={() => {
                            setShowUserModal(false);
                            setEditingUser(null);
                        }}
                        onSave={async (userId, userData) => {
                            try {
                                if (userId) {
                                    await adminApi.updateUser(userId, userData);
                                    addToast('Utilisateur mis à jour', 'success');
                                } else {
                                    await adminApi.createUser(userData);
                                    addToast('Utilisateur créé avec succès', 'success');
                                }
                                await loadUsers();
                                setShowUserModal(false);
                            } catch (error) {
                                console.error('User form error:', error);
                                addToast(error.response?.data?.message || 'Erreur lors de l\'opération', 'error');
                            }
                        }}
                    />
                </Modal>
            )}

            {showProductModal && (
                <Modal
                    isOpen={true}
                    title={editingProduct ? "Modifier l'article" : "Nouvel article"}
                    onClose={() => {
                        setShowProductModal(false);
                        setEditingProduct(null);
                    }}
                    size="medium"
                >
                    <ProductForm
                        product={editingProduct}
                        onCancel={() => {
                            setShowProductModal(false);
                            setEditingProduct(null);
                        }}
                        onSave={(productId, productData) => {
                            if (productId) {
                                handleEditProduct(productId, productData);
                            } else {
                                handleCreateProduct(productData);
                            }
                        }}
                    />
                </Modal>
            )}

            {showQuoteEditModal && selectedQuote && (
                <Modal
                    isOpen={true}
                    title={`Modifier le devis #${selectedQuote.quote_number}`}
                    onClose={() => {
                        setShowQuoteEditModal(false);
                        setSelectedQuote(null);
                    }}
                    size="large"
                >
                    <QuoteEditForm
                        quote={selectedQuote}
                        onCancel={() => {
                            setShowQuoteEditModal(false);
                            setSelectedQuote(null);
                        }}
                        onSuccess={() => setShowQuoteEditModal(false)}
                        onToast={addToast}
                        loadData={loadQuotes}
                    />
                </Modal>
            )}

            {showQuoteModal && selectedQuote && (
                <Modal
                    isOpen={true}
                    title={`Détails du devis #${selectedQuote.quote_number}`}
                    onClose={() => {
                        setShowQuoteModal(false);
                        setSelectedQuote(null);
                    }}
                    size="large"
                >
                    {renderQuoteDetails()}
                </Modal>
            )}
            {showInvoiceModal && selectedInvoice && (
                <Modal
                    isOpen={true}
                    title={`Facture #${selectedInvoice.invoice_number}`}
                    onClose={() => {
                        setShowInvoiceModal(false);
                        setSelectedInvoice(null);
                    }}
                    size="large"
                >
                    {renderInvoiceDetails()}
                </Modal>
            )}

            {showOrderModal && selectedOrder && (
                <Modal
                    isOpen={true}
                    title={`Détails de la commande #${selectedOrder.order_number}`}
                    onClose={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                    }}
                    size="large"
                >
                    {renderOrderDetails()}
                </Modal>
            )}

            {showMaintenanceModal && selectedMaintenance && (
                <Modal
                    isOpen={true}
                    title={`Intervention #${selectedMaintenance.id}`}
                    onClose={() => {
                        setShowMaintenanceModal(false);
                        setSelectedMaintenance(null);
                    }}
                    size="large"
                >
                    {renderMaintenanceDetails()}
                </Modal>
            )}

            {showTechnicianModal && (
                <Modal
                    isOpen={true}
                    title="Nouveau Technicien Standalone"
                    onClose={() => setShowTechnicianModal(false)}
                    size="medium"
                >
                    <TechnicianForm
                        onCancel={() => setShowTechnicianModal(false)}
                        onSave={async (techData) => {
                            try {
                                await adminApi.createTechnician(techData);
                                await loadTechnicians();
                                setShowTechnicianModal(false);
                                addToast('Technicien créé avec succès', 'success');
                            } catch (error) {
                                addToast(error.response?.data?.message || 'Erreur lors de la création', 'error');
                            }
                        }}
                    />
                </Modal>
            )}

            {/* Notification & Confirmation Components */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
                requireInput={confirmModal.requireInput}
                inputLabel={confirmModal.inputLabel}
                inputPlaceholder={confirmModal.inputPlaceholder}
            />
        </div>
    );
}

export default AdminDashboardPage;
