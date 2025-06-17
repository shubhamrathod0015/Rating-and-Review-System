// src/components/product/ProductCard.jsx
import React from "react";
import StarRating from "../ui/StarRating";

const ProductCard = ({ product, onViewDetails }) => {
  const averageRating = typeof product.averageRating === 'string' 
    ? parseFloat(product.averageRating) 
    : product.averageRating;
  
  const totalReviews = product.totalReviews || 0;

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer w-full max-w-sm mx-auto sm:max-w-xs md:max-w-sm"
      onClick={() => onViewDetails(product)}
    >
      <div className="h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image Available</div>
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col gap-2">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm md:text-base line-clamp-2">
          {product.description}
        </p>

        <p className="text-indigo-700 font-semibold text-sm md:text-base">
          ₹{product.price}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-gray-600 gap-1">
            {/* <span>
              {hasRating ? averageRating.toFixed(1) : "N/A"} (
              {product.totalReviews})
            </span> */}
             <StarRating rating={averageRating} />
            <span className="ml-2 text-sm text-gray-600">
              {averageRating.toFixed(1)} ({totalReviews})
            </span>
          </div>

          <button
            className="text-indigo-600 hover:text-indigo-800 text-sm md:text-base font-medium"
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
