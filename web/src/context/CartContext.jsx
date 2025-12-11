import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Initialize cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('local_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from local storage", error);
            }
        }
    }, []);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('local_cart', JSON.stringify(cart));
    }, [cart]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const calculateTotal = (items) => {
        return items.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    const addToCart = (variantId, quantity = 1, productDetails) => {
        setIsAdding(true);
        // Simulate a small delay for better UX (feedback)
        setTimeout(() => {
            setCart(prevCart => {
                const existingItemIndex = prevCart.items.findIndex(item => item.variantId === variantId);
                let newItems;

                if (existingItemIndex > -1) {
                    newItems = [...prevCart.items];
                    newItems[existingItemIndex].quantity += quantity;
                } else {
                    newItems = [...prevCart.items, {
                        variantId,
                        quantity,
                        ...productDetails
                    }];
                }

                return {
                    items: newItems,
                    total: calculateTotal(newItems)
                };
            });
            setIsAdding(false);
            openCart();
        }, 300);
    };

    const removeFromCart = (variantId) => {
        setCart(prevCart => {
            const newItems = prevCart.items.filter(item => item.variantId !== variantId);
            return {
                items: newItems,
                total: calculateTotal(newItems)
            };
        });
    };

    const updateQuantity = (variantId, quantity) => {
        if (quantity < 1) return;
        setCart(prevCart => {
            const newItems = prevCart.items.map(item =>
                item.variantId === variantId ? { ...item, quantity } : item
            );
            return {
                items: newItems,
                total: calculateTotal(newItems)
            };
        });
    };

    const clearCart = () => {
        setCart({ items: [], total: 0 });
    };

    const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            openCart,
            closeCart,
            toggleCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalQuantity,
            isAdding
        }}>
            {children}
        </CartContext.Provider>
    );
};

