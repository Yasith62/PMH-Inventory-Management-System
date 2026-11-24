import React, { useState } from 'react';
import Loading from '../components/Loading';
import Loader from '../components/Loader';

export default function LoadingTest() {
  const [showLoader, setShowLoader] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Loading State Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Basic Loader</h2>
          <Loader size={50} />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Loading Component (Inline)</h2>
          <Loading message="Test loading message..." size={40} />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Loading Component (Full Screen)</h2>
          <button 
            onClick={() => setShowFullScreen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Show Full Screen Loading
          </button>
          {showFullScreen && (
            <Loading 
              message="Full screen loading..." 
              size={60} 
              fullScreen={true}
            />
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Different Sizes</h2>
          <div className="flex gap-4 items-center">
            <Loader size={20} />
            <Loader size={30} />
            <Loader size={40} />
            <Loader size={50} />
            <Loader size={60} />
          </div>
        </div>
      </div>
    </div>
  );
}