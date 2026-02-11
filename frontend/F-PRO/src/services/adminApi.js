import api from './api';

/**
 * Admin API Service
 * Handles all admin-specific API calls
 */

// ============================================
// DASHBOARD & STATISTICS
// ============================================

export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
};

export const getActivityLogs = async (limit = 20) => {
    const response = await api.get('/admin/activity', { params: { limit } });
    return response.data;
};

export const getSystemHealth = async () => {
    const response = await api.get('/admin/system/health');
    return response.data;
};

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};

export const toggleUserStatus = async (userId) => {
    const response = await api.patch(`/users/${userId}/toggle-status`);
    return response.data;
};

export const bulkUpdateUsers = async (userIds, action, value = null) => {
    const response = await api.post('/users/bulk-update', { userIds, action, value });
    return response.data;
};

export const getUserStats = async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

// ============================================
// QUOTE MANAGEMENT
// ============================================

export const getAllQuotes = async (filters = {}) => {
    const response = await api.get('/quotes/all/quotes', { params: filters });
    return response.data;
};

export const approveQuote = async (quoteId) => {
    const response = await api.post(`/quotes/${quoteId}/approve`);
    return response.data;
};

export const rejectQuote = async (quoteId, reason) => {
    const response = await api.post(`/quotes/${quoteId}/reject`, { reason });
    return response.data;
};

export const updateQuote = async (quoteId, data) => {
    const response = await api.put(`/quotes/${quoteId}`, data);
    return response.data;
};

// ============================================
// INVOICE MANAGEMENT
// ============================================

export const createInvoice = async (orderId) => {
    const response = await api.post('/admin/invoices', { orderId });
    return response.data;
};

export const getAllInvoices = async (filters = {}) => {
    const response = await api.get('/admin/invoices', { params: filters });
    return response.data;
};

export const getInvoice = async (invoiceId) => {
    const response = await api.get(`/admin/invoices/${invoiceId}`);
    return response.data;
};

export const updateInvoiceStatus = async (invoiceId, status, paymentMethod = null) => {
    const response = await api.patch(`/admin/invoices/${invoiceId}/status`, {
        status,
        paymentMethod
    });
    return response.data;
};

export const getInvoiceStats = async () => {
    const response = await api.get('/admin/invoices/stats');
    return response.data;
};

// ============================================
// AUDIT LOGS
// ============================================

export const getAuditLogs = async (filters = {}) => {
    const response = await api.get('/admin/audit-logs', { params: filters });
    return response.data;
};

export const getAuditLog = async (logId) => {
    const response = await api.get(`/admin/audit-logs/${logId}`);
    return response.data;
};

export const getAuditStats = async (filters = {}) => {
    const response = await api.get('/admin/audit-logs/stats', { params: filters });
    return response.data;
};

// ============================================
// SYSTEM SETTINGS
// ============================================

export const getSettings = async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/admin/settings', { params });
    return response.data;
};

export const getSetting = async (key) => {
    const response = await api.get(`/admin/settings/${key}`);
    return response.data;
};

export const updateSetting = async (key, value) => {
    const response = await api.put(`/admin/settings/${key}`, { value });
    return response.data;
};

export const createSetting = async (settingData) => {
    const response = await api.post('/admin/settings', settingData);
    return response.data;
};

export const initDefaultSettings = async () => {
    const response = await api.post('/admin/settings/init-defaults');
    return response.data;
};

// ============================================
// ORDERS (Enhanced)
// ============================================

export const getAllOrders = async (filters = {}) => {
    const response = await api.get('/orders/all', { params: filters });
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
};

export const validateOrder = async (orderId) => {
    const response = await api.post(`/orders/${orderId}/validate`);
    return response.data;
};

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export const getAllProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
};

export const deleteProduct = async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
};

// ============================================
// MAINTENANCE (Enhanced)
// ============================================

export const getAllMaintenanceRequests = async (filters = {}) => {
    const response = await api.get('/maintenance/all', { params: filters });
    return response.data;
};

export const assignTechnician = async (requestId, technicianId) => {
    const response = await api.post(`/maintenance/${requestId}/assign`, { technicianId });
    return response.data;
};

export const autoAssignTechnician = async (requestId) => {
    const response = await api.post(`/maintenance/${requestId}/auto-assign`);
    return response.data;
};

export const updateMaintenanceStatus = async (requestId, status) => {
    const response = await api.patch(`/maintenance/${requestId}/status`, { status });
    return response.data;
};

// ============================================
// TECHNICIAN MANAGEMENT
// ============================================

export const getAllTechnicians = async () => {
    const response = await api.get('/technicians');
    return response.data;
};

export const createTechnician = async (technicianData) => {
    const response = await api.post('/technicians', technicianData);
    return response.data;
};

export const deleteTechnician = async (technicianId) => {
    const response = await api.delete(`/technicians/${technicianId}`);
    return response.data;
};

export default {
    // Dashboard
    getDashboardStats,
    getActivityLogs,
    getSystemHealth,

    // Users
    getAllUsers,
    updateUser,
    toggleUserStatus,
    bulkUpdateUsers,
    getUserStats,
    deleteUser,

    // Quotes
    getAllQuotes,
    approveQuote,
    rejectQuote,
    updateQuote,

    // Invoices
    createInvoice,
    getAllInvoices,
    getInvoice,
    updateInvoiceStatus,
    getInvoiceStats,

    // Audit
    getAuditLogs,
    getAuditLog,
    getAuditStats,

    // Settings
    getSettings,
    getSetting,
    updateSetting,
    createSetting,
    initDefaultSettings,

    // Orders
    getAllOrders,
    updateOrderStatus,
    validateOrder,

    // Products
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Maintenance
    getAllMaintenanceRequests,
    assignTechnician,
    autoAssignTechnician,
    updateMaintenanceStatus,

    // Technicians
    getAllTechnicians,
    createTechnician,
    deleteTechnician
};
