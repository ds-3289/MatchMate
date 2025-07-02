// src/pages/Chat.jsx
import React from "react";
import "./Chat.css";

export default function Chat() {
  return (
    <div className="chat-container">
      <header className="chat-header">Chat</header>
      <div className="chat-messages">
        {/* Example messages */}
        <div className="message received">Hey there!</div>
        <div className="message sent">Hi! How's it going?</div>
      </div>
      <div className="chat-input-area">
        <input type="text" placeholder="Type a message..." className="chat-input" />
        <button className="chat-send-button">Send</button>
      </div>
    </div>
  );
}
