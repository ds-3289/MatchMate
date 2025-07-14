import React from 'react';
import './VideoChat.css';
import { useOmegleVideoChat } from './useOmegleVideoChat';

const VideoChat = ({ userId }) => {
  const {
    startChat,
    endChat,
    isConnected,
    isSearching,
    localVideoRef,
    remoteVideoRef,
  } = useOmegleVideoChat(userId);

  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);

  const toggleVideo = () => {
    const track = localVideoRef.current?.srcObject?.getVideoTracks?.()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localVideoRef.current?.srcObject?.getAudioTracks?.()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    }
  };

  return (
    <div className="video-d-chat-container">
      <div className="video-d-grid">
        {/* Remote Video */}
        <div className="video-d-box remote-video">
          {isConnected ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="video-d-element" />
          ) : (
            <div className="video-d-placeholder">
              {isSearching ? (
                <div className="video-d-loading">
                  <div className="spinner"></div>
                  <p>Looking for someone to chat with...</p>
                </div>
              ) : (
                <div className="video-d-loading">
                  <div className="placeholder-avatar">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="user-icon">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>No one connected</p>
                </div>
              )}
            </div>
          )}
          {isConnected && <div className="video-d-label">Stranger</div>}
        </div>

        {/* Local Video */}
        <div className="video-d-box local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-d-element"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="video-d-label">You</div>
          {!isVideoEnabled && (
            <div className="video-d-overlay">
              <div className="placeholder-avatar">
                <svg viewBox="0 0 20 20" fill="currentColor" className="user-icon">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="video-d-controls">
        <button onClick={toggleVideo} className={`video-d-toggle ${isVideoEnabled ? 'enabled' : 'disabled'}`}>
          🎥
        </button>
        <button onClick={toggleAudio} className={`audio-d-toggle ${isAudioEnabled ? 'enabled' : 'disabled'}`}>
          🎤
        </button>
        {isConnected ? (
          <button onClick={endChat} className="end-d-chat-btn">End Chat</button>
        ) : (
          <button onClick={startChat} disabled={isSearching} className="start-d-chat-btn">
            {isSearching ? 'Searching...' : 'Start Chat'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
