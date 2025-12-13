import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/UI/Toast'; // Import useToast
import ProductBottle from '../components/Product/ProductBottle';
import OlfactoryPyramid from '../components/Product/OlfactoryPyramid';
import './ProductDetails.css';

const ProductDetails = () => {
    const { handle } = useParams();
    const { addToCart, isAdding } = useCart();
    const { showToast } = useToast(); // Hook

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

    if (loading) return <div className="product-details-page"><div className="loading-state"></div></div>;
    if (error || !product) return <div className="product-details-page"><div className="error-state">Product not found</div></div>;

    const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    const isSoldOut = selectedVariant && selectedVariant.inventory_quantity <= 0;
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
            showToast(`Added ${quantity} ${product.title} to cart`, 'success');
        }
    };

    const handleRequestSample = () => {
        showToast("Sample added to cart (Demo)", 'info');
    };

    return (
        <div className="product-details-page">
            <div className="product-details-container">
                <div className="product-details-image-wrapper">
                    <ProductBottle
                        src={imageSrc}
                        alt={product.title}
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

                    <div className="product-accordion-section">
                        <Accordion title="Description" defaultOpen={true}>
                            <p className="accordion-content">{product.description}</p>
                        </Accordion>
                        <Accordion title="Olfactory Composition">
                            {product.scent_notes ? (
                                <OlfactoryPyramid notes={product.scent_notes} />
                            ) : (
                                <p className="accordion-content">Detailed notes coming soon.</p>
                            )}
                        </Accordion>
                        <Accordion title="Ingredients">
                            <p className="accordion-content">Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool.</p>
                        </Accordion>
                        <Accordion title="Delivery & Returns">
                            <p className="accordion-content">
                                Complimentary standard shipping on all orders. Returns accepted within 14 days of purchase.
                            </p>
                        </Accordion>
                    </div>


                    <div className="product-actions">
                        {selectedVariant?.inventory_quantity < 10 && selectedVariant?.inventory_quantity > 0 && (
                            <div className="stock-alert-container ">
                                <span className="stock-alert-icon">●</span>
                                <span className="stock-alert-text">Low Stock: Only {selectedVariant.inventory_quantity} remaining</span>
                            </div>
                        )}
                        {isSoldOut && (
                            <div className="stock-alert-container sold-out">
                                <span className="stock-alert-icon">●</span>
                                <span className="stock-alert-text">Sold Out</span>
                            </div>
                        )}

                        <div className="buttons-row">
                            <div className="quantity-selector">
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >-</button>
                                <span className="qty-display">{quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(quantity + 1)}
                                >+</button>
                            </div>
                            <button
                                className="add-to-cart-btn btn-primary"
                                onClick={handleAddToCart}
                                disabled={isAdding || isSoldOut}
                            >
                                {isSoldOut ? 'Sold Out' : (isAdding ? 'Adding...' : 'Add to Cart')}
                            </button>
                            <button
                                className="sample-btn btn-bronze"
                                onClick={handleRequestSample}
                            >
                                Request Sample ($10)
                            </button>
                        </div>
                        <p className="sample-note">
                            Try before you commit. The cost of the sample is credited towards your full bottle purchase.
                        </p>
                    </div>

                    <RelatedProducts currentHandle={product.handle} />

                    <Link to="/" className="back-link">← Back to Collection</Link>
                </div>
            </div>
        </div>
    );
};

// Sub-components (Local for now to keep things self-contained)

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="accordion-title">{title}</span>
                <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>+</span>
            </button>
            <div className={`accordion-body ${isOpen ? 'open' : ''}`}>
                <div className="accordion-inner">
                    {children}
                </div>
            </div>
        </div>
    );
};

const RelatedProducts = ({ currentHandle }) => {
    // Simple fetch of all products then filter
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAllProducts,
        staleTime: 1000 * 60 * 5
    });

    if (!products) return null;

    const related = products
        .filter(p => p.handle !== currentHandle)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    return (
        <div className="related-products-section">
            <h3 className="related-title">You May Also Like</h3>
            <div className="related-grid">
                {related.map(p => (
                    <Link key={p.id} to={`/products/${p.handle}`} className="related-card">
                        <div className="related-image-wrapper">
                            <img src={p.images[0]?.url} alt={p.title} className="related-image" loading="lazy" />
                        </div>
                        <h4 className="related-name">{p.title}</h4>
                        <span className="related-price">₱{p.variants[0]?.price?.amount}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductDetails;
