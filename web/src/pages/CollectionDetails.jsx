import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/productService';
import ProductCard from '../components/ProductCard/ProductCard';
import Section from '../components/Section/Section';
import './CollectionDetails.css';

const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

const CollectionDetails = () => {
    const { handle } = useParams();
    const { data: collection, isLoading } = useQuery({
        queryKey: ['collection', handle],
        queryFn: () => ProductService.getCollectionByHandle(handle)
    });

    if (isLoading) {
        return (
            <div className="collection-page loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="collection-page error">
                <h2>Collection not found</h2>
                <a href="/" className="back-link">Return to Home</a>
            </div>
        );
    }

    return (
        <div className="collection-page">
            <div className="collection-header-wrapper">
                <h1 className="collection-title">{collection.title}</h1>
                {collection.description && (
                    <p className="collection-description">{collection.description}</p>
                )}
            </div>

            <Section className="collection-grid-section">
                <div className="product-grid">
                    {collection.products.map(product => {
                        const variant = product.variants[0];
                        const priceAmount = variant ? variant.price.amount : '0';
                        const currencyCode = variant ? variant.price.currencyCode : 'PHP';
                        const imageSrc = product.images[0] ? product.images[0].url : '';
                        const notes = product.tags ? product.tags.filter(t => t.startsWith('Note:')).map(t => t.replace('Note:', '').trim()).join(' • ') : '';

                        return (
                            <ProductCard
                                key={product.id}
                                handle={product.handle}
                                title={product.title}
                                image={imageSrc}
                                notes={notes}
                                price={formatPrice(parseFloat(priceAmount), currencyCode)}
                            />
                        );
                    })}
                </div>
                {collection.products.length === 0 && (
                    <div className="empty-collection">
                        <p>No products found in this collection.</p>
                    </div>
                )}
            </Section>
        </div>
    );
};

export default CollectionDetails;
