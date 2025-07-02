import React, { useState, useRef } from "react";
import "./SwipeUI.css";
import { Heart, X, MapPin, Info } from "lucide-react";

export default function SwipeUI() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);

  const profiles = [
    {
      id: 1,
      name: "Emma",
      age: 26,
      location: "San Francisco, CA",
      bio: "Adventure seeker who loves hiking and coffee dates ☕",
      sharedInterests: ["Photography", "Travel"],
      image: "https://images.unsplash.com/photo-1494790108755-2616c4498674?w=600",
    },
    {
      id: 2,
      name: "Sarah",
      age: 24,
      location: "Los Angeles, CA",
      bio: "Fitness enthusiast and dog lover 🐕",
      sharedInterests: ["Yoga", "Animals"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600",
    },
    {
      id: 3,
      name: "Maya",
      age: 28,
      location: "New York, NY",
      bio: "Creative soul with a passion for art and music 🎨",
      sharedInterests: ["Art", "Music"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
    },
  ];

  const currentProfile = profiles[currentIndex];

  function handleSwipe(direction) {
    if (isAnimating) return;

    setIsAnimating(true);

    if (cardRef.current) {
      cardRef.current.style.animation =
        direction === "left"
          ? "swipe-left 0.3s ease-out forwards"
          : "swipe-right 0.3s ease-out forwards";
    }

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setIsAnimating(false);
      if (cardRef.current) {
        cardRef.current.style.animation = "";
      }
    }, 300);

    console.log(`Swiped ${direction} on ${currentProfile.name}`);
  }

  function handleLike() {
    handleSwipe("right");
  }

  function handlePass() {
    handleSwipe("left");
  }

  if (!currentProfile) {
    return (
      <div className="swipeui-empty">
        <div className="text-center">
          <Heart className="w-16 h-16 text-romantic-rose mx-auto mb-4 animate-heart-beat" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No more profiles!</h2>
          <p className="text-gray-600">Check back later for new matches ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swipeui-container">
      <div className="floating-hearts">
        {[...Array(6)].map((_, i) => (
          <Heart
            key={i}
            className="floating-heart"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="swipeui-content">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Discover Love</h1>
          <p className="text-gray-600">Swipe right to like, left to pass</p>
        </div>

        <div className="relative w-full max-w-sm mx-auto mb-8">
          <div ref={cardRef} className="romantic-card overflow-hidden shadow-2xl">
            <div className="relative">
              <img
                src={currentProfile.image}
                alt={currentProfile.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                <div className="flex items-center mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{currentProfile.location}</span>
                </div>
                <p className="text-sm leading-relaxed mb-4 text-white/90">{currentProfile.bio}</p>
                {currentProfile.sharedInterests.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-romantic-pink" />
                    <span className="text-xs text-romantic-pink font-medium">
                      Shared: {currentProfile.sharedInterests.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 justify-center">
          <button
            onClick={handlePass}
            disabled={isAnimating}
            className="swipe-button swipe-pass bg-white border border-red-200 rounded-full p-4 shadow"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>

          <button
            onClick={handleLike}
            disabled={isAnimating}
            className="swipe-button swipe-like bg-romantic-rose rounded-full p-4 shadow"
          >
            <Heart className="w-8 h-8 text-white fill-current" />
          </button>
        </div>

        <div className="flex gap-2 mt-8">
          {profiles.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-romantic-rose w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
