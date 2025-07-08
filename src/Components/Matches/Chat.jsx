import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef();


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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      const snapshot = await getDocs(
        query(messagesRef, orderBy("timestamp", "asc"))
      );
      if (snapshot.size > 50) {
        const extra = snapshot.size - 50;
        const deletions = snapshot.docs
          .slice(0, extra)
          .map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletions);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="chat-wrapper">
        <p className="login-warning">Please log in to use the chat.</p>
      </div>
    );
  }

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

// useEffect(() => {
//   if (!showEmojiPicker) return;

//   // Delay slightly to wait for DOM to render
//   const timeout = setTimeout(() => {
//     const emojis = document.querySelectorAll(".epr-emoji[title]");
//     emojis.forEach((el) => el.removeAttribute("title"));
//   }, 100);

//   return () => clearTimeout(timeout);
// }, [showEmojiPicker]);

useEffect(() => {
  let intervalId;

  if (showEmojiPicker) {
    // Run every 300ms to keep removing titles even on updates
    intervalId = setInterval(() => {
      const emojis = document.querySelectorAll('.epr-emoji[title]');
      emojis.forEach((el) => el.removeAttribute('title'));
    }, 300);
  }

  return () => {
    clearInterval(intervalId);
  };
}, [showEmojiPicker]);


useEffect(() => {
  if (!showEmojiPicker) return;

  const removeEmojiTitles = () => {
    const emojiElements = document.querySelectorAll(".epr-emoji[title]");
    emojiElements.forEach((el) => el.removeAttribute("title"));
  };

  // Run it once after picker appears
  const timeout = setTimeout(removeEmojiTitles, 100);

  // Optional: observe changes (category switches, etc.)
  const observer = new MutationObserver(removeEmojiTitles);
  const target = document.querySelector(".EmojiPickerReact");

  if (target) {
    observer.observe(target, { childList: true, subtree: true });
  }

  return () => {
    clearTimeout(timeout);
    observer.disconnect();
  };
}, [showEmojiPicker]);

useEffect(() => {
  let animationFrameId;

  const removeEmojiTitles = () => {
    const emojiButtons = document.querySelectorAll(".epr-emoji[title]");
    emojiButtons.forEach((btn) => btn.removeAttribute("title"));
    animationFrameId = requestAnimationFrame(removeEmojiTitles);
  };

  if (showEmojiPicker) {
    animationFrameId = requestAnimationFrame(removeEmojiTitles);
  }

  return () => cancelAnimationFrame(animationFrameId);
}, [showEmojiPicker]);


  const onEmojiClick = (emojiData) => {
  setNewMessage((prev) => prev + emojiData.emoji);
};


  return (
    <div className="chat-wrapper">
      <div className="chat-sidebar">
        <h2>💌 Messages</h2>
        {matchedUsers.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${
              selectedChat?.id === user.id ? "active" : ""
            }`}
            onClick={() => setSelectedChat(user)}
          >
            <span>{user.firstName || user.name || "User"}</span>
          </div>
        ))}
      </div>

      <div className="chat-window">
        {!selectedChat ? (
          <div className="chat-placeholder">✨ Select someone to start chatting ✨</div>
        ) : (
          <>
            <div className="chat-header">
              <h3>{selectedChat.firstName || selectedChat.name}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble ${
                    msg.senderId === currentUser.uid ? "sent" : "received"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <button
                className="emoji-toggle-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
                  <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={450} />
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
