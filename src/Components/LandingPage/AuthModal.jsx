import React, { useState } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { X } from 'lucide-react';
import './AuthModal.css'; 
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider , db } from "../../Firebase";
import { useNavigate } from "react-router-dom";


const AuthModal = ({ isOpen, mode, onClose, onSubmit }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onSubmit(email, password);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("User signed in with Google:", user);
    alert("Signed in with Google!");

    // Check if user profile exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      navigate("/new");
    } else {
      await setDoc(userDocRef, {
        email: user.email,
        createdAt: new Date(),
        bio: null,
      });
      navigate("/bio");
    }

    onClose(); // close modal
  } catch (error) {
    console.error("Google sign-in error:", error);
    alert(error.message);
  }
};

  return (
    <div className="auth-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal-container">
        <div className="auth-modal-blur" />
        <div className="auth-modal-box">
          <button onClick={onClose} className="auth-close-btn">
            <X size={20} />
          </button>
          <div className="auth-header">
            <h2>{mode === 'login' ? 'Welcome Back!' : 'Join the Adventure!'}</h2>
            <p>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'signup' && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            <button type="submit" className="auth-submit-btn">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            <div className="auth-divider">or continue with</div>
            <div className="auth-socials">
              <button type="button" onClick={handleGoogleLogin}>Google</button>
              {/* <button type="button">Facebook</button> */}
            </div>
          </form>
          <div className="auth-footer">
            <p>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span className="auth-toggle-text">{
                mode === 'login' ? 'Sign up' : 'Sign in'
              }</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


