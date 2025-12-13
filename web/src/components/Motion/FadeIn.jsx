import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0, duration = 0.8, direction = 'up', className = '' }) => {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
            x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: duration,
                ease: [0.22, 1, 0.36, 1], // Custom easy-out
                delay: delay
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default FadeIn;
