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
    navigate("/"); // redirect to landing page
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  return (
    <div className="settings-wrapper">
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-romantic-rose mx-auto mb-4 animate-heart-beat" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your MatchMate experience</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Settings */}
          <div className="card romantic-card p-6">
            <div className="section-header">
              <User className="icon" />
              <h2 className="section-title">Profile Settings</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-start romantic-button">
                <Edit3 className="w-4 h-4 mr-3" />
                Edit Profile
              </button>
              <p className="text-sm text-gray-600 px-3">
                Update your photos, bio, interests, and preferences
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card romantic-card p-6">
            <div className="section-header">
              <Bell className="icon" />
              <h2 className="section-title">Notifications</h2>
            </div>

            {[
              ["New Matches", "newMatches"],
              ["Messages", "messages"],
              ["Likes", "likes"],
              ["Email Notifications", "email"],
            ].map(([label, key]) => (
              <div className="setting-row" key={key}>
                <div>
                  <p className="setting-label">{label}</p>
                  <p className="setting-sub">
                    Get notified about {label.toLowerCase()}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) =>
                    handleNotificationChange(key, e.target.checked)
                  }
                />
              </div>
            ))}
          </div>

          {/* Privacy Settings */}
          <div className="card romantic-card p-6">
            <div className="section-header">
              <Shield className="icon" />
              <h2 className="section-title">Privacy</h2>
            </div>

            {[
              ["Show Age", "showAge"],
              ["Show Location", "showLocation"],
              ["Show Last Seen", "showLastSeen"],
            ].map(([label, key]) => (
              <div className="setting-row" key={key}>
                <div>
                  <p className="setting-label">{label}</p>
                  <p className="setting-sub">
                    Control who sees your {label.toLowerCase()}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy[key]}
                  onChange={(e) =>
                    handlePrivacyChange(key, e.target.checked)
                  }
                />
              </div>
            ))}
          </div>

          {/* Account Actions */}
          <div className="card romantic-card p-6 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-start border border-gray-300 hover:bg-gray-50 p-2 rounded"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log Out
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-start border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 p-2 rounded"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
