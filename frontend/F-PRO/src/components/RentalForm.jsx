import React, { useState, useEffect } from 'react';
import '../styles/Forms.css';

const RentalForm = ({ product, onCancel, onSave }) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        stock_quantity: '',
        type: 'service', // Always service for rentals
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                base_price: product.base_price,
                stock_quantity: product.stock_quantity,
                type: 'service',
                image: null
            });
            setImagePreview(product.image_url ? `http://localhost:5000${product.image_url}` : null);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.input ? e.input.files[0] : (e.target ? e.target.files[0] : null);
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(product?.id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="premium-form-container animate-fade-in shadow-none p-0 bg-transparent">
            <div className="form-section">
                <div className="form-group mb-4">
                    <label className="form-group-label">Nom du produit de location</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="premium-input"
                        placeholder="Ex: Vidéoprojecteur Epson"
                    />
                </div>

                <div className="form-group mb-4">
                    <label className="form-group-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="premium-textarea"
                        rows="3"
                        placeholder="Caractéristiques principales..."
                    />
                </div>
            </div>

            <div className="form-section">
                <div className="row g-4" style={{ display: 'flex', gap: '20px' }}>
                    <div className="col" style={{ flex: 1 }}>
                        <div className="form-group">
                            <label className="form-group-label">Prix Journalier (FCFA)</label>
                            <input
                                type="number"
                                name="base_price"
                                value={formData.base_price}
                                onChange={handleChange}
                                required
                                className="premium-input"
                            />
                        </div>
                    </div>
                    <div className="col" style={{ flex: 1 }}>
                        <div className="form-group">
                            <label className="form-group-label">Stock Disponible</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                required
                                className="premium-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-section border-0">
                <label className="form-group-label">Image du produit</label>
                {!imagePreview ? (
                    <div className="premium-upload-zone" onClick={() => document.getElementById('rental-image-upload').click()}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            id="rental-image-upload"
                            style={{ display: 'none' }}
                        />
                        <div className="upload-icon">
                            <i className="fa-solid fa-cloud-upload-alt"></i>
                        </div>
                        <div className="upload-text">Cliquez pour télécharger une image</div>
                        <div className="upload-hint">PNG, JPG ou WEBP (max. 5MB)</div>
                    </div>
                ) : (
                    <div className="premium-preview-container">
                        <img src={imagePreview} alt="Preview" />
                        <button
                            className="premium-btn premium-btn-danger"
                            onClick={removeImage}
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

            <div className="form-actions mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={onCancel} className="premium-btn premium-btn-secondary">
                    Annuler
                </button>
                <button type="submit" className="premium-btn premium-btn-primary">
                    <i className="fa-solid fa-check"></i>
                    {isEditing ? 'Mettre à jour' : 'Ajouter le produit'}
                </button>
            </div>
        </form>
    );
};

export default RentalForm;
