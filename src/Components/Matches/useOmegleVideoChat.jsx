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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);
  const MAX_RETRIES = 3;

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const myDocRef = useRef(null);
  const unsubQueue = useRef(null);
  const unsubCalls = useRef(null);
  const unsubCall = useRef(null);
  const alreadyHandledCall = useRef(false);
  const timeoutRef = useRef(null);
  const hasReceivedAnswer = useRef(false);
  const hasReceivedOffer = useRef(false);
  const connectionAttempts = useRef(0);
  const retryTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const lastSignalTime = useRef(null);
  const connectionProgress = useRef(false);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startChat = async () => {
    // Prevent multiple simultaneous start attempts
    if (isSearching || isConnected) {
      console.log('[Omegle] Already searching or connected, ignoring start request');
      return;
    }

    setIsSearching(true);
    setError(null);
    setConnectionStatus('starting');
    connectionAttempts.current++;

    try {
      console.log('Requesting media devices...');
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('Media devices obtained', localStream.getTracks());
      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
      }

      console.log('Adding to queue...');
      const queueRef = collection(db, 'omegleQueue');
      const myDoc = await addDoc(queueRef, {
        userId,
        timestamp: Date.now(),
      });
      myDocRef.current = myDoc;

      setConnectionStatus('searching');
      
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        if (!isConnected) {
          console.log('[Omegle] Connection timeout, retrying...');
          setError('No match found. Try again.');
          cleanup();
        }
      }, 30000); // Increased timeout to 30 seconds

      // Set up listener for incoming offers first
      listenForIncomingOffers(localStream);

      unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
        console.log('[Omegle] Queue snapshot:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        const others = snapshot.docs.filter((doc) => doc.id !== myDoc.id);

        if (others.length > 0 && !alreadyHandledCall.current) {
          console.log('[Omegle] Found match:', { userId, otherUserId: others[0].data().userId, chatId: [userId, others[0].data().userId].sort().join('-') });
          alreadyHandledCall.current = true;
          clearTimeout(timeoutRef.current);

          const otherDoc = others[0];
          const otherUserId = otherDoc.data().userId;
          const chatId = [userId, otherUserId].sort().join('-');
          const callRef = doc(db, 'omegleCalls', chatId);

          console.log('Creating peer as initiator...');
          const peer = createPeer(true, localStream, chatId);

          peer.on('signal', (signal) => {
            console.log('[Omegle] Peer signal generated:', signal.type);
            setDoc(callRef, {
              offer: signal,
              from: userId,
              createdAt: Date.now(),
            }).catch(err => console.error('Error sending offer:', err));
          });

          // Listen for answer on this specific call document
          unsubCall.current = onSnapshot(callRef, (snap) => {
            const data = snap.data();
            console.log('[Omegle] Call snapshot:', data);
            if (
              data?.answer &&
              peerRef.current === peer && // Ensure we're working with the current peer
              !peer.destroyed &&
              !hasReceivedAnswer.current
            ) {
              console.log('[Omegle] Received answer signal from:', data.to);
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
          if (unsubQueue.current) {
            unsubQueue.current();
            unsubQueue.current = null;
          }
        }
      });

    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      cleanup();
    }
  };

  const listenForIncomingOffers = (localStream) => {
    const callsRef = collection(db, 'omegleCalls');

    unsubCalls.current = onSnapshot(callsRef, (snapshot) => {
      console.log('[Omegle] Calls collection snapshot:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const chatId = change.doc.id;
        console.log('[Omegle] Call change:', { chatId, data, changeType: change.type });

        if (
          data?.offer &&
          data?.from !== userId &&
          !alreadyHandledCall.current &&
          !hasReceivedOffer.current
        ) {
          console.log('[Omegle] Received incoming offer from:', data.from);
          alreadyHandledCall.current = true;
          hasReceivedOffer.current = true;
          clearTimeout(timeoutRef.current);

          const peer = createPeer(false, localStream, chatId);

          peer.on('signal', (signal) => {
            console.log('[Omegle] Peer signal generated:', signal.type);
            setDoc(
              doc(db, 'omegleCalls', chatId),
              {
                answer: signal,
                to: userId,
                answeredAt: Date.now(),
              },
              { merge: true }
            ).catch(err => console.error('Error sending answer:', err));
          });

          try {
            console.log('[Omegle] Processing offer signal...');
            peer.signal(data.offer);
          } catch (err) {
            console.error('Failed to process offer:', err);
            handleRetry();
          }

          peerRef.current = peer;

          if (unsubQueue.current) {
            unsubQueue.current();
            unsubQueue.current = null;
          }
          if (myDocRef.current) {
            deleteDoc(myDocRef.current).catch(() => {});
            myDocRef.current = null;
          }
        }
      });
    });
  };

  const createPeer = (initiator, localStream, chatId) => {
    console.log(`Creating new peer (initiator: ${initiator})`);
    
    // Clean up any existing peer first
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efR7uFZ6JhkkTxLN3A',
            credential: 'Fv4hN8aFkGXePYKL',
          },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      },
    });

    // Set connection timeout - increased to allow for TURN server negotiation
    connectionTimeoutRef.current = setTimeout(() => {
      if (peer && !peer.destroyed && !isConnected) {
        console.log('[Omegle] Connection timeout, destroying peer');
        peer.destroy();
        handleRetry();
      }
    }, 30000); // Increased to 30 seconds for TURN server negotiation

    peer.on('stream', (stream) => {
      console.log('[Omegle] Stream event received', stream);
      setRemoteStreamActive(stream.active);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(e => {
            console.error('[Omegle] Remote video play error:', e);
          });
        };
      }
    });

    peer.on('connect', () => {
      console.log('[Omegle] Peer connected!');
      clearTimeout(connectionTimeoutRef.current);
      setIsConnected(true);
      setIsSearching(false);
      setRetryCount(0);
      setConnectionStatus('connected');
      clearTimeout(timeoutRef.current);
    });

    peer.on('error', (err) => {
      console.error('[Omegle] Peer connection error:', err);
      clearTimeout(connectionTimeoutRef.current);
      setError('Connection failed. Retrying...');
      setConnectionStatus('error');
      handleRetry();
    });

    peer.on('close', () => {
      console.log('[Omegle] Peer connection closed');
      clearTimeout(connectionTimeoutRef.current);
      cleanup();
    });

    // Monitor ICE connection state changes
    peer.on('iceConnectionStateChange', () => {
      console.log('[Omegle] ICE connection state:', peer.iceConnectionState);
      setConnectionStatus(peer.iceConnectionState);
      
      // Clear connection timeout when ICE connection is established
      if (peer.iceConnectionState === 'connected' || peer.iceConnectionState === 'completed') {
        console.log('[Omegle] ICE connection established, clearing timeout');
        clearTimeout(connectionTimeoutRef.current);
      }
      
      // Handle failed ICE connections
      if (peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'disconnected') {
        console.log('[Omegle] ICE connection failed/disconnected, retrying...');
        clearTimeout(connectionTimeoutRef.current);
        handleRetry();
      }
    });

    // Monitor connection state changes
    peer.on('connectionStateChange', () => {
      console.log('[Omegle] Connection state:', peer.connectionState);
      setConnectionStatus(peer.connectionState);
      
      // Clear connection timeout when connection is established
      if (peer.connectionState === 'connected') {
        console.log('[Omegle] Connection established, clearing timeout');
        clearTimeout(connectionTimeoutRef.current);
      }
      
      if (peer.connectionState === 'failed') {
        console.log('[Omegle] Connection failed, retrying...');
        clearTimeout(connectionTimeoutRef.current);
        handleRetry();
      }
    });

    // Monitor signaling state changes
    peer.on('signal', (signal) => {
      console.log('[Omegle] Signal event:', signal.type);
      lastSignalTime.current = Date.now();
      connectionProgress.current = true;
      
      // Reset connection timeout when new signals are exchanged
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = setTimeout(() => {
          if (peer && !peer.destroyed && !isConnected) {
            // Only timeout if no recent signal activity
            const timeSinceLastSignal = Date.now() - (lastSignalTime.current || 0);
            if (timeSinceLastSignal > 20000) { // 20 seconds since last signal
              console.log('[Omegle] Connection timeout after signal, destroying peer');
              peer.destroy();
              handleRetry();
            } else {
              console.log('[Omegle] Connection still progressing, extending timeout');
              // Extend timeout since connection is progressing
              connectionTimeoutRef.current = setTimeout(() => {
                if (peer && !peer.destroyed && !isConnected) {
                  console.log('[Omegle] Final connection timeout, destroying peer');
                  peer.destroy();
                  handleRetry();
                }
              }, 20000);
            }
          }
        }, 30000);
      }
    });

    return peer;
  };

  const handleRetry = () => {
    // Don't retry if connection is progressing well
    if (connectionProgress.current && lastSignalTime.current) {
      const timeSinceLastSignal = Date.now() - lastSignalTime.current;
      if (timeSinceLastSignal < 10000) { // Less than 10 seconds since last signal
        console.log('[Omegle] Connection progressing well, not retrying');
        return;
      }
    }
    
    if (retryCount < MAX_RETRIES) {
      console.log(`[Omegle] Retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount((prev) => prev + 1);
      
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      
      // More gradual backoff to allow for connection establishment
      const backoffDelay = Math.min(5000 * (retryCount + 1), 15000); // Max 15 seconds
      retryTimeoutRef.current = setTimeout(() => {
        cleanup(true);
        startChat();
      }, backoffDelay);
    } else {
      console.log('[Omegle] Max retries reached');
      setError('Max retries reached. Please refresh.');
      cleanup();
    }
  };

  const cleanup = (isRetry = false) => {
    try {
      console.log('[Omegle] Cleaning up...');
      
      // Clear all timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      
      if (peerRef.current) {
        console.log('[Omegle] Destroying peer...');
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        console.log('[Omegle] Stopping local stream...');
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (myDocRef.current) {
        console.log('[Omegle] Removing queue document...');
        deleteDoc(myDocRef.current).catch(() => {});
        myDocRef.current = null;
      }

      if (unsubQueue.current) {
        console.log('[Omegle] Unsubscribing from queue...');
        unsubQueue.current();
        unsubQueue.current = null;
      }

      if (unsubCalls.current) {
        console.log('[Omegle] Unsubscribing from calls...');
        unsubCalls.current();
        unsubCalls.current = null;
      }

      if (unsubCall.current) {
        console.log('[Omegle] Unsubscribing from call...');
        unsubCall.current();
        unsubCall.current = null;
      }

      // Reset state flags
      alreadyHandledCall.current = false;
      hasReceivedAnswer.current = false;
      hasReceivedOffer.current = false;
      setRemoteStreamActive(false);
      lastSignalTime.current = null;
      connectionProgress.current = false;
      
      if (!isRetry) {
        setIsConnected(false);
        setIsSearching(false);
        setConnectionStatus('disconnected');
      }
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
    connectionStatus,
    remoteStreamActive,
    retryCount,
  };
};