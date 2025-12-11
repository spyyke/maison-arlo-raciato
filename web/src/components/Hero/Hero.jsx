import React from 'react';
import './Hero.css';
import heroBg from '../../assets/hero-bg.webp';

import logoSvg from '../../assets/logo-new.png';

const Hero = () => {
    const [scrollState, setScrollState] = React.useState({
        offset: 0,
        logoScale: 1,
        logoY: 0,
        opacity: 1
    });

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // Animation Parameters
            const startScale = 1; // Large
            const endScale = 0.2; // Small (Navbar size: 0.2 * 300px = 60px)
            const transitionDistance = 300; // Pixel distance to complete transition

            // Calculate Progress
            const progress = Math.min(scrollY / transitionDistance, 1);

            // Interpolate Scale
            const currentScale = startScale - (progress * (startScale - endScale));

            // Interpolate Y Position (Move up faster than scroll to stick to top or float up)
            // We want it to start centered (50vh) and end at top (38px measured center of scrolled navbar logo)
            const startTop = window.innerHeight * 0.35;
            const endTop = 38;
            const currentTop = startTop - (progress * (startTop - endTop));

            setScrollState({
                offset: scrollY,
                logoScale: currentScale,
                logoY: currentTop,
                opacity: progress >= 1.01 ? 0 : 1 // tighter overlap buffer
            });
        };

        window.addEventListener('scroll', handleScroll);
        // Initial setup
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToShop = () => {
        const shopSection = document.getElementById('shop');
        if (shopSection) {
            shopSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero">
            {/* Animated Fixed Logo */}
            <div
                className="hero-logo-animated-wrapper"
                style={{
                    transform: `translate(-50%, -50%) translate3d(0, ${scrollState.logoY - (window.innerHeight * 0.35)}px, 0) scale(${scrollState.logoScale})`,
                    opacity: scrollState.opacity,
                    // If opacity is 0, pointer events none so we can click navbar
                    pointerEvents: scrollState.opacity === 0 ? 'none' : 'auto'
                }}
            >
                <img src={logoSvg} alt="Maison Arlo Raciàto Logo" />
            </div>

            <div
                className="hero-background"
                style={{ transform: `translateY(${scrollState.offset * 0.5}px)` }}
            >
                <img src={heroBg} alt="Maison Arlo Raciàto Collection" />
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">

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
