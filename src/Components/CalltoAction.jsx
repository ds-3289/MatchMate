import React, { useState } from "react";
import "./CallToAction.css";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth , googleProvider} from "../firebase";
import AuthModal from "./AuthModal";

export default function CallToAction() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

//   const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      setShowLogin(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      setShowSignup(false);
    } catch (error) {
      alert(error.message);
    }
  };

//   const handleGoogleLogin = async () => {
//   try {
//     const result = await signInWithPopup(auth, googleProvider);
//     console.log("User signed in with Google:", result.user);
//     alert("Signed in with Google!");
//     onClose(); // close modal after success
//   } catch (error) {
//     console.error("Google sign-in error:", error);
//     alert(error.message);
//   }
// };

  return (
    <section className="cta-section">
      {/* Background */}
      <div className="cta-background" />

      {/* Content */}
      <div className="cta-content">
        <h2 className="cta-heading">Your Adventure Awaits</h2>
        <p className="cta-subtext">
          Join thousands of people who've already found their perfect match,
          best friend, or conversation partner. Your story starts here.
        </p>

        {/* Auth Buttons */}
        <div className="auth-buttons-container">
  <button className="auth-login-btn" onClick={() => setShowLogin(true)}>
    Login
  </button>
  <button className="auth-signup-btn" onClick={() => setShowSignup(true)}>
    Sign Up
  </button>
</div>


        {/* Fun Stats */}
        <div className="cta-stats">
          <div className="stat-box orange"><div className="stat-value">Make Friends!</div></div>
          <div className="stat-box pink"><div className="stat-value">Have Fun!</div></div>
          <div className="stat-box purple"><div className="stat-value">Video Chat!</div></div>
        </div>
      </div>
      {/* Login Modal */}
      <AuthModal
        isOpen={showLogin}
        mode="login"
        onClose={() => setShowLogin(false)}
        onSubmit={handleLogin}
      />

      {/* Signup Modal */}
      <AuthModal
        isOpen={showSignup}
        mode="signup"
        onClose={() => setShowSignup(false)}
        onSubmit={handleSignup}
      />


    </section>
  );
}
