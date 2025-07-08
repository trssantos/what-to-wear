import React from 'react';
import { Shirt } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Shirt className="h-16 w-16 text-white mx-auto" />
        </div>
        <h2 className="text-white text-xl font-semibold">A carregar...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;