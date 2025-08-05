// Hero Video Component for TourSmile Homepage
import React, { useState, useEffect } from 'react';

const HeroVideo = () => {
  const [showVideo, setShowVideo] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Create a simple demo animation since we'll replace with actual video later
  const demoFrames = [
    {
      title: "Welcome to TourSmile",
      subtitle: "Your Best Travel Assistant",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop",
      overlay: "🏠 Beautiful Homepage"
    },
    {
      title: "AI Travel Consultant",
      subtitle: "Ask me anything about your dream trip",
      image: "https://images.unsplash.com/photo-1531094332864-8b7f7db78db0?w=800&h=450&fit=crop", 
      overlay: "🤖 AI Chat: 'Plan trip to Dubai'"
    },
    {
      title: "1000+ Travel Packages",
      subtitle: "Curated trips for every taste and budget",
      image: "https://images.unsplash.com/photo-1520638023360-6d17b0fadc6a?w=800&h=450&fit=crop",
      overlay: "🌟 Popular Trips"
    },
    {
      title: "Global Destination Search", 
      subtitle: "Search 20,000+ destinations worldwide",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop",
      overlay: "🌍 Global Search: 'Paris'"
    },
    {
      title: "Book with Confidence",
      subtitle: "Expert guidance every step of the way",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop",
      overlay: "✈️ Start Your Journey"
    }
  ];

  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % demoFrames.length);
    }, 2000); // Change frame every 2 seconds for 10-second total loop

    return () => clearInterval(interval);
  }, []);

  const handleVideoError = () => {
    setShowVideo(false);
  };

  const HeroDemoVideo = () => {
    const frame = demoFrames[currentFrame];
    
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* Background Image */}
        <img 
          src={frame.image}
          alt={frame.title}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
          <div className="max-w-2xl">
            {/* Feature Label */}
            <div className="mb-4 inline-block bg-orange-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              {frame.overlay}
            </div>
            
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">
              {frame.title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-6 animate-slide-up">
              {frame.subtitle}
            </p>
            
            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2">
              {demoFrames.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFrame ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full mb-8">
      {/* Hero Video Section */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
        {showVideo ? (
          <HeroDemoVideo />
        ) : (
          /* Fallback Image */
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">TourSmile</h2>
              <p className="text-xl">Your Best Travel Assistant</p>
            </div>
          </div>
        )}
        
        {/* Play/Pause Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
            aria-label={showVideo ? "Pause demo" : "Play demo"}
          >
            {showVideo ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Video Description */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm md:text-base">
          ⏱️ <strong>10 seconds</strong> to see how easy it is to plan your perfect trip with TourSmile
        </p>
      </div>
    </div>
  );
};

export default HeroVideo;