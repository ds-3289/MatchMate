import React, { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import "./Settings.css";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Edit3,
  Heart,
  Trash2,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: false,
    email: true,
  });

  const [privacy, setPrivacy] = useState({
    showAge: true,
    showLocation: true,
    showLastSeen: false,
  });

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion requested");
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      className={`toggle-switch ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    />
  );

  return (
    <div className="settings-wrapper">
      <div className="container">
        <div className="settings-header">
          {/* <Heart className="heart-icon" /> */}
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your MatchMate experience</p>
        </div>

        <div className="settings-content">
          {/* Profile Settings */}
          <div className="romantic-card">
            <div className="section-header">
              <User className="icon" />
              <h2 className="section-title">Profile Settings</h2>
            </div>

            <div>
              <button className="profile-edit-button">
                <Edit3 className="button-icon" />
                Edit Profile
              </button>
              <p className="profile-description">
                Update your photos, bio, interests, and preferences to find your perfect match
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="romantic-card">
            <div className="section-header">
              <Bell className="icon" />
              <h2 className="section-title">Notifications</h2>
            </div>

            {[
              ["New Matches", "newMatches", "Get notified when someone likes you back"],
              ["Messages", "messages", "Receive alerts for new messages"],
              ["Likes", "likes", "Know when someone likes your profile"],
              ["Email Notifications", "email", "Receive updates via email"],
            ].map(([label, key, description]) => (
              <div className="setting-row" key={key}>
                <div className="setting-info">
                  <p className="setting-label">{label}</p>
                  <p className="setting-sub">{description}</p>
                </div>
                <ToggleSwitch
                  checked={notifications[key]}
                  onChange={(value) => handleNotificationChange(key, value)}
                />
              </div>
            ))}
          </div>

          {/* Privacy Settings */}
          <div className="romantic-card">
            <div className="section-header">
              <Shield className="icon" />
              <h2 className="section-title">Privacy & Visibility</h2>
            </div>

            {[
              ["Show Age", "showAge", "Display your age on your profile"],
              ["Show Location", "showLocation", "Let others see your location"],
              ["Show Last Seen", "showLastSeen", "Display when you were last active"],
            ].map(([label, key, description]) => (
              <div className="setting-row" key={key}>
                <div className="setting-info">
                  <p className="setting-label">{label}</p>
                  <p className="setting-sub">{description}</p>
                </div>
                <ToggleSwitch
                  checked={privacy[key]}
                  onChange={(value) => handlePrivacyChange(key, value)}
                />
              </div>
            ))}
          </div>

          {/* Account Actions */}
          <div className="romantic-card">
            <div className="section-header">
              <User className="icon" />
              <h2 className="section-title">Account Actions</h2>
            </div>
            
            <div className="action-buttons">
              <button onClick={handleLogout} className="logout-button">
                <LogOut className="button-icon" />
                Log Out
              </button>

              <button onClick={handleDeleteAccount} className="delete-button">
                <Trash2 className="button-icon" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

