import React, { useRef, useState } from 'react';

const ProductBottle = ({ src, alt }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const overlayRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current || !contentRef.current || !overlayRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 10 degrees)
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = -((y - centerY) / centerY) * 10;

        // Direct DOM Update (No React Render)
        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }

            // Calculate shine position
            const shineX = 100 - (x / rect.width) * 100;
            const shineY = 100 - (y / rect.height) * 100;

            if (overlayRef.current) {
                overlayRef.current.style.backgroundImage = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.3) 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)`;
            }
        });
    };

    const handleMouseLeave = () => {
        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
            }
            if (overlayRef.current) {
                overlayRef.current.style.backgroundImage = 'none'; // Or default shine
            }
        });
    };

    return (
        <div
            className="bottle-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: '1000px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab'
            }}
        >
            <div
                className="bottle-content"
                ref={contentRef}
                style={{
                    transform: 'rotateX(0deg) rotateY(0deg)', // Initial state
                    transition: 'transform 0.1s ease-out',
                    position: 'relative',
                    width: 'fit-content',
                    height: 'fit-content',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform' // Hint browser
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))'
                    }}
                />

                {/* Glass Reflection / Shine Overlay */}
                <div
                    className="glass-overlay"
                    ref={overlayRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        // Init empty or default
                        mixBlendMode: 'soft-light',
                        pointerEvents: 'none',
                        opacity: 0.8
                    }}
                />

                {/* Refraction edge highlight */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '2px',
                        pointerEvents: 'none',
                        opacity: 0.5
                    }}
                />
            </div>
        </div>
    );
};

export default ProductBottle;
