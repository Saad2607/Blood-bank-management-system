import React from 'react';

const BloodBadge = ({ bloodGroup, size = 'md', className = '' }) => {
  const isNegative = bloodGroup?.includes('-');
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
    xl: 'text-xl px-5 py-2.5 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-lg tracking-wider border shadow-sm transition-all ${
        sizeClasses[size] || sizeClasses.md
      } ${
        isNegative
          ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
          : 'bg-red-50 text-red-700 border-red-200'
      } ${className}`}
    >
      <span className="mr-1 text-red-500">🩸</span>
      {bloodGroup || 'N/A'}
    </span>
  );
};

export default BloodBadge;
