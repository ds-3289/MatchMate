import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../Firebase";
import "./Chat.css";

const Chat = () => {
  const currentUser = auth.currentUser;
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch matched users
  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser) return;

      const matchQuery = query(
        collection(db, "matches"),
        where("users", "array-contains", currentUser.uid)
      );

      const snapshot = await getDocs(matchQuery);
      const otherUsers = [];

      for (const docSnap of snapshot.docs) {
        const users = docSnap.data().users;
        const otherId = users.find((id) => id !== currentUser.uid);

        const userRef = doc(db, "users", otherId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          otherUsers.push({
            id: otherId,
            ...userDoc.data(),
          });
        }
      }

      setMatchedUsers(otherUsers);
    };

    fetchMatches();
  }, [currentUser]);

  // Chat listener
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const chatId = [currentUser.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedChat, currentUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUser || !selectedChat) return;

    const chatId = [currentUser.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");

    try {
      await addDoc(messagesRef, {
        text: trimmed,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      // prune old messages if more than 50
      const snapshot = await getDocs(
        query(messagesRef, orderBy("timestamp", "asc"))
      );
      if (snapshot.size > 50) {
        const extra = snapshot.size - 50;
        const deletions = snapshot.docs.slice(0, extra).map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletions);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  // Cleanup messages (optional)
  const cleanupChat = async () => {
    if (!selectedChat || !currentUser) return;
    const chatId = [currentUser.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const snapshot = await getDocs(messagesRef);
    const deletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletes);
  };

  if (!currentUser) {
    return (
      <div className="chat-wrapper">
        <p>Please log in to use the chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-sidebar">
        <h2>Messages</h2>
        {matchedUsers.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${selectedChat?.id === user.id ? "active" : ""}`}
            onClick={() => setSelectedChat(user)}
          >
            <span>{user.firstName || user.name || "User"}</span>
          </div>
        ))}
      </div>

      <div className="chat-window">
        {!selectedChat ? (
          <div className="chat-placeholder">Select a match to chat</div>
        ) : (
          <>
            <div className="chat-header">
              <h3>{selectedChat.firstName || selectedChat.name}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble ${msg.senderId === currentUser.uid ? "sent" : "received"}`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
