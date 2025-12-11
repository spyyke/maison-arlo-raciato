import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
    const { handle } = useParams();
    const { addToCart, isAdding } = useCart();

    const [selectedVariantId, setSelectedVariantId] = useState(null);

    const { data: product, isLoading: loading, error } = useQuery({
        queryKey: ['product', handle],
        queryFn: () => ProductService.getProductByHandle(handle),
        enabled: !!handle,
        retry: false
    });

    // Set default variant when product loads
    React.useEffect(() => {
        if (product && product.variants && product.variants.length > 0 && !selectedVariantId) {
            setSelectedVariantId(product.variants[0].id);
        }
    }, [product, selectedVariantId]);

    if (loading) return <div className="product-details-page"><div className="loading-state">Loading...</div></div>;
    if (error || !product) return <div className="product-details-page"><div className="error-state">Product not found</div></div>;

    const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    const priceAmount = selectedVariant ? parseFloat(selectedVariant.price.amount) : 0;
    const currencyCode = selectedVariant ? selectedVariant.price.currencyCode : 'PHP';
    const imageSrc = product.images[0] ? product.images[0].url : '';

    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart(selectedVariant.id, 1, {
                title: product.title,
                variantTitle: selectedVariant.title,
                price: parseFloat(selectedVariant.price.amount),
                currency: selectedVariant.price.currencyCode,
                image: product.images[0] ? product.images[0].url : '',
                handle: product.handle
            });
        }
    };

    return (
        <div className="product-details-page">
            <div className="product-details-container">
                <div className="product-details-image-wrapper">
                    <img src={imageSrc} alt={product.title} className="product-details-image" />
                </div>

                <div className="product-details-info">
                    <div className="product-details-header">
                        <span className="product-brand-subtitle">Maison Arlo Raciàto</span>
                        <h1 className="product-details-title text-shimmer">{product.title}</h1>
                        <span className="product-details-price">
                            {formatPrice(priceAmount, currencyCode)}
                        </span>
                    </div>

                    <div className="product-size-selector">
                        <span className="size-label">Select Size:</span>
                        <div className="size-options">
                            {product.variants.map(variant => (
                                <button
                                    key={variant.id}
                                    className={`size-option-btn ${selectedVariantId === variant.id ? 'active' : ''}`}
                                    onClick={() => setSelectedVariantId(variant.id)}
                                >
                                    {variant.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-details-description">
                        <p>{product.description}</p>
                    </div>

                    {product.scent_notes && (
                        <div className="scent-notes-section">
                            <h3 className="scent-notes-title">Scent Notes</h3>
                            <div className="scent-notes-grid">
                                {product.scent_notes.map((note, index) => (
                                    <span key={index} className="scent-note-tag">{note}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="product-actions">
                        <button
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>

                    <Link to="/" className="back-link">← Back to Collection</Link>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
