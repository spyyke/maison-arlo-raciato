import React, { useRef, useEffect, useState } from 'react';
import './Section.css';

const Section = ({
    children,
    className = '',
    id = '',
    background = 'transparent',
    fullHeight = false
}) => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <section
            id={id}
            ref={sectionRef}
            className={`section ${isVisible ? 'visible' : ''} ${className}`}
            style={{
                backgroundColor: background,
                minHeight: fullHeight ? '100vh' : 'auto'
            }}
        >
            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export default Section;
