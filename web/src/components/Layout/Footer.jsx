import React from 'react';
import './Footer.css';
import logo from '../../assets/logo-new.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column brand-column">
                    <img src={logo} alt="Maison Arlo Raciàto" className="footer-logo" />
                    <p className="footer-address">
                        Manila, Philippines<br />
                        est. 2024
                    </p>
                </div>

                <div className="footer-column">
                    <h4 className="footer-heading">Collection</h4>
                    <a href="/collections/signature" className="footer-link">Signature</a>
                    <a href="/collections/men" className="footer-link">Men</a>
                    <a href="/collections/women" className="footer-link">Women</a>
                </div>

                <div className="footer-column">
                    <h4 className="footer-heading">Legal</h4>
                    <a href="/privacy" className="footer-link">Privacy Policy</a>
                    <a href="/terms" className="footer-link">Terms of Service</a>
                </div>

                <div className="footer-column newsletter">
                    <h4 className="footer-heading">Newsletter</h4>
                    <p className="footer-text">Join our list for early access to new releases.</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Email Address" className="newsletter-input" />
                        <button className="newsletter-btn">Subscribe</button>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Maison Arlo Raciàto. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
