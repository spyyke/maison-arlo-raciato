import React, { useEffect, useState } from 'react';

const MonogramLoader = ({ onComplete }) => {
    const [hasPlayed, setHasPlayed] = useState(false);

    useEffect(() => {
        // Simulate loading time relative to animation
        const timer = setTimeout(() => {
            setHasPlayed(true);
            if (onComplete) {
                setTimeout(onComplete, 800); // Wait for fade out
            }
        }, 2500); // 2.5s for drawing animation

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'var(--color-cream-base)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.8s ease-in-out',
                opacity: hasPlayed ? 0 : 1,
                pointerEvents: hasPlayed ? 'none' : 'all',
            }}
        >
            <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible' }}
            >
                {/* M */}
                <path
                    d="M20,80 L20,20 L50,50 L80,20 L80,80"
                    stroke="var(--color-charcoal)"
                    strokeWidth="2"
                    strokeLinecap="square"
                    fill="none"
                    className="monogram-path m-path"
                />

                {/* A (Overlaying, slightly simplified for monogram) */}
                {/* <path
          d="M30,80 L50,20 L70,80 M35,65 L65,65"
           stroke="var(--color-charcoal)"
           strokeWidth="2"
           strokeLinecap="square"
            fill="none"
             className="monogram-path a-path"
        /> */}

                {/* Since the prompt asks for M-A-R initials, let's make a composite monogram or sequence */}
            </svg>
            {/* 
        For a true "drawing" effect of M-A-R, we can place them side by side or interlaced. 
        Given "Monogram", interlaced is better, but for clarity let's do a sequence or stylized mark.
        Let's implement a clean "M A R" sequence animation centered.
      */}
            <div className="monogram-container">
                <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
                    {/* M */}
                    <path
                        d="M10,70 L10,10 L40,40 L70,10 L70,70"
                        stroke="var(--color-charcoal)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="250"
                        strokeDashoffset="250"
                        className="draw-anim"
                        style={{ animationDelay: '0s' }}
                    />
                    {/* A */}
                    <path
                        d="M80,70 L105,10 L130,70 M88,50 L122,50"
                        stroke="var(--color-charcoal)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="200"
                        strokeDashoffset="200"
                        className="draw-anim"
                        style={{ animationDelay: '0.6s' }}
                    />
                    {/* R */}
                    <path
                        d="M140,70 L140,10 L170,10 C185,10 185,40 170,40 L140,40 M170,40 L190,70"
                        stroke="var(--color-charcoal)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="200"
                        strokeDashoffset="200"
                        className="draw-anim"
                        style={{ animationDelay: '1.2s' }}
                    />
                </svg>
            </div>

            <style>{`
        .draw-anim {
            animation: draw 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes draw {
            to {
                stroke-dashoffset: 0;
            }
        }
        .monogram-container {
            display: flex;
            gap: 1rem;
        }
      `}</style>
        </div>
    );
};

export default MonogramLoader;
