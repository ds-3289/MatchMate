// import React, { useRef, useEffect, useState } from 'react';
// import './VideoChat.css';

// const VideoChat = ({ isConnected, isSearching, onStartChat, onEndChat }) => {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);

//   useEffect(() => {
//     const initializeMedia = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         setLocalStream(stream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error('Error accessing media devices:', error);
//       }
//     };

//     initializeMedia();

//     return () => {
//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const toggleVideo = () => {
//     if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsVideoEnabled(videoTrack.enabled);
//       }
//     }
//   };

//   const toggleAudio = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsAudioEnabled(audioTrack.enabled);
//       }
//     }
//   };

//   return (
//     <div className="video-d-chat-container">
//       <div className="video-d-grid">
//         {/* Remote Video */}
//         <div className="video-d-box remote-video">
//           {isConnected ? (
//             <video ref={remoteVideoRef} autoPlay playsInline className="video-d-element" />
//           ) : (
//             <div className="video-d-placeholder">
//               {isSearching ? (
//                 <div className="video-d-loading">
//                   <div className="spinner"></div>
//                   <p>Looking for someone to chat with...</p>
//                 </div>
//               ) : (
//                 <div className="video-d-loading">
//                   <div className="placeholder-avatar">
//                     <svg viewBox="0 0 20 20" fill="currentColor" className="user-icon">
//                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <p>No one connected</p>
//                 </div>
//               )}
//             </div>
//           )}
//           {isConnected && <div className="video-d-label">Stranger</div>}
//         </div>

//         {/* Local Video */}
//         <div className="video-d-box local-video">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             className="video-d-element"
//             style={{ transform: 'scaleX(-1)' }}
//           />
//           <div className="video-d-label">You</div>
//           {!isVideoEnabled && (
//             <div className="video-d-overlay">
//               <div className="placeholder-avatar">
//                 <svg viewBox="0 0 20 20" fill="currentColor" className="user-icon">
//                   <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="video-d-controls">
//         <button onClick={toggleVideo} className={`video-d-toggle ${isVideoEnabled ? 'enabled' : 'disabled'}`}>
//           <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
//             <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
//             <path d="M14 8l4-2v8l-4-2V8z" />
//           </svg>
//         </button>

//         <button onClick={toggleAudio} className={`audio-d-toggle ${isAudioEnabled ? 'enabled' : 'disabled'}`}>
//           <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
//             <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.043-.777-3.908-2.05-5.314a1 1 0 010-1.414z" clipRule="evenodd" />
//           </svg>
//         </button>

//         {isConnected ? (
//           <button onClick={onEndChat} className="end-d-chat-btn">End Chat</button>
//         ) : (
//           <button onClick={onStartChat} disabled={isSearching} className="start-d-chat-btn">
//             {isSearching ? 'Searching...' : 'Start Chat'}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoChat;

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
