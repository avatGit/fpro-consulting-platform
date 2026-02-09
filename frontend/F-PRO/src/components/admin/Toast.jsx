import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Notification Component
 * Displays temporary success/error/warning/info messages
 */
const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'fa-solid fa-check-circle';
            case 'error':
                return 'fa-solid fa-exclamation-circle';
            case 'warning':
                return 'fa-solid fa-exclamation-triangle';
            case 'info':
            default:
                return 'fa-solid fa-info-circle';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                <i className={getIcon()}></i>
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                <i className="fa-solid fa-times"></i>
            </button>
        </div>
    );
};

/**
 * Toast Container Component
 * Manages multiple toast notifications
 */
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;
