// src/components/product/ProductCard.jsx
import React from 'react';
import StarRating from '../ui/StarRating';

const ProductCard = ({ product, onViewDetails }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      onClick={() => onViewDetails(product)}
    >
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <StarRating rating={product.averageRating} />
            <span className="ml-2 text-sm text-gray-600">
              {product.averageRating.toFixed(1)} ({product.totalReviews})
            </span>
          </div>
          
          <button 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;