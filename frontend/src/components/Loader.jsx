import React from 'react';

const Loader = ({ size = 50, className = '', simple = false }) => {
  if (simple) {
    return (
      <div 
        className={`loader-simple ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }
  
  return (
    <div 
      className={`loader ${className}`}
      style={{ width: `${size}px`, aspectRatio: '1' }}
    />
  );
};

export default Loader;