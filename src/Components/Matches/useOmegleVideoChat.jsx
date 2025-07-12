import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { db } from '../../Firebase';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, setDoc
} from 'firebase/firestore';

export const useOmegleVideoChat = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const myDocRef = useRef(null);
  const unsubQueue = useRef(null);
  const unsubCalls = useRef(null);
  const alreadyHandledCall = useRef(false);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startChat = async () => {
    setIsSearching(true);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = localStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

      const queueRef = collection(db, 'omegleQueue');
      const myDoc = await addDoc(queueRef, { userId, timestamp: Date.now() });
      myDocRef.current = myDoc;

      unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
        const others = snapshot.docs.filter(doc => doc.id !== myDoc.id);
        if (others.length > 0 && !alreadyHandledCall.current) {
          alreadyHandledCall.current = true;

          const otherDoc = others[0];
          const otherUserId = otherDoc.data().userId;
          const chatId = [userId, otherUserId].sort().join('-');
          const callRef = doc(db, 'omegleCalls', chatId);

          const peer = new Peer({ initiator: true, trickle: false, stream: localStream });

          peer.on('signal', signal => {
            setDoc(callRef, { offer: signal, from: userId });
          });

          unsubCalls.current = onSnapshot(callRef, snap => {
            const data = snap.data();
            if (data?.answer && !peer.destroyed && !peer.connected) {
              try {
                peer.signal(data.answer);
              } catch (e) {
                console.error("❌ Failed to apply answer:", e);
              }
            }
          });

          peer.on('stream', stream => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          });

          peer.on('connect', () => {
            console.log("✅ Peer connected");
            setIsConnected(true);
            setIsSearching(false);
          });

          peerRef.current = peer;

          await deleteDoc(myDoc);
          unsubQueue.current && unsubQueue.current();
        }
      });

      listenForIncomingOffers(localStream);
    } catch (err) {
      console.error("🚫 Could not get local media:", err);
      setIsSearching(false);
    }
  };

  const listenForIncomingOffers = (localStream) => {
    const callsRef = collection(db, 'omegleCalls');

    unsubCalls.current = onSnapshot(callsRef, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const chatId = change.doc.id;

        if (data?.offer && data?.from !== userId && !alreadyHandledCall.current) {
          alreadyHandledCall.current = true;

          const peer = new Peer({ initiator: false, trickle: false, stream: localStream });

          peer.on('signal', signal => {
            setDoc(doc(db, 'omegleCalls', chatId), {
              ...data,
              answer: signal,
              to: userId
            }, { merge: true });
          });

          peer.on('stream', stream => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          });

          try {
            peer.signal(data.offer);
          } catch (e) {
            console.error("❌ Failed to apply offer:", e);
          }

          peer.on('connect', () => {
            console.log("✅ Peer connected");
            setIsConnected(true);
            setIsSearching(false);
          });

          peerRef.current = peer;

          if (unsubQueue.current) unsubQueue.current();
          if (myDocRef.current) deleteDoc(myDocRef.current);
        }
      });
    });
  };

  const endChat = () => {
    cleanup();
  };

  const cleanup = () => {
    try {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;

      if (myDocRef.current) {
        deleteDoc(myDocRef.current).catch(() => {});
        myDocRef.current = null;
      }

      if (unsubQueue.current) {
        unsubQueue.current();
        unsubQueue.current = null;
      }

      if (unsubCalls.current) {
        unsubCalls.current();
        unsubCalls.current = null;
      }

      alreadyHandledCall.current = false;
      setIsConnected(false);
      setIsSearching(false);
    } catch (err) {
      console.error("❌ Error during cleanup:", err);
    }
  };

  return {
    startChat,
    endChat,
    isConnected,
    isSearching,
    localVideoRef,
    remoteVideoRef,
    peerRef 
  };
};
