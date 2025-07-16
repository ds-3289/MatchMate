import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { db } from '../../Firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

export const useOmegleVideoChat = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const myDocRef = useRef(null);
  const unsubQueue = useRef(null);
  const unsubCalls = useRef(null);
  const alreadyHandledCall = useRef(false);
  const timeoutRef = useRef(null);
  const hasReceivedAnswer = useRef(false);
  const hasReceivedOffer = useRef(false);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startChat = async () => {
    setIsSearching(true);
    setError(null);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const queueRef = collection(db, 'omegleQueue');
      const myDoc = await addDoc(queueRef, {
        userId,
        timestamp: Date.now(),
      });
      myDocRef.current = myDoc;

      unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
        const others = snapshot.docs.filter((doc) => doc.id !== myDoc.id);

        if (others.length > 0 && !alreadyHandledCall.current) {
          alreadyHandledCall.current = true;

          const otherDoc = others[0];
          const otherUserId = otherDoc.data().userId;
          const chatId = [userId, otherUserId].sort().join('-');
          const callRef = doc(db, 'omegleCalls', chatId);

          const peer = createPeer(true, localStream);

          peer.on('signal', (signal) => {
            setDoc(callRef, {
              offer: signal,
              from: userId,
            });
          });

          unsubCalls.current = onSnapshot(callRef, (snap) => {
            const data = snap.data();
            if (
              data?.answer &&
              !peer.destroyed &&
              peer._pc?.signalingState === 'have-local-offer' &&
              !hasReceivedAnswer.current
            ) {
              hasReceivedAnswer.current = true;
              try {
                peer.signal(data.answer);
              } catch (err) {
                console.error('Failed to process answer:', err);
                handleRetry();
              }
            }
          });

          peerRef.current = peer;
          await deleteDoc(myDoc);
          unsubQueue.current && unsubQueue.current();
        }
      });

      listenForIncomingOffers(localStream);

      timeoutRef.current = setTimeout(() => {
        if (!isConnected) {
          setError('No match found. Try again.');
          cleanup();
        }
      }, 20000);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Could not access camera/microphone.');
      cleanup();
    }
  };

  const listenForIncomingOffers = (localStream) => {
    const callsRef = collection(db, 'omegleCalls');

    unsubCalls.current = onSnapshot(callsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const chatId = change.doc.id;

        if (
          data?.offer &&
          data?.from !== userId &&
          !alreadyHandledCall.current &&
          !hasReceivedOffer.current
        ) {
          alreadyHandledCall.current = true;
          hasReceivedOffer.current = true;

          const peer = createPeer(false, localStream);

          peer.on('signal', (signal) => {
            setDoc(
              doc(db, 'omegleCalls', chatId),
              {
                answer: signal,
                to: userId,
              },
              { merge: true }
            );
          });

          try {
            peer.signal(data.offer);
          } catch (err) {
            console.error('Failed to process offer:', err);
            handleRetry();
          }

          peerRef.current = peer;

          if (unsubQueue.current) unsubQueue.current();
          if (myDocRef.current) deleteDoc(myDocRef.current);
        }
      });
    });
  };

  const createPeer = (initiator, localStream) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efR7uFZ6JhkkTxLN3A',
            credential: 'Fv4hN8aFkGXePYKL',
          },
        ],
        iceCandidatePoolSize: 0,
      },
    });

    peer.on('stream', (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('connect', () => {
      setIsConnected(true);
      setIsSearching(false);
      setRetryCount(0);
      clearTimeout(timeoutRef.current);
    });

    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setError('Connection failed. Retrying...');
      handleRetry();
    });

    peer.on('close', () => {
      cleanup();
    });

    return peer;
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      setTimeout(startChat, 1000 * (retryCount + 1));
    } else {
      setError('Max retries reached. Please refresh.');
      cleanup();
    }
  };

  const cleanup = () => {
    try {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
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

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      alreadyHandledCall.current = false;
      hasReceivedAnswer.current = false;
      hasReceivedOffer.current = false;
      setIsConnected(false);
      setIsSearching(false);
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  };

  return {
    startChat,
    endChat: cleanup,
    isConnected,
    isSearching,
    error,
    localVideoRef,
    remoteVideoRef,
  };
};
