import React from "react";
import "./Features.css";
import {
  Heart,
  Users,
  MessageCircle,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Heart className="icon pink" />,
      title: "Find Your Match",
      description:
        "Advanced matching algorithm connects you with compatible people based on shared interests and values.",
    },
    {
      icon: <Users className="icon orange" />,
      title: "Make Friends",
      description:
        "Not just dating - build meaningful friendships and expand your social circle in a natural way.",
    },
    {
      icon: <MessageCircle className="icon purple" />,
      title: "Fun Conversations",
      description:
        "Ice-breaker prompts and conversation starters make it easy to connect and keep chats flowing.",
    },
    {
      icon: <MapPin className="icon blue" />,
      title: "Local & Global",
      description:
        "Meet people in your neighborhood or connect with interesting souls from around the world.",
    },
    {
      icon: <Shield className="icon green" />,
      title: "Safe & Secure",
      description:
        "Your privacy matters. Verified profiles and secure messaging keep your information protected.",
    },
    {
      icon: <Sparkles className="icon yellow" />,
      title: "Authentic Vibes",
      description:
        "Share your real moments and connect over genuine experiences, not just perfect photos.",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-wrapper">
        <div className="features-header">
          <h2>Why Choose MatchMate?</h2>
          <p>
            We're more than just another dating app. We're your companion for
            building meaningful connections in today's digital world.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
