import React from 'react';
import { useQuery } from '@tanstack/react-query';
import heritageTexture from '../assets/heritage-texture.webp';
import philosophyScent from '../assets/philosophy-scent.webp';
import Hero from '../components/Hero/Hero';
import Section from '../components/Section/Section';
import ProductCard from '../components/ProductCard/ProductCard';
import { ProductService } from '../services/productService';
import FadeIn from '../components/Motion/FadeIn';
import './Home.css';

// Helper function defined outside so it's not recreated on every render
const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

const Home = () => {
    // Replaced useEffect with useQuery for automatic caching and background updates
    const { data: products = [], isLoading: loading, error } = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAllProducts
    });

    return (
        <div className="home-page">
            <Hero />

            <Section id="heritage" className="heritage-section">
                <div className="heritage-content">
                    <div className="heritage-image-wrapper">
                        <img src={heritageTexture} alt="Natural Texture" className="heritage-image" />
                    </div>
                    <div className="heritage-text">
                        <FadeIn direction="up">
                            <h2 className="section-title">The Heritage</h2>
                            <p className="section-body">
                                Louis and Lorelle were raised in the art of perfumery. While Louis mastered the blend, Lorelle understood the emotion. For years, their bespoke creations remained a private passion.
                                <br /><br />
                                It was Angelo who recognized the true value in their work. He saw a depth missing from the mainstream—a quiet meaningfulness that needed to be shared.
                                <br /><br />
                                United by shared values and personal reflection, the three founded Maison Arlo Raciàto. The vision was clear: to create scents that provide meaning and quiet strength in everyday life.
                                <br /><br />
                                <span className="quote-highlight">Discernment is not learnt; it is felt.</span>
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </Section>

            <Section id="philosophy" className="philosophy-section">
                <div className="philosophy-content">
                    <div className="philosophy-text">
                        <FadeIn direction="up" delay={0.2}>
                            <h2 className="section-title">The Philosophy</h2>
                            <p className="section-body">
                                In a world of noise, we value silence. Maison Arlo Raciàto creates fragrances that are subtle yet distinct—scents that don't just announce an arrival, but leave a lasting impression.
                                <br /><br />
                                We focus on the timeless, not the temporary. Using rare ingredients like vintage ambergris and wild-harvested oud, we craft perfumes designed to be investments in quality.
                            </p>
                        </FadeIn>
                    </div>
                    <div className="philosophy-image-wrapper">
                        <img src={philosophyScent} alt="Scent Philosophy" className="philosophy-image" />
                    </div>
                </div>
            </Section>

            <Section id="shop" className="collection-section">
                <FadeIn delay={0.1}>
                    <div className="collection-header">
                        <h2 className="section-title">The Collection</h2>
                        <p className="section-subtitle">Signature compositions.</p>
                    </div>
                </FadeIn>

                {loading ? (
                    <div className="product-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="product-card skeleton-card">
                                <div className="skeleton-image text-shimmer"></div>
                                <div className="skeleton-text text-shimmer" style={{ width: '60%', height: '1.2rem', marginBottom: '0.5rem' }}></div>
                                <div className="skeleton-text text-shimmer" style={{ width: '40%', height: '1rem' }}></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>Unable to load collection.</p>
                        <button onClick={() => window.location.reload()} className="btn-bronze">Retry</button>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((product, index) => {
                            const variant = product.variants[0];
                            const priceAmount = variant ? variant.price.amount : '0';
                            const currencyCode = variant ? variant.price.currencyCode : 'PHP';
                            const imageSrc = product.images[0] ? product.images[0].url : '';

                            // Create notes from tags or description
                            const notes = product.tags ? product.tags.slice(0, 3).join(' • ') : '';

                            return (
                                <FadeIn key={product.id} delay={index * 0.1}>
                                    <ProductCard
                                        handle={product.handle}
                                        title={product.title}
                                        image={imageSrc}
                                        notes={notes}
                                        price={formatPrice(parseFloat(priceAmount), currencyCode)}
                                    />
                                </FadeIn>
                            );
                        })}
                    </div>
                )}
            </Section>
        </div>
    );
};

export default Home;
