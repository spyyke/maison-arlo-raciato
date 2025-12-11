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

    const handleWhatsAppOrder = () => {
        const phoneNumber = "639171234567"; // Replace with actual business number

        let message = `*New Order from Website* \n\n`;
        items.forEach(item => {
            message += `${item.quantity}x ${item.title} (${item.variantTitle}) - ${currency} ${item.price * item.quantity}\n`;
        });
        message += `\n*Total: ${currency} ${subtotal.toLocaleString()}*\n\n`;
        message += `I would like to pay via:\n[ ] GCash\n[ ] Maya\n[ ] BDO Transfer`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

        // Optional: Clear cart after order is "sent" or keep it until confirmed? 
        // For now, let's keep it so they don't lose it if they go back, but maybe adding a "Clear" button is good.
    };

    return (
        <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart}>
            <div className={`cart-drawer titanium-drawer ${isCartOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2 className="titanium-text">{showCheckout ? 'Complete Order' : 'Your Selection'}</h2>
                    <button className="close-btn" onClick={closeCart}>&times;</button>
                </div>

                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-icon"></div>
                            <p>Your collection is empty.</p>
                            <button className="continue-shopping-btn" onClick={closeCart}>Discover Scents</button>
                        </div>
                    ) : showCheckout ? (
                        <div className="checkout-view">
                            <div className="direct-payment-info">
                                <h3>Payment Instructions</h3>
                                <p>We accept direct transfers to avoid platform fees and keep prices optimal.</p>

                                <div className="payment-methods">
                                    <span className="payment-badge">GCash</span>
                                    <span className="payment-badge">Maya</span>
                                    <span className="payment-badge">BDO</span>
                                </div>

                                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    <p>1. Review your total below.</p>
                                    <p>2. Click "Send Order via WhatsApp".</p>
                                    <p>3. We will reply with the account details for payment.</p>
                                </div>
                            </div>

                            <button className="whatsapp-btn" onClick={handleWhatsAppOrder}>
                                <span>📱</span> Send Order via WhatsApp
                            </button>

                            <button className="continue-shopping-btn" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setShowCheckout(false)}>
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
                                        <h3>{item.title}</h3>
                                        <p className="variant-title">{item.variantTitle}</p>
                                        <p className="item-price">{item.currency || 'PHP'} {parseFloat(item.price).toLocaleString()}</p>

                                        <div className="item-controls">
                                            <div className="quantity-selector">
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                                            </div>
                                            <button className="remove-btn" onClick={() => removeFromCart(item.variantId)}>Remove</button>
                                        </div>
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
                        <button className="checkout-btn btn-bronze" onClick={() => setShowCheckout(true)}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;

