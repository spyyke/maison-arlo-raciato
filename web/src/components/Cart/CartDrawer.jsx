import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
    const {
        cart,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity
    } = useCart();

    const [isVisible, setIsVisible] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        let timer;
        if (isCartOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisible(true);
        } else {
            timer = setTimeout(() => {
                setIsVisible(false);
                setShowCheckout(false); // Reset checkout view on close
            }, 500);
        }
        return () => clearTimeout(timer);
    }, [isCartOpen]);

    if (!isVisible && !isCartOpen) return null;

    const items = cart?.items || [];
    const subtotal = cart?.total || 0;
    const currency = 'PHP'; // Fixed for local build

    const handlePayMongoCheckout = async (e) => {
        e.preventDefault();

        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;
        const deliveryType = document.getElementById('delivery-type').value;

        if (!name || !email || !phone) {
            alert("Please fill in all details.");
            return;
        }

        const shippingFee = deliveryType === 'standard_delivery' ? 150 : 0;
        const total = subtotal + shippingFee;

        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: name,
                    customer_email: email,
                    customer_phone: phone,
                    items: items,
                    total_price: total,
                    delivery_type: deliveryType,
                    shipping_fee: shippingFee,
                    delivery_address: {
                        line1: document.getElementById('delivery-address')?.value || '',
                        city: document.getElementById('delivery-city')?.value || '',
                        barangay: document.getElementById('delivery-barangay')?.value || '',
                        postal_code: document.getElementById('delivery-postal')?.value || ''
                    },
                    payment_method: document.querySelector('input[name="payment_method"]:checked')?.value || 'card'
                })
            });

            const result = await response.json();

            if (result.success && result.checkout_url) {
                window.location.href = result.checkout_url;
            } else {
                alert("Payment initiation failed: " + (result.error || "Unknown error"));
            }

        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart}>
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>{showCheckout ? 'Complete Order' : 'Your Selection'}</h2>
                    <button className="close-btn" onClick={closeCart} aria-label="Close cart">&times;</button>
                </div>

                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-icon"><span>✨</span></div>
                            <p>Your collection awaits.</p>
                            <button className="continue-shopping-btn" onClick={closeCart}>Discover Scents</button>
                        </div>
                    ) : showCheckout ? (
                        <div className="checkout-view">
                            <div className="checkout-form">
                                <h3>Customer Details</h3>
                                <form id="checkout-form" onSubmit={(e) => { e.preventDefault(); }}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" id="customer-name" required placeholder="Full Name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" id="customer-email" required placeholder="Email Address" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="tel" id="customer-phone" required placeholder="Mobile Number" />
                                    </div>

                                    <div className="form-group">
                                        <label>Delivery Address</label>
                                        <input type="text" id="delivery-address" placeholder="Street Address / Building" />
                                        <div className="form-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <input type="text" id="delivery-city" placeholder="City" style={{ flex: 1 }} />
                                            <input type="text" id="delivery-barangay" placeholder="Barangay" style={{ flex: 1 }} />
                                        </div>
                                        <input type="text" id="delivery-postal" placeholder="Postal Code" style={{ marginTop: '0.5rem' }} />
                                    </div>

                                    <div className="form-group">
                                        <label>Delivery Type</label>
                                        <select id="delivery-type">
                                            <option value="office_pickup">Office Pickup (Free)</option>
                                            <option value="standard_delivery">Standard Delivery (+{currency} 150)</option>
                                        </select>
                                    </div>

                                    <div className="payment-info">
                                        <p className="secure-badge">🔒 Secure Payment by PayMongo</p>
                                        <div className="payment-methods-select">
                                            <label className="payment-option">
                                                <input type="radio" name="payment_method" value="card" defaultChecked />
                                                <span>Credit/Debit Card</span>
                                            </label>
                                            <label className="payment-option">
                                                <input type="radio" name="payment_method" value="gcash" />
                                                <span>GCash</span>
                                            </label>
                                            <label className="payment-option">
                                                <input type="radio" name="payment_method" value="maya" />
                                                <span>Maya</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button className="paymongo-btn" onClick={handlePayMongoCheckout}>
                                        Proceed to Payment
                                    </button>
                                </form>
                            </div>

                            <button className="continue-shopping-btn" style={{ marginTop: '1rem', width: '100%', border: 'none' }} onClick={() => setShowCheckout(false)}>
                                ← Back to Cart
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items">
                            {items.map(item => (
                                <div key={item.variantId} className="cart-item">
                                    <div className="item-image-container">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="item-image"
                                            />
                                        )}
                                    </div>
                                    <div className="item-details">
                                        <div>
                                            <h3>{item.title}</h3>
                                            <p className="variant-title">{item.variantTitle}</p>
                                        </div>
                                        <div className="item-controls">
                                            <div className="quantity-selector">
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                                            </div>
                                            <p className="item-price">{item.currency || 'PHP'} {parseFloat(item.price).toLocaleString()}</p>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.variantId)} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && !showCheckout && (
                    <div className="cart-footer">
                        <div className="subtotal">
                            <span>Subtotal</span>
                            <span>{currency} {parseFloat(subtotal).toLocaleString()}</span>
                        </div>
                        <p className="shipping-note">Shipping calculated after order confirmation</p>
                        <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
