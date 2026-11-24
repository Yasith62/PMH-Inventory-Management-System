import React from 'react';
import Loader from './Loader';

const Loading = ({ message = 'Loading...', size = 50, fullScreen = false, simple = true }) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <Loader size={size} simple={simple} />
      {message && (
        <p className="mt-4 text-sm text-slate-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;