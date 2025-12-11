import React from 'react';
import { motion as Motion } from 'framer-motion';
import ParallaxText from '../Motion/ParallaxText';

const NoteLayer = ({ title, notes, delay, type, speed }) => (
    <Motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`note-layer note-layer-${type}`}
        style={{ marginBottom: '1.5rem' }}
    >
        <ParallaxText speed={speed}>
            <h4 style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-charcoal-muted)',
                marginBottom: '0.5rem'
            }}>
                {title}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {notes.map((note, i) => (
                    <span key={i} style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.25rem',
                        color: 'var(--color-charcoal)'
                    }}>
                        {note}{i < notes.length - 1 ? ' · ' : ''}
                    </span>
                ))}
            </div>
        </ParallaxText>
    </Motion.div>
);

const OlfactoryPyramid = ({ notes }) => {
    // If notes is a simple array, try to split it, otherwise expect structured object
    // Assuming simple array for now based on current data, splitting evenly or by index

    let top = [], heart = [], base = [];

    if (Array.isArray(notes)) {
        if (notes.length >= 3) {
            top = [notes[0]];
            heart = [notes[1]];
            base = notes.slice(2);
        } else {
            top = notes; // Fallback
        }
    } else if (notes && typeof notes === 'object') {
        top = notes.top || [];
        heart = notes.heart || [];
        base = notes.base || [];
    }

    return (
        <div className="olfactory-pyramid" style={{ marginTop: '3rem', padding: '2rem', border: '1px solid var(--color-glass-border)', background: 'rgba(255,255,255,0.3)' }}>
            {top.length > 0 && <NoteLayer title="Top Notes" notes={top} delay={0.2} type="top" speed={0.5} />}
            {heart.length > 0 && <NoteLayer title="Heart Notes" notes={heart} delay={0.6} type="heart" speed={1} />}
            {base.length > 0 && <NoteLayer title="Base Notes" notes={base} delay={1.0} type="base" speed={0.2} />}
        </div>
    );
};

export default OlfactoryPyramid;
