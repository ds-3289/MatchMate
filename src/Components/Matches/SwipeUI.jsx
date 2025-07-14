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
