import React from 'react';
import './ConnectionStatus.css';

const ConnectionStatus = ({ isConnected, isSearching, currentUser }) => {
  return (
    <div className="connection-status">
      <div className="status-top">
        <div>
          <h3 className="status-label">Status</h3>
          <p className="status-value">
            {isSearching ? (
              <span className="status-searching">🔍 Searching...</span>
            ) : isConnected ? (
              <span className="status-connected">✅ Connected</span>
            ) : (
              <span className="status-disconnected">⭕ Disconnected</span>
            )}
          </p>
        </div>

        <div className="status-indicator">
          {isSearching && (
            <div className="pulse-dot purple"></div>
          )}
          {isConnected && (
            <div className="status-chatting">
              <div className="pulse-dot green"></div>
              <span className="chatting-label">
                💬 Chatting with {currentUser?.name || 'Stranger'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isConnected && (
        <div className="status-tip">
          <p className="tip-text">
            💡 Tip: Be respectful and have fun chatting!
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
