/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('local_cart');
            return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
        } catch (error) {
            console.error("Failed to parse cart from local storage", error);
            return { items: [], total: 0 };
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

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

    const addToCart = async (variantId, quantity = 1, productDetails) => {
        setIsAdding(true);

        try {
            // Check stock with Supabase
            // Note: variantId is expected to be the Product ID in our simple schema
            const { data, error } = await supabase
                .from('perfumes')
                .select('quantity_available')
                .eq('id', variantId)
                .single();

            if (!error && data) {
                const currentInCart = cart.items.find(item => item.variantId === variantId)?.quantity || 0;
                if (data.quantity_available < (currentInCart + quantity)) {
                    alert(`Sorry, only ${data.quantity_available} left in stock.`);
                    setIsAdding(false);
                    return;
                }
            }
        } catch (error) {
            console.warn("Stock check failed or skipped (using fallback):", error);
            // Fallback to productDetails inventory if available
            if (productDetails && productDetails.inventory_quantity !== undefined) {
                const currentInCart = cart.items.find(item => item.variantId === variantId)?.quantity || 0;
                if (productDetails.inventory_quantity < (currentInCart + quantity)) {
                    alert(`Sorry, only ${productDetails.inventory_quantity} left in stock.`);
                    setIsAdding(false);
                    return;
                }
            }
        }

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
