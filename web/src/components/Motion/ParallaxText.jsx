import React, { useRef } from 'react';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';

const ParallaxText = ({ children, speed = 1, className = '' }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50]);

    return (
        <Motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </Motion.div>
    );
};

export default ParallaxText;
