import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';
import logo from '../../assets/logo-new.png';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { totalQuantity, toggleCart } = useCart();
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome ? 'is-home' : ''}`}>
            <div className="navbar-container">
                {/* Mobile Menu Toggle */}
                <button
                    className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className="nav-left">
                    <a href="/collections/signature" className="nav-link">Signature</a>
                    <a href="/collections/men" className="nav-link">Men</a>
                    <a href="/collections/women" className="nav-link">Women</a>
                </nav>

                <div className="nav-center">
                    <a href="/" className="brand-logo-link" onClick={() => setMobileMenuOpen(false)}>
                        <img src={logo} alt="Maison Arlo Raciàto" className="brand-logo-img" />
                    </a>
                </div>
                <nav className="nav-right">
                    <a href="/collections/limited-edition" className="nav-link">Limited</a>
                    <a href="/#heritage" className="nav-link">Heritage</a>
                    <button className="nav-icon" aria-label="Cart" onClick={toggleCart}>
                        Cart ({totalQuantity})
                    </button>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <a href="/collections/signature" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Signature</a>
                    <a href="/collections/men" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Men</a>
                    <a href="/collections/women" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Women</a>
                    <a href="/collections/limited-edition" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Limited</a>
                    <a href="/#heritage" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Heritage</a>
                </div>
                <button className="btn-bronze mobile-cart-btn" onClick={() => { toggleCart(); setMobileMenuOpen(false); }}>
                    Cart ({totalQuantity})
                </button>
            </div>
        </header>
    );
};

export default Navbar;
