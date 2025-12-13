import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductBottle from '../components/Product/ProductBottle';
import OlfactoryPyramid from '../components/Product/OlfactoryPyramid';
import ParallaxText from '../components/Motion/ParallaxText';
import './ProductDetails.css';

const ProductDetails = () => {
    const { handle } = useParams();
    const { addToCart, isAdding } = useCart();

    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);

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
            addToCart(selectedVariant.id, quantity, {
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
                    <img
                        src={imageSrc}
                        alt={product.title}
                        className="product-details-image"
                    />
                </div>

                <div className="product-details-info">
                    <div className="product-details-header">
                        <span className="product-brand-subtitle">Maison Arlo Raciàto</span>
                        {product.category && <span className="product-category-eyebrow">{product.category} Collection</span>}
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
                            <h3 className="scent-notes-title">Olfactory Composition</h3>
                            <OlfactoryPyramid notes={product.scent_notes} />
                        </div>
                    )}


                    <div className="product-actions">
                        {selectedVariant?.inventory_quantity < 10 && selectedVariant?.inventory_quantity > 0 && (
                            <div className="stock-alert-container">
                                <span className="stock-alert-icon">●</span>
                                <span className="stock-alert-text">Low Stock: Only {selectedVariant.inventory_quantity} remaining</span>
                            </div>
                        )}

                        <div className="buttons-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >-</button>
                                <span style={{ padding: '0 0.5rem', minWidth: '2rem', textAlign: 'center' }}>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >+</button>
                            </div>
                            <button
                                className="add-to-cart-btn btn-primary"
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                style={{ flex: 1, minWidth: '150px' }}
                            >
                                {isAdding ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                                className="sample-btn btn-bronze"
                                onClick={() => alert('Sample added to cart (Demo)')}
                                style={{ flex: 1, minWidth: '200px' }}
                            >
                                Request Sample ($10)
                            </button>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-charcoal-muted)', fontStyle: 'italic' }}>
                            Try before you commit. The cost of the sample is credited towards your full bottle purchase.
                        </p>
                    </div>

                    <Link to="/" className="back-link">← Back to Collection</Link>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
