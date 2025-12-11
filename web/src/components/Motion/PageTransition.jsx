import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Motion.div
                key={location.pathname}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(20px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Heavy, luxurious ease
                style={{ width: '100%' }}
            >
                {children}
            </Motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
