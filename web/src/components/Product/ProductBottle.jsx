import React, { useRef, useState } from 'react';

const ProductBottle = ({ src, alt }) => {
    const containerRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [shine, setShine] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 10 degrees)
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = -((y - centerY) / centerY) * 10;

        setRotation({ x: rotateX, y: rotateY });

        // Calculate shine position (opposite to mouse)
        const shineX = 100 - (x / rect.width) * 100;
        const shineY = 100 - (y / rect.height) * 100;
        setShine({ x: shineX, y: shineY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setShine({ x: 50, y: 50 });
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
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: 'transform 0.1s ease-out',
                    position: 'relative',
                    width: 'fit-content',
                    height: 'fit-content',
                    transformStyle: 'preserve-3d'
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        // Simple drop shadow for depth
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))'
                    }}
                />

                {/* Glass Reflection / Shine Overlay */}
                <div
                    className="glass-overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.3) 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)`,
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
                        borderRadius: '2px', /* Approximate bottle shape if simple */
                        pointerEvents: 'none',
                        opacity: 0.5
                    }}
                />
            </div>
        </div>
    );
};

export default ProductBottle;
