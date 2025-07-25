import React from 'react';
import './Header.css'; 

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        
        {/* Logo */}
        <div className="header-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="40"
          height="40"
          aria-label="Matchmate Logo"
          role="img"
        >
          <path
            fill="#9333ea"
            d="M269.4 2.9C265.2 1 260.7 0 256 0s-9.2 1-13.4 2.9L54.3 82.8c-22 9.3-38.4 31-38.3 57.2c.5 99.2 41.3 280.7 213.6 363.2c16.7 8 36.1 8 52.8 0C454.7 420.7 495.5 239.2 496 140c.1-26.2-16.3-47.9-38.3-57.2L269.4 2.9zM144 221.3c0-33.8 27.4-61.3 61.3-61.3c16.2 0 31.8 6.5 43.3 17.9l7.4 7.4 7.4-7.4c11.5-11.5 27.1-17.9 43.3-17.9c33.8 0 61.3 27.4 61.3 61.3c0 16.2-6.5 31.8-17.9 43.3l-82.7 82.7c-6.2 6.2-16.4 6.2-22.6 0l-82.7-82.7c-11.5-11.5-17.9-27.1-17.9-43.3z"
          />
        </svg>


          <span className="logo-text">MatchMate</span>
        </div>

        {/* Navigation */}
        {/* <nav className="header-nav">
          <a href="#">Explore</a>
        </nav> */}

        {/* Auth Buttons */}
        {/* <div className="header-buttons">
          <button className="login-btn">Login</button>
          <button className="signup-btn">Sign Up</button>
        </div> */}

      </div>
    </header>
  );
}
