// src/components/ui/TagList.jsx
import React from 'react';

const TagList = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <span 
          key={index} 
          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagList;