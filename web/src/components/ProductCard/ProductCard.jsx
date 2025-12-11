import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ image, title, handle, notes, price }) => {
    return (
        <div className="product-card">
            <Link to={`/products/${handle}`} className="product-card-link">
                <div className="product-image-container">
                    <img src={image} alt={title} className="product-image" loading="lazy" />
                    <button className="product-overlay-btn">View Details</button>
                </div>
                <div className="product-info">
                    <h4 className="product-name">{title}</h4>
                    <p className="product-notes">{notes}</p>
                    <span className="product-price">{price}</span>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
