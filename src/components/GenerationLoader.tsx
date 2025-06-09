import React, { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';

const loadingMessages = [
  "Crafting your dream tattoo...",
  "Generating your unique design...",
  "Bringing your vision to life...",
  "Creating something special...",
  "Designing your perfect tattoo..."
];

const GenerationLoader: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <Wand2 className="w-16 h-16 mx-auto text-purple-600 animate-pulse" />
        </div>
        <p className="text-xl font-semibold text-gray-800 mb-2">
          {currentMessage}
        </p>
        <p className="text-sm text-gray-500">
          This may take a few moments
        </p>
      </div>
    </div>
  );
};

export default GenerationLoader;