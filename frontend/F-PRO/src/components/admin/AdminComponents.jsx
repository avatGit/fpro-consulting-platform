import React from 'react';
import './AdminComponents.css';

/**
 * Stat Card Component
 * Displays a single statistic with icon, value, label, and optional trend
 */
export const StatCard = ({ icon, value, label, trend, trendUp, color = 'primary' }) => {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-icon">
                <i className={icon}></i>
            </div>
            <div className="stat-content">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
                {trend && (
                    <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                        <i className={`fas fa-caret-${trendUp ? 'up' : 'down'}`}></i>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Data Table Component
 * Reusable table with sorting, filtering, and pagination
 */
export const DataTable = ({
    columns,
    data,
    onRowClick,
    selectedRows = [],
    onSelectRow,
    loading = false,
    emptyMessage = 'Aucune donnée disponible'
}) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-empty">
                <i className="fas fa-inbox"></i>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {onSelectRow && (
                            <th className="checkbox-col">
                                <input type="checkbox" />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th key={idx} className={col.className || ''}>
                                {col.label}
                                {col.sortable && <i className="fas fa-sort"></i>}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={selectedRows.includes(row.id) ? 'selected' : ''}
                        >
                            {onSelectRow && (
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onSelectRow(row.id);
                                        }}
                                    />
                                </td>
                            )}
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={col.className || ''}>
                                    {col.render ? col.render(row) : row[col.field]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Modal Component
 * Reusable modal dialog
 */
export const Modal = ({ isOpen, onClose, title, children, size = 'medium', footer }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content modal-${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Badge Component
 * Status badge with different colors
 */
export const Badge = ({ text, variant = 'default' }) => {
    return (
        <span className={`badge badge-${variant}`}>
            {text}
        </span>
    );
};

/**
 * Action Button Component
 * Icon button for table actions
 */
export const ActionButton = ({ icon, onClick, tooltip, variant = 'default', disabled = false }) => {
    return (
        <button
            className={`action-btn action-btn-${variant}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            title={tooltip}
            disabled={disabled}
        >
            <i className={icon}></i>
        </button>
    );
};

/**
 * Search Bar Component
 */
export const SearchBar = ({ value, onChange, placeholder = 'Rechercher...' }) => {
    return (
        <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

/**
 * Filter Dropdown Component
 */
export const FilterDropdown = ({ label, options, value, onChange }) => {
    return (
        <div className="filter-dropdown">
            <label>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Tous</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * Pagination Component
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-btn">1</button>
                    {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="pagination-btn">
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ message = 'Chargement...' }) => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ icon, title, message, action }) => {
    return (
        <div className="empty-state">
            <i className={icon}></i>
            <h3>{title}</h3>
            <p>{message}</p>
            {action && (
                <button className="btn btn-primary" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
};
