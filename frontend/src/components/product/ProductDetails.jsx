// src/components/product/ProductDetails.jsx
import React, { useState } from 'react';
import StarRating from '../ui/StarRating';
import ReviewItem from '../ui/ReviewItem';
import ProductReviewForm from './ProductReviewForm';
import { useProductReviews } from '../../hooks/useProducts';

const ProductDetails = ({ product, onClose, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { reviews, loading, error } = useProductReviews(product.id);
  
  // Convert to numbers
  const averageRating = typeof product.averageRating === 'string' 
    ? parseFloat(product.averageRating) 
    : product.averageRating;
    
  const totalReviews = product.totalReviews || 0;

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    // Refresh reviews after submission
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
            </div>
            
            <div className="md:w-2/3">
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              <div className="flex items-center mb-6">
                <StarRating rating={averageRating} size="lg" />
                <span className="ml-3 text-gray-600">
                  {averageRating.toFixed(1)} out of 5 ({totalReviews} reviews)
                </span>
              </div>
              
              <button 
                onClick={() => setShowReviewForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                <p>Error loading reviews: {error.message}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review!
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {showReviewForm && (
          <ProductReviewForm 
            product={product} 
            onSubmit={handleReviewSubmit}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;