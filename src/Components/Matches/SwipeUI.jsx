// import React, { useState } from 'react';
// import VideoChat from './VideoChat';
// import ChatInterface from './ChatInterface';
// import ConnectionStatus from './ConnectionStatus';
// import './SwipeUI.css';

// const SwipeUIjsx = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);

//   const handleStartChat = () => {
//     setIsSearching(true);
//     setTimeout(() => {
//       setIsSearching(false);
//       setIsConnected(true);
//       setCurrentUser({ id: 'stranger_123', name: 'Stranger' });
//     }, 2500);
//   };

//   const handleEndChat = () => {
//     setIsConnected(false);
//     setCurrentUser(null);
//     setMessages([]);
//   };

//   const handleSendMessage = (message) => {
//     const newMessage = {
//       id: Date.now(),
//       text: message,
//       sender: 'me',
//       timestamp: new Date().toLocaleTimeString()
//     };
//     setMessages(prev => [...prev, newMessage]);

//     setTimeout(() => {
//       const responses = [
//         "Hey there! How's it going?",
//         "Nice to meet you!",
//         "What are you up to today?",
//         "Cool! Tell me more about that.",
//         "That's interesting!",
//         "I'm good, thanks for asking!",
//         "Where are you from?",
//         "Nice weather today, isn't it?"
//       ];
//       const randomResponse = responses[Math.floor(Math.random() * responses.length)];
//       const responseMessage = {
//         id: Date.now() + 1,
//         text: randomResponse,
//         sender: 'stranger',
//         timestamp: new Date().toLocaleTimeString()
//       };
//       setMessages(prev => [...prev, responseMessage]);
//     }, 1000 + Math.random() * 2000);
//   };

//   return (
//     <div className="swipe-wrapper">
//       <header className="swipe-header">
//         <div className="swipe-header-inner">
//           <h1 className="swipe-title">ChatRoulette</h1>
//           <div className="swipe-status">
//             <span className="swipe-status-text">
//               {isConnected ? 'Connected' : 'Not Connected'}
//             </span>
//             <div className={`swipe-status-indicator ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
//           </div>
//         </div>
//       </header>

//       <main className="swipe-main">
//         <div className="swipe-grid">
//           <div className="swipe-video-section">
//             <VideoChat 
//               isConnected={isConnected}
//               isSearching={isSearching}
//               onStartChat={handleStartChat}
//               onEndChat={handleEndChat}
//             />
//           </div>

//           <div className="swipe-chat-section">
//             <ConnectionStatus 
//               isConnected={isConnected}
//               isSearching={isSearching}
//               currentUser={currentUser}
//             />
//             <ChatInterface 
//               messages={messages}
//               onSendMessage={handleSendMessage}
//               isConnected={isConnected}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SwipeUIjsx;







// import React from 'react';
// import { getAuth } from 'firebase/auth';
// import VideoChat from './VideoChat';
// import ChatInterface from './ChatInterface';
// import ConnectionStatus from './ConnectionStatus';
// import './SwipeUI.css';

// const SwipeUI = () => {
//   const auth = getAuth();
//   const firebaseUser = auth.currentUser;
//   const userId = firebaseUser?.uid || 'anonymous';

//   // Optional: track messages locally if ChatInterface is interactive
//   const [messages, setMessages] = React.useState([]);

//   const handleSendMessage = (message) => {
//     const newMessage = {
//       id: Date.now(),
//       text: message,
//       sender: 'me',
//       timestamp: new Date().toLocaleTimeString(),
//     };
//     setMessages((prev) => [...prev, newMessage]);

//     // Simulate stranger reply (optional demo)
//     setTimeout(() => {
//       const replies = [
//         'Hey there!',
//         'What’s up?',
//         'Tell me something fun!',
//         'Nice to meet you!',
//       ];
//       const responseMessage = {
//         id: Date.now() + 1,
//         text: replies[Math.floor(Math.random() * replies.length)],
//         sender: 'stranger',
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       setMessages((prev) => [...prev, responseMessage]);
//     }, 1500);
//   };

//   return (
//     <div className="swipe-wrapper">
//       <header className="swipe-header">
//         <div className="swipe-header-inner">
//           <h1 className="swipe-title">ChatRoulette</h1>
//           <div className="swipe-status">
//             <span className="swipe-status-text">Omegle Mode</span>
//             <div className="swipe-status-indicator bg-green-500" />
//           </div>
//         </div>
//       </header>

//       <main className="swipe-main">
//         <div className="swipe-grid">
//           {/* 🟢 Video Chat Section */}
//           <div className="swipe-video-section">
//             <VideoChat userId={userId} />
//           </div>

//           {/* 💬 Chat Section (Optional) */}
//           <div className="swipe-chat-section">
//             <ConnectionStatus
//               isConnected={true}
//               isSearching={false}
//               currentUser={{ name: 'Stranger' }}
//             />
//             <ChatInterface
//               messages={messages}
//               onSendMessage={handleSendMessage}
//               isConnected={true}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SwipeUI;







// import React, { useState, useEffect } from 'react';
// import { getAuth } from 'firebase/auth';
// import { db } from '../../Firebase';
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   serverTimestamp,
//   query,
//   orderBy,
// } from 'firebase/firestore';
// import VideoChat from './VideoChat';
// import ChatInterface from './ChatInterface';
// import ConnectionStatus from './ConnectionStatus';
// import { useOmegleVideoChat } from './useOmegleVideoChat';
// import './SwipeUI.css';

// const SwipeUI = () => {
//   const auth = getAuth();
//   const firebaseUser = auth.currentUser;
//   const userId = firebaseUser?.uid || 'anonymous';

//   const {
//     startChat,
//     endChat,
//     isConnected,
//     isSearching,
//     localVideoRef,
//     remoteVideoRef,
//     peerRef
//   } = useOmegleVideoChat(userId);

//   const [chatId, setChatId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [partnerId, setPartnerId] = useState(null);

//   // Automatically create a chatId once connected
//   useEffect(() => {
//     if (isConnected && peerRef.current && !chatId) {
//       // Use stream label as a fallback for unique peerId
//       const remoteDesc = peerRef.current._pc?.remoteDescription?.sdp || '';
//       const extractedId = remoteDesc.match(/a=msid:(.*) /)?.[1] || 'stranger';

//       const newChatId = [userId, extractedId].sort().join('-');
//       setChatId(newChatId);
//       setPartnerId(extractedId);
//     }
//   }, [isConnected, chatId, userId, peerRef]);

//   // Firestore chat message listener
//   useEffect(() => {
//     if (chatId) {
//       const messagesRef = collection(db, 'omegleChats', chatId, 'messages');
//       const q = query(messagesRef, orderBy('timestamp'));

//       const unsub = onSnapshot(q, (snapshot) => {
//         const msgs = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setMessages(msgs);
//       });

//       return () => unsub();
//     }
//   }, [chatId]);

//   const handleSendMessage = async (text) => {
//     if (!chatId) return;

//     const messagesRef = collection(db, 'omegleChats', chatId, 'messages');
//     await addDoc(messagesRef, {
//       sender: userId,
//       text,
//       timestamp: serverTimestamp(),
//     });
//   };

//   return (
//     <div className="swipe-wrapper">
//       <header className="swipe-header">
//         <div className="swipe-header-inner">
//           <h1 className="swipe-title">ChatRoulette</h1>
//           <div className="swipe-status">
//             <span className="swipe-status-text">Omegle Mode</span>
//             <div className="swipe-status-indicator bg-green-500" />
//           </div>
//         </div>
//       </header>

//       <main className="swipe-main">
//         <div className="swipe-grid">
//           {/* 🎥 Video Chat */}
//           <div className="swipe-video-section">
//             <VideoChat
//               userId={userId}
//               startChat={startChat}
//               endChat={endChat}
//               isConnected={isConnected}
//               isSearching={isSearching}
//               localVideoRef={localVideoRef}
//               remoteVideoRef={remoteVideoRef}
//             />
//           </div>

//           {/* 💬 Chat Interface */}
//           <div className="swipe-chat-section">
//             <ConnectionStatus
//               isConnected={isConnected}
//               isSearching={isSearching}
//               currentUser={{ name: partnerId || 'Stranger' }}
//             />
//             <ChatInterface
//               messages={messages.map((msg) => ({
//                 ...msg,
//                 sender: msg.sender === userId ? 'me' : 'stranger',
//               }))}
//               onSendMessage={handleSendMessage}
//               isConnected={isConnected}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SwipeUI;





import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../Firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import VideoChat from './VideoChat';
import ChatInterface from './ChatInterface';
import ConnectionStatus from './ConnectionStatus';
import { useOmegleVideoChat } from './useOmegleVideoChat';
import './SwipeUI.css';

const SwipeUI = () => {
  const auth = getAuth();
  const firebaseUser = auth.currentUser;
  const userId = firebaseUser?.uid || 'anonymous';

  const {
    startChat,
    endChat,
    isConnected,
    isSearching,
    localVideoRef,
    remoteVideoRef,
    peerRef
  } = useOmegleVideoChat(userId);

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerId, setPartnerId] = useState(null);

  // Detect when a peer connects and generate chatId
  useEffect(() => {
    if (!isConnected || chatId || !peerRef?.current) return;

    try {
      const remoteDesc = peerRef.current._pc?.remoteDescription?.sdp || '';
      const extractedId = remoteDesc.match(/a=msid:(.*) /)?.[1] || 'stranger';

      const generatedChatId = [userId, extractedId].sort().join('-');
      setChatId(generatedChatId);
      setPartnerId(extractedId);
    } catch (err) {
      console.warn("⚠️ Could not extract peer ID from SDP:", err);
    }
  }, [isConnected, chatId, userId, peerRef]);

  // Listen to messages in Firestore when chatId is ready
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'omegleChats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  const handleSendMessage = async (text) => {
    if (!chatId) return;

    const messagesRef = collection(db, 'omegleChats', chatId, 'messages');
    await addDoc(messagesRef, {
      sender: userId,
      text,
      timestamp: serverTimestamp(),
    });
  };

  return (
    <div className="swipe-wrapper">
      <header className="swipe-header">
        <div className="swipe-header-inner">
          <h1 className="swipe-title">ChatRoulette</h1>
          <div className="swipe-status">
            <span className="swipe-status-text">Omegle Mode</span>
            <div className="swipe-status-indicator bg-green-500" />
          </div>
        </div>
      </header>

      <main className="swipe-main">
        <div className="swipe-grid">
          <div className="swipe-video-section">
            <VideoChat
              userId={userId}
              startChat={startChat}
              endChat={endChat}
              isConnected={isConnected}
              isSearching={isSearching}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
            />
          </div>

          <div className="swipe-chat-section">
            <ConnectionStatus
              isConnected={isConnected}
              isSearching={isSearching}
              currentUser={{ name: partnerId || 'Stranger' }}
            />
            <ChatInterface
              messages={messages.map((msg) => ({
                ...msg,
                sender: msg.sender === userId ? 'me' : 'stranger',
              }))}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SwipeUI;
