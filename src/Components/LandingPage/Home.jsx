import React from 'react';
import './Home.css'; 
import { Heart, Users, MessageCircle } from "lucide-react";

export default function Home() {
  return (
      <div className="home-wrapper">
      {/* Background Overlay */}
      <div className="home-background">
        <div className="home-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        <div className="title-group">
          <Heart className="icon pulse pink" />
          <h1 className="site-title">MatchMate</h1>
          <Users className="icon pulse orange" />
        </div>

        <h2 className="site-subtitle">Meet. Match. Mingle.</h2>

        <p className="site-description">
          Connect with people near you or around the world. MatchMate helps you make new friends, 
          find your vibe, or just have fun conversations in the most beautiful settings.
        </p>

        <div className="home-buttons">
        </div>

        {/* Floating Icons */}
        <div className="float-icon icon1">
          <MessageCircle className="float-icon-style pink" />
        </div>
        <div className="float-icon icon2">
          <Heart className="float-icon-style orange" />
        </div>
        <div className="float-icon icon3">
          <Users className="float-icon-style purple" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-box">
          <div className="scroll-dot"></div>
        </div>
      </div>
    </div>
  
  );
}
