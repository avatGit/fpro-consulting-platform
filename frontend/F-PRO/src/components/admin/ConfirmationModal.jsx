import React, { useState } from 'react';
import './ConfirmationModal.css';

/**
 * Confirmation Modal Component
 * Used for confirming destructive or important actions
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'danger', // danger, warning, info
    requireInput = false,
    inputPlaceholder = '',
    inputLabel = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (requireInput) {
                await onConfirm(inputValue);
            } else {
                await onConfirm();
            }
            setInputValue('');
            onClose();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setInputValue('');
        onClose();
    };

    return (
        <div className="confirmation-modal-overlay" onClick={handleCancel}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-modal-header">
                    <div className={`confirmation-icon confirmation-icon-${type}`}>
                        {type === 'danger' && <i className="fa-solid fa-exclamation-triangle"></i>}
                        {type === 'warning' && <i className="fa-solid fa-exclamation-circle"></i>}
                        {type === 'info' && <i className="fa-solid fa-info-circle"></i>}
                    </div>
                    <h3 className="confirmation-title">{title}</h3>
                </div>

                <div className="confirmation-modal-body">
                    <p className="confirmation-message">{message}</p>

                    {requireInput && (
                        <div className="confirmation-input-group">
                            {inputLabel && <label className="confirmation-input-label">{inputLabel}</label>}
                            <textarea
                                className="confirmation-input"
                                placeholder={inputPlaceholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="confirmation-modal-footer">
                    <button
                        className="confirmation-btn confirmation-btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`confirmation-btn confirmation-btn-${type}`}
                        onClick={handleConfirm}
                        disabled={loading || (requireInput && !inputValue.trim())}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>Traitement...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
