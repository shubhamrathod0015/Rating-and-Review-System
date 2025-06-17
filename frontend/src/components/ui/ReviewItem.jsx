// src/components/ui/ReviewItem.jsx
import React from 'react';
import StarRating from './StarRating';
import TagList from './TagList';


const ReviewItem = ({ review }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="border-b pb-6 last:border-0 animate-fadeIn">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      
      {review.comment && (
        <p className="text-gray-700 mt-3">{review.comment}</p>
      )}
      
      {review.tags && review.tags.length > 0 && (
        <TagList tags={review.tags} className="mt-3" />
      )}
    </div>
  );
};

export default ReviewItem;