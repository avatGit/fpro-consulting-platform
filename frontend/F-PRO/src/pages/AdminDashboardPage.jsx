import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import adminApi from '../services/adminApi';
import Logo from '../components/Logo';
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
import './AdminReset.css';
import './AdminDashboardNew.css';
import '../components/admin/AdminComponents.css';

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

    // Products State
    const [products, setProducts] = useState([]);
    const [productFilter, setProductFilter] = useState({ type: '', search: '' });

    // Maintenance State
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [maintenanceFilter, setMaintenanceFilter] = useState({ status: '', search: '' });

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
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
                    await loadQuotes();
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
                case 'products':
                    await loadProducts();
                    break;
                case 'maintenance':
                    await loadMaintenance();
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
        const response = await adminApi.getAllUsers();
        setUsers(response.data);
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
        const response = await adminApi.getAuditLogs({ ...auditFilter, page: auditPage, limit: 20 });
        setAuditLogs(response.data.logs || response.data);
    };

    const loadSettings = async () => {
        const response = await adminApi.getSettings(settingsCategory);
        setSettings(response.data);
    };

    const loadOrders = async () => {
        const response = await adminApi.getAllOrders(orderFilter);
        setOrders(response.data);
    };

    const loadProducts = async () => {
        const response = await api.get('/products');
        setProducts(response.data.data);
    };

    const loadMaintenance = async () => {
        const response = await adminApi.getAllMaintenanceRequests(maintenanceFilter);
        setMaintenanceRequests(response.data);
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
        alert(`DEBUG: handleApproveQuote called with ID: ${quoteId}`);
        try {
            await adminApi.approveQuote(quoteId);
            await loadQuotes();
            alert('Devis approuvé');
        } catch (error) {
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleRejectQuote = async (quoteId) => {
        const reason = prompt('Raison du rejet:');
        if (!reason) return;
        try {
            await adminApi.rejectQuote(quoteId, reason);
            await loadQuotes();
            alert('Devis rejeté');
        } catch (error) {
            alert('Erreur lors du rejet');
        }
    };

    const handleCreateInvoice = async (orderId) => {
        try {
            await adminApi.createInvoice(orderId);
            await loadInvoices();
            alert('Facture créée avec succès');
        } catch (error) {
            alert('Erreur lors de la création de la facture');
        }
    };

    const handleUpdateInvoiceStatus = async (invoiceId, status) => {
        try {
            await adminApi.updateInvoiceStatus(invoiceId, status);
            await loadInvoices();
            alert('Statut mis à jour');
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleToggleUserStatus = async (userId) => {
        try {
            await adminApi.toggleUserStatus(userId);
            await loadUsers();
        } catch (error) {
            alert('Erreur lors du changement de statut');
        }
    };

    const handleValidateOrder = async (orderId) => {
        console.log('Attempting to validate order:', orderId);
        try {
            // Confirm action
            if (!window.confirm('Valider cette commande ? Cela déduira les produits du stock.')) return;
            await adminApi.validateOrder(orderId);
            console.log('Order validated successfully');
            await loadOrders();
            await loadDashboardStats(); // Update stats too
            alert('Commande validée avec succès');
        } catch (error) {
            console.error('Validation error:', error);
            alert('Erreur lors de la validation: ' + (error.response?.data?.message || 'Erreur inconnue'));
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        console.log('Attempting to update status:', orderId, status);
        try {
            await adminApi.updateOrderStatus(orderId, status);
            console.log('Status updated successfully');
            await loadOrders();
            await loadDashboardStats();
        } catch (error) {
            console.error('Status update error:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleAutoAssignTechnician = async (requestId) => {
        console.log('Attempting to auto-assign technician for request:', requestId);
        try {
            await adminApi.autoAssignTechnician(requestId);
            console.log('Technician assigned successfully');
            await loadMaintenance();
            await loadDashboardStats();
            alert('Technicien assigné automatiquement');
        } catch (error) {
            console.error('Auto-assign error:', error);
            alert('Erreur: ' + (error.response?.data?.message || 'Aucun technicien disponible'));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Render Functions


    const renderDashboard = () => (
        <div className="dashboard-container">
            {/* 1. Top Stats Row - Exactly 4 cards as in design */}
            <div className="stats-grid">
                <StatCard
                    icon="fas fa-users"
                    label="Active Users"
                    value={dashboardStats?.overview?.totalUsers ?? '-'}
                    trend="+12%"
                    trendUp={true}
                    color="primary"
                />
                <StatCard
                    icon="fas fa-shopping-cart"
                    label="Commandes"
                    value={dashboardStats?.overview?.totalOrders ?? '-'}
                    trend="+5%"
                    trendUp={true}
                    color="info" // Blue
                />
                <StatCard
                    icon="fas fa-euro-sign"
                    label="Revenus du mois"
                    value={dashboardStats?.overview?.monthRevenue ? `${dashboardStats.overview.monthRevenue.toLocaleString()} €` : '0 €'}
                    trend="+8%"
                    trendUp={true}
                    color="success" // Green
                />
                <StatCard
                    icon="fas fa-tools"
                    label="Maintenance"
                    value={dashboardStats?.overview?.activeMaintenance ?? '-'}
                    trend="-2"
                    trendUp={false}
                    color="warning" // Yellow
                />
            </div>

            {/* 2. Main Content Grid - Split 2/3 and 1/3 */}
            <div className="dashboard-sections-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>

                {/* Left Column: Tables/Lists */}
                <div className="dashboard-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Urgencies / Recent Orders Table */}
                    <div className="dashboard-section card">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2B3674' }}>Urgences</h2>
                            <button className="btn-icon"><i className="fas fa-ellipsis-h"></i></button>
                        </div>

                        <div className="recent-orders-list">
                            {(!dashboardStats?.recentOrders || dashboardStats.recentOrders.length === 0) ? (
                                <EmptyState
                                    icon="fas fa-shopping-cart"
                                    message="Aucune commande récente"
                                />
                            ) : (
                                dashboardStats.recentOrders.map(order => (
                                    <div key={order.id} className="urgency-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(order.status) }}></div>
                                            <span style={{ fontWeight: '600', color: '#2B3674' }}>{order.order_number}</span>
                                            <span style={{ color: '#A3AED0', fontSize: '14px' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Badge text={order.status} variant={getStatusVariant(order.status)} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="dashboard-section card">
                        <div className="section-header" style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2B3674' }}>Dernières Activités</h2>
                        </div>
                        <div className="activity-list">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: '#A3AED0', fontSize: '12px', textAlign: 'left' }}>
                                        <th style={{ paddingBottom: '10px' }}>Description</th>
                                        <th style={{ paddingBottom: '10px' }}>Statut</th>
                                        <th style={{ paddingBottom: '10px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLogs.slice(0, 3).map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '15px 0', fontWeight: '600', color: '#2B3674' }}>{log.action}</td>
                                            <td style={{ padding: '15px 0' }}><Badge text="Complet" variant="success" /></td>
                                            <td style={{ padding: '15px 0', color: '#A3AED0' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Charts */}
                <div className="dashboard-side-column">
                    <div className="dashboard-section card" style={{ height: '100%' }}>
                        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2B3674' }}>Statistiques Globales</h2>
                            <button className="btn-icon"><i className="fas fa-chart-bar"></i></button>
                        </div>
                        <div className="chart-container" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
                            {/* CSS Bar Chart */}
                            {[40, 70, 50, 80, 60, 90, 45].map((h, i) => (
                                <div key={i} style={{ width: '12%', height: `${h}%`, background: '#4318FF', borderRadius: '5px' }}></div>
                            ))}
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
                            icon="fas fa-edit"
                            onClick={() => {
                                setEditingUser(row);
                                setShowUserModal(true);
                            }}
                            tooltip="Modifier"
                            variant="primary"
                        />
                        <ActionButton
                            icon={row.is_active ? 'fas fa-ban' : 'fas fa-check'}
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
                            <i className="fas fa-plus"></i> Nouvel Utilisateur
                        </button>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={userFilter.search}
                                onChange={(value) => setUserFilter({ ...userFilter, search: value })}
                                placeholder="Rechercher par nom, email..."
                            />
                        </div>

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
                                    <i className="fas fa-check"></i>
                                </button>
                                <button onClick={() => handleBulkUserAction('deactivate')} className="btn btn-danger btn-sm">
                                    <i className="fas fa-ban"></i>
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
                label: 'Statut',
                render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} />
            },
            { label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
                label: 'Actions',
                render: (row) => {
                    console.log('Rendering actions for quote:', row.id, 'status:', row.status);
                    return (
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <ActionButton
                                icon="fas fa-eye"
                                onClick={() => setSelectedQuote(row)}
                                tooltip="Voir détails"
                                variant="primary"
                            />
                            {row.status === 'draft' && (
                                <ActionButton
                                    icon="fas fa-edit"
                                    onClick={() => alert('Edit feature coming soon')}
                                    tooltip="Modifier"
                                    variant="warning"
                                />
                            )}
                            {row.status === 'pending' && (
                                <>
                                    <ActionButton
                                        icon="fas fa-check"
                                        onClick={() => handleApproveQuote(row.id)}
                                        tooltip="Approuver"
                                        variant="success"
                                    />
                                    <ActionButton
                                        icon="fas fa-times"
                                        onClick={() => handleRejectQuote(row.id)}
                                        tooltip="Rejeter"
                                        variant="danger"
                                    />
                                </>
                            )}
                        </div>
                    );
                }
            }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Gestion des Devis</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                {filteredQuotes.length} devis trouvé(s)
                            </p>
                        </div>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={quoteFilter.search}
                                onChange={(value) => setQuoteFilter({ ...quoteFilter, search: value })}
                                placeholder="Rechercher par numéro..."
                            />
                        </div>

                        <FilterDropdown
                            label="Statut"
                            options={[
                                { value: 'pending', label: 'En attente' },
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
                </div>
            </div>
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
                                icon="fas fa-check-circle"
                                onClick={() => handleUpdateInvoiceStatus(row.id, 'paid')}
                                tooltip="Marquer comme payé"
                                variant="success"
                            />
                        )}
                        <ActionButton
                            icon="fas fa-eye"
                            onClick={() => setSelectedInvoice(row)}
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
                            icon="fas fa-file-invoice-dollar"
                            value={invoiceStats.totalInvoices || 0}
                            label="Total Factures"
                            color="primary"
                        />
                        <StatCard
                            icon="fas fa-check-circle"
                            value={invoiceStats.paidInvoices || 0}
                            label="Factures Payées"
                            color="success"
                        />
                        <StatCard
                            icon="fas fa-exclamation-triangle"
                            value={invoiceStats.overdueInvoices || 0}
                            label="Factures En Retard"
                            color="danger"
                        />
                        <StatCard
                            icon="fas fa-dollar-sign"
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
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={invoiceFilter.search}
                                onChange={(value) => setInvoiceFilter({ ...invoiceFilter, search: value })}
                                placeholder="Rechercher une facture..."
                            />
                        </div>

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
            { label: 'Date', render: (row) => new Date(row.created_at).toLocaleString() },
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
                        <button className="btn-icon"><i className="fas fa-download"></i></button>
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={auditFilter.search}
                                onChange={(value) => setAuditFilter({ ...auditFilter, search: value })}
                                placeholder="Rechercher par description, utilisateur..."
                            />
                        </div>

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

    const renderSettings = () => {
        const groupedSettings = settings.reduce((acc, setting) => {
            const category = setting.category || 'general';
            if (!acc[category]) acc[category] = [];
            acc[category].push(setting);
            return acc;
        }, {});

        return (
            <div className="dashboard-container">
                <div className="dashboard-section card">
                    <div className="section-header">
                        <div>
                            <h2>Paramètres Système</h2>
                            <p style={{ color: '#A3AED0', fontSize: '14px', marginTop: '5px' }}>
                                Configuration de la plateforme
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => adminApi.initDefaultSettings()}>
                            <i className="fas fa-sync"></i> Initialiser Paramètres
                        </button>
                    </div>

                    <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                            <div key={category} className="settings-category card" style={{ padding: '20px', border: '1px solid #F4F7FE', borderRadius: '15px' }}>
                                <h3 style={{ textTransform: 'capitalize', color: '#2B3674', marginBottom: '15px', borderBottom: '1px solid #F4F7FE', paddingBottom: '10px' }}>
                                    {category}
                                </h3>
                                <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {categorySettings.map((setting) => (
                                        <div key={setting.id} className="setting-item">
                                            <div className="setting-info" style={{ marginBottom: '5px' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2B3674' }}>{setting.key}</h4>
                                                <p style={{ fontSize: '12px', color: '#A3AED0' }}>{setting.description}</p>
                                            </div>
                                            <div className="setting-value">
                                                <input
                                                    type={setting.type === 'number' ? 'number' : 'text'}
                                                    value={setting.value}
                                                    className="form-control"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E9EDF7', background: '#F4F7FE' }}
                                                    onChange={(e) => {
                                                        const newSettings = settings.map(s =>
                                                            s.id === setting.id ? { ...s, value: e.target.value } : s
                                                        );
                                                        setSettings(newSettings);
                                                    }}
                                                    onBlur={() => adminApi.updateSetting(setting.key, setting.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
            { label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
                label: 'Actions',
                render: (row) => (
                    <div className="action-buttons">
                        {/* Validation */}
                        {row.status === 'pending' && (
                            <ActionButton
                                icon="fas fa-check-circle"
                                onClick={() => handleValidateOrder(row.id)}
                                tooltip="Valider la commande"
                                variant="success"
                            />
                        )}

                        {/* Processing Flows */}
                        {row.status === 'validated' && (
                            <ActionButton
                                icon="fas fa-box-open"
                                onClick={() => handleUpdateOrderStatus(row.id, 'processing')}
                                tooltip="Mettre en traitement"
                                variant="warning"
                            />
                        )}
                        {row.status === 'processing' && (
                            <ActionButton
                                icon="fas fa-truck"
                                onClick={() => handleUpdateOrderStatus(row.id, 'shipped')}
                                tooltip="Expédier"
                                variant="info"
                            />
                        )}
                        {row.status === 'shipped' && (
                            <ActionButton
                                icon="fas fa-clipboard-check"
                                onClick={() => handleUpdateOrderStatus(row.id, 'delivered')}
                                tooltip="Marquer comme livré"
                                variant="success"
                            />
                        )}

                        {/* Invoice & Cancel */}
                        {!row.invoice && row.status === 'delivered' && (
                            <ActionButton
                                icon="fas fa-file-invoice"
                                onClick={() => handleCreateInvoice(row.id)}
                                tooltip="Créer facture"
                                variant="success"
                            />
                        )}
                        {row.status === 'pending' && (
                            <ActionButton
                                icon="fas fa-times-circle"
                                onClick={() => handleUpdateOrderStatus(row.id, 'cancelled')}
                                tooltip="Annuler"
                                variant="danger"
                            />
                        )}

                        {/* View Details */}
                        <ActionButton
                            icon="fas fa-eye"
                            onClick={() => console.log('View order', row)}
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
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={orderFilter.search}
                                onChange={(value) => setOrderFilter({ ...orderFilter, search: value })}
                                placeholder="Rechercher par numéro..."
                            />
                        </div>

                        <FilterDropdown
                            label="Statut"
                            options={[
                                { value: 'pending', label: 'En attente' },
                                { value: 'validated', label: 'Validée' },
                                { value: 'processing', label: 'En cours' },
                                { value: 'shipped', label: 'Expédiée' },
                                { value: 'delivered', label: 'Livrée' }
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
                            <i className={row.type === 'service' ? 'fas fa-concierge-bell' : 'fas fa-box'}></i>
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
                        text={`${row.stock_quantity} un.`}
                        variant={row.stock_quantity < 5 ? 'danger' : 'success'}
                    />
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
                    </div>

                    <div className="module-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={productFilter.search}
                                onChange={(value) => setProductFilter({ ...productFilter, search: value })}
                                placeholder="Rechercher par nom, SKU..."
                            />
                        </div>

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
            {
                label: 'Statut',
                render: (row) => <Badge text={row.status} variant={getStatusVariant(row.status)} />
            },
            { label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() }
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
            case 'settings': return 'Paramètres';
            case 'orders': return 'Gestion des Commandes';
            case 'products': return 'Gestion des Stocks';
            case 'maintenance': return 'Maintenance';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>F-PRO <span style={{ fontWeight: 300 }}>CONSULTING</span></h2>
                </div>

                <div className="sidebar-nav">
                    <button
                        className={activeModule === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveModule('dashboard')}
                    >
                        <i className="fas fa-th-large"></i>
                        <span>Dashboard Admin</span>
                    </button>

                    <button
                        className={activeModule === 'users' ? 'active' : ''}
                        onClick={() => setActiveModule('users')}
                    >
                        <i className="fas fa-users"></i>
                        <span>Utilisateurs</span>
                    </button>

                    <button
                        className={activeModule === 'quotes' ? 'active' : ''}
                        onClick={() => setActiveModule('quotes')}
                    >
                        <i className="fas fa-file-invoice-dollar"></i>
                        <span>Commandes & Devis</span>
                    </button>

                    <button
                        className={activeModule === 'products' ? 'active' : ''}
                        onClick={() => setActiveModule('products')}
                    >
                        <i className="fas fa-box"></i>
                        <span>Stocks</span>
                    </button>

                    <button
                        className={activeModule === 'maintenance' ? 'active' : ''}
                        onClick={() => setActiveModule('maintenance')}
                    >
                        <i className="fas fa-tools"></i>
                        <span>Techniciens</span>
                    </button>

                    <button
                        className={activeModule === 'audit' ? 'active' : ''}
                        onClick={() => setActiveModule('audit')}
                    >
                        <i className="fas fa-clipboard-list"></i>
                        <span>Rapports</span>
                    </button>

                    <button
                        className={activeModule === 'settings' ? 'active' : ''}
                        onClick={() => setActiveModule('settings')}
                    >
                        <i className="fas fa-cog"></i>
                        <span>Paramètres</span>
                    </button>
                </div>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Se déconnecter</span>
                    </button>
                </div>
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
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Rechercher..." />
                        </div>

                        <button className="notification-btn">
                            <i className="far fa-bell"></i>
                            <span className="notification-badge"></span>
                        </button>

                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
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
                            {activeModule === 'settings' && renderSettings()}
                            {activeModule === 'orders' && renderOrders()}
                            {activeModule === 'products' && renderProducts()}
                            {activeModule === 'maintenance' && renderMaintenance()}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showUserModal && (
                <Modal
                    title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                    onClose={() => {
                        setShowUserModal(false);
                        setEditingUser(null);
                    }}
                    size="medium"
                >
                    {renderUserForm()}
                </Modal>
            )}

            {/* Other Modals... (Keeping existing modal logic) */}
            {showQuoteModal && selectedQuote && (
                <Modal
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
        </div>
    );
}

export default AdminDashboardPage;
