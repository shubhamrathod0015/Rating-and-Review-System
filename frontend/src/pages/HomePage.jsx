// src/pages/HomePage.jsx
import React, { useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import ProductDetails from '../components/product/ProductDetails';
import { useProducts } from '../hooks/useProducts';

const HomePage = () => {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const openDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeDetails = () => {
    setSelectedProduct(null);
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 my-8">
        <p>Error loading products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            onViewDetails={openDetails}
          />
        ))}
      </div>
      
      {selectedProduct && (
        <ProductDetails 
          product={selectedProduct} 
          onClose={closeDetails}
          onAddReview={() => setShowReviewForm(true)}
        />
      )}
      
      {/* Review form would be rendered here */}
    </div>
  );
};

export default HomePage;