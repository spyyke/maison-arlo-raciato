import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';
import heroBg from '../../assets/hero-bg-silk.png';
// Video background removed per request. To restore, uncomment import and video tag.
// import heroVideo from '../../assets/hero-bg.mp4';
import logo from '../../assets/logo-mar-traced.svg';

const Hero = () => {
    const targetRef = useRef(null);
    const { scrollY } = useScroll();

    // Animation Parameters
    // Scale: 1 -> 0.2 over 300px
    const logoScale = useTransform(scrollY, [0, 300], [1, 0.2]);

    // Y Position: Start at 50vh, move to 38px
    // We need to calculate the initial Y. 
    // Since we can't easily access window.innerHeight in useTransform definition constantly without re-render,
    // we can use a CSS variable or a fixed "start" assumption or a different approach.
    // However, for the specific "stick to top" effect with simple parallax:

    // Let's replicate the logic: currentTop = startTop - (progress * (startTop - endTop));
    // startTop is 50vh.
    // But `useTransform` maps values naturally. 
    // If we want it to physically move, we usually use `y`.
    // The original logic was `top` or `transformY`.
    // Original: `translate3d(0, ${scrollState.logoY - (window.innerHeight * 0.5)}px, 0)`
    // This implies it was essentially moving RELATIVE to its centered position.

    // Actually, the previous code had removed the "Animated Fixed Logo" block entirely (lines 61-73 were commented out).
    // The ONLY thing moving was the background:
    // `style={{ transform: `translateY(${scrollState.offset * 0.5}px)` }}`
    // AND the State calculation was happening for the Logo even though it was commented out!
    // So the MAIN optimization is just removing that calculation loop and converting the background parallax to framer-motion.

    // Parallax for background
    const backgroundY = useTransform(scrollY, [0, 1000], [0, 500]); // 0.5 factor

    const scrollToShop = () => {
        const shopSection = document.getElementById('shop');
        if (shopSection) {
            shopSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero" ref={targetRef}>
            {/* Animated Fixed Logo - REMOVED in favor of static placement per request */}
            {/* If we ever bring it back, we can use <motion.div style={{ scale: logoScale, ... }} /> */}

            <motion.div
                className="hero-background"
                style={{ y: backgroundY }}
            >
                <img src={heroBg} alt="Maison Arlo Raciàto Collection" />
                <div className="hero-overlay"></div>
            </motion.div>

            <div className="hero-content">
                <div className="hero-logo-static">
                    <img src={logo} alt="Maison Arlo Raciàto Logo" className="logo-image" />
                </div>
                <h2 className="hero-subtitle">Maison Arlo Raciàto</h2>
                <h1 className="hero-title text-shimmer">Defined by<br />Subtlety</h1>
                <p className="hero-description">
                    Timeless fragrances, crafted with passion.
                </p>
                <button className="btn-bronze" onClick={scrollToShop}>Discover the Collection</button>
            </div>
        </section>
    );
};

export default Hero;
