// import React, { useState, useRef, useEffect } from 'react';
// import './ChatInterface.css';

// const ChatInterface = ({ messages, onSendMessage, isConnected }) => {
//   const [inputMessage, setInputMessage] = useState('');
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputMessage.trim() && isConnected) {
//       onSendMessage(inputMessage.trim());
//       setInputMessage('');
//     }
//   };

//   return (
//     <div className="chat-I-container">
//       <h3 className="chat-I-heading">
//         Chat
//       </h3>

//       <div className="chat-I-messages">
//         {messages.length === 0 ? (
//           <div className="chat-I-placeholder">
//             {isConnected ? '💬 Start a conversation!' : '🔌 Connect to start chatting'}
//           </div>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id}
//               className={`chat-I-message-wrapper ${message.sender === 'me' ? 'outgoing' : 'incoming'}`}
//             >
//               <div
//                 className={`chat-I-bubble ${message.sender === 'me' ? 'bubble-me' : 'bubble-other'}`}
//               >
//                 <p className="chat-I-text">{message.text}</p>
//                 <p className="chat-I-timestamp">{message.timestamp}</p>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSubmit} className="chat-I-form">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder={isConnected ? "Type a message..." : "Connect to chat"}
//           disabled={!isConnected}
//           className="chat-I-input"
//         />
//         <button
//           type="submit"
//           disabled={!isConnected || !inputMessage.trim()}
//           className="chat-I-send-button"
//         >
//           <svg className="send-icon" fill="currentColor" viewBox="0 0 20 20">
//             <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" />
//           </svg>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatInterface;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, isConnected }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (trimmed && isConnected) {
      onSendMessage(trimmed);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-I-container">
      <h3 className="chat-I-heading">Chat</h3>

      <div className="chat-I-messages">
        {messages.length === 0 ? (
          <div className="chat-I-placeholder">
            {isConnected ? '💬 Start a conversation!' : '🔌 Connect to start chatting'}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-I-message-wrapper ${message.sender === 'me' ? 'outgoing' : 'incoming'}`}
            >
              <div
                className={`chat-I-bubble ${message.sender === 'me' ? 'bubble-me' : 'bubble-other'}`}
              >
                <p className="chat-I-text">{message.text}</p>
                <p className="chat-I-timestamp">{message.timestamp}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-I-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connect to chat"}
          disabled={!isConnected}
          className="chat-I-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          className="chat-I-send-button"
        >
          <svg className="send-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;

