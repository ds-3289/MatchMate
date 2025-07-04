import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, MessageSquare, Settings } from "lucide-react";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/new", icon: Heart, label: "Matches" },
    { path: "/swipe", icon: Heart, label: "Discover" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={24} className={`icon ${isActive ? "animate-heart-beat" : ""}`} />
              <span className="label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
