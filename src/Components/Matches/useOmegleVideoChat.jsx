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

/**
 * Refactored useOmegleVideoChat hook
 * - Reuses local media stream across retries (avoids camera re-lock)
 * - Guards against double-destroy and stray timeouts
 * - Keeps signaling writes (offer/answer) OUTSIDE createPeer to avoid duplication
 * - Hardens cleanup and unsubscribe logic
 * - Adds onbeforeunload safety cleanup
 */
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
    const handleUnload = () => {
      try {
        cleanup(false, { keepLocalStream: false });
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      cleanup(false, { keepLocalStream: false });
    };
  }, []);

  const ensureLocalStream = async () => {
    // Reuse existing active stream across retries
    const existing = localStreamRef.current;
    const hasActive = !!existing && existing.getTracks().some(t => t.readyState === 'live');
    if (hasActive) return existing;

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = localStream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play?.().catch(() => {});
    }
    return localStream;
  };

  const startChat = async () => {
    if (isSearching || isConnected) {
      console.log('[Omegle] Already searching or connected, ignoring start request');
      return;
    }

    setIsSearching(true);
    setError(null);
    setConnectionStatus('starting');
    connectionAttempts.current++;

    try {
      console.log('[Omegle] Ensuring media devices...');
      const localStream = await ensureLocalStream();

      console.log('[Omegle] Adding to queue...');
      const queueRef = collection(db, 'omegleQueue');
      const myDoc = await addDoc(queueRef, {
        userId,
        timestamp: Date.now(),
      });
      myDocRef.current = myDoc;

      setConnectionStatus('searching');

      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Queue wait timeout
      timeoutRef.current = setTimeout(() => {
        if (!isConnected) {
          console.log('[Omegle] Queue timeout, retrying...');
          setError('No match found. Try again.');
          cleanup(true, { keepLocalStream: true });
          handleRetry();
        }
      }, 30000);

      // Listen for incoming offers first
      listenForIncomingOffers(localStream);

      unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
        const others = snapshot.docs.filter((doc) => doc.id !== myDoc.id);

        if (others.length > 0 && !alreadyHandledCall.current) {
          console.log('[Omegle] Found match:', {
            userId,
            otherUserId: others[0].data().userId,
            chatId: [userId, others[0].data().userId].sort().join('-'),
          });
          alreadyHandledCall.current = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          // Ensure we don't have an existing peer
          if (peerRef.current && !peerRef.current.destroyed) {
            console.log('[Omegle] Cleaning up existing peer before creating new one');
            try { peerRef.current.destroy(); } catch {}
            peerRef.current = null;
          }

          const otherDoc = others[0];
          const otherUserId = otherDoc.data().userId;
          const chatId = [userId, otherUserId].sort().join('-');
          const callRef = doc(db, 'omegleCalls', chatId);

          console.log('[Omegle] Creating peer as initiator...');
          await new Promise(r => setTimeout(r, 100));
          const peer = createPeer(true, localStream, chatId);

          // Only progress/timeouts handled in createPeer's 'signal'.
          // Firestore writes happen here:
          peer.on('signal', (signal) => {
            if (!peer || peer.destroyed || peerRef.current !== peer) return;
            if (signal?.type !== 'offer') return; // initiator only sends offer here
            setDoc(callRef, {
              offer: signal,
              from: userId,
              createdAt: Date.now(),
            }).catch(err => console.error('[Omegle] Error sending offer:', err));
          });

          // Listen for answer on this specific call document
          unsubCall.current = onSnapshot(callRef, (snap) => {
            const data = snap.data();
            if (
              data?.answer &&
              peerRef.current === peer &&
              !peer.destroyed &&
              !hasReceivedAnswer.current
            ) {
              hasReceivedAnswer.current = true;
              try { peer.signal(data.answer); } catch (err) {
                console.error('[Omegle] Failed to process answer:', err);
                handleRetry();
              }
            }
          });

          peerRef.current = peer;
          try { await deleteDoc(myDoc); } catch {}
          if (unsubQueue.current) { unsubQueue.current(); unsubQueue.current = null; }
        }
      });

    } catch (err) {
      console.error('[Omegle] Error starting chat:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      cleanup(false, { keepLocalStream: false });
    }
  };

  const listenForIncomingOffers = (localStream) => {
    const callsRef = collection(db, 'omegleCalls');

    // Re-subscribe cleanly
    if (unsubCalls.current) { unsubCalls.current(); unsubCalls.current = null; }

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
          console.log('[Omegle] Received incoming offer from:', data.from);
          alreadyHandledCall.current = true;
          hasReceivedOffer.current = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          const peer = createPeer(false, localStream, chatId);

          // Only answer here; we do not write offers from createPeer
          peer.on('signal', (signal) => {
            if (!peer || peer.destroyed || peerRef.current !== peer) return;
            if (signal?.type !== 'answer') return; // receiver only sends answer here
            setDoc(
              doc(db, 'omegleCalls', chatId),
              { answer: signal, to: userId, answeredAt: Date.now() },
              { merge: true }
            ).catch(err => console.error('[Omegle] Error sending answer:', err));
          });

          try {
            peer.signal(data.offer);
          } catch (err) {
            console.error('[Omegle] Failed to process offer:', err);
            handleRetry();
          }

          peerRef.current = peer;

          if (unsubQueue.current) { unsubQueue.current(); unsubQueue.current = null; }
          if (myDocRef.current) { try { deleteDoc(myDocRef.current); } catch {} myDocRef.current = null; }
        }
      });
    });
  };

  const createPeer = (initiator, localStream, chatId) => {
    console.log(`[Omegle] Creating new peer (initiator: ${initiator}) for ${chatId}`);

    // Clean up any existing peer first
    if (peerRef.current && !peerRef.current.destroyed) {
      try { peerRef.current.destroy(); } catch {}
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

    // Connection timeout (reset on signals)
    const setConnTimeout = (ms) => {
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = setTimeout(() => {
        if (peer && !peer.destroyed && !isConnected) {
          const since = Date.now() - (lastSignalTime.current || 0);
          if (since > 20000) {
            console.log('[Omegle] Connection timeout, destroying peer');
            try { peer.destroy(); } catch {}
            handleRetry();
          } else {
            // give it one more window
            setConnTimeout(20000);
          }
        }
      }, ms);
    };

    setConnTimeout(30000);

    // Progress-only signal handler (no Firestore writes here)
    peer.on('signal', (signal) => {
      lastSignalTime.current = Date.now();
      connectionProgress.current = true;
      setConnTimeout(30000);
    });

    peer.on('stream', (stream) => {
      setRemoteStreamActive(stream.active);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play?.().catch(() => {});
        };
      }
    });

    peer.on('connect', () => {
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      setIsConnected(true);
      setIsSearching(false);
      setRetryCount(0);
      setConnectionStatus('connected');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    });

    peer.on('error', (err) => {
      console.error('[Omegle] Peer error:', err);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      if (!peer.destroyed) {
        setError('Connection failed. Retrying...');
        setConnectionStatus('error');
        handleRetry();
      }
    });

    peer.on('close', () => {
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      if (peerRef.current === peer) {
        cleanup(false, { keepLocalStream: true });
      }
    });

    // ICE + Connection state tracing
    peer.on('iceConnectionStateChange', () => {
      // @ts-ignore internal prop for tracing only (safe in dev)
      const s = peer.iceConnectionState;
      setConnectionStatus(s);
      if (s === 'connected' || s === 'completed') {
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      }
      if (s === 'failed' || s === 'disconnected') {
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        if (peerRef.current === peer && !peer.destroyed) {
          handleRetry();
        }
      }
    });

    peer.on('connectionStateChange', () => {
      // @ts-ignore internal prop
      const cs = peer.connectionState;
      setConnectionStatus(cs);
      if (cs === 'connected') {
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      } else if (cs === 'failed') {
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        if (peerRef.current === peer && !peer.destroyed) {
          handleRetry();
        }
      }
    });

    return peer;
  };

  const handleRetry = () => {
    // Don’t spam retries if signals are flowing
    if (connectionProgress.current && lastSignalTime.current) {
      const timeSinceLastSignal = Date.now() - lastSignalTime.current;
      if (timeSinceLastSignal < 10000) {
        console.log('[Omegle] Connection progressing; skip retry');
        return;
      }
    }

    if (isConnected) return;
    if (peerRef.current && peerRef.current.destroyed) return;

    if (retryCount < MAX_RETRIES) {
      const next = retryCount + 1;
      console.log(`[Omegle] Retrying... (attempt ${next}/${MAX_RETRIES})`);
      setRetryCount(next);

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      const backoffDelay = Math.min(5000 * next, 15000);
      retryTimeoutRef.current = setTimeout(() => {
        cleanup(true, { keepLocalStream: true });
        startChat();
      }, backoffDelay);
    } else {
      console.log('[Omegle] Max retries reached');
      setError('Max retries reached. Please refresh.');
      cleanup(false, { keepLocalStream: true });
    }
  };

  /**
   * cleanup
   * @param {boolean} isRetry When true, we keep global state like searching and do not reset UI as much
   * @param {{ keepLocalStream?: boolean }} opts Control whether to keep the local media stream alive
   */
  const cleanup = (isRetry = false, opts = { keepLocalStream: false }) => {
    try {
      console.log('[Omegle] Cleaning up...');

      // Clear all timeouts
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      if (retryTimeoutRef.current) { clearTimeout(retryTimeoutRef.current); retryTimeoutRef.current = null; }
      if (connectionTimeoutRef.current) { clearTimeout(connectionTimeoutRef.current); connectionTimeoutRef.current = null; }

      if (peerRef.current && !peerRef.current.destroyed) {
        console.log('[Omegle] Destroying peer...');
        try { peerRef.current.destroy(); } catch {}
      }
      peerRef.current = null;

      if (!opts.keepLocalStream && localStreamRef.current) {
        console.log('[Omegle] Stopping local stream...');
        try { localStreamRef.current.getTracks().forEach((t) => t.stop()); } catch {}
        localStreamRef.current = null;
      }

      if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = null; }
      if (localVideoRef.current && !opts.keepLocalStream) { localVideoRef.current.srcObject = null; }

      if (myDocRef.current) {
        console.log('[Omegle] Removing queue document...');
        try { deleteDoc(myDocRef.current); } catch {}
        myDocRef.current = null;
      }

      if (unsubQueue.current) { console.log('[Omegle] Unsubscribing from queue...'); unsubQueue.current(); unsubQueue.current = null; }
      if (unsubCalls.current) { console.log('[Omegle] Unsubscribing from calls...'); unsubCalls.current(); unsubCalls.current = null; }
      if (unsubCall.current) { console.log('[Omegle] Unsubscribing from call...'); unsubCall.current(); unsubCall.current = null; }

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
      console.error('[Omegle] Cleanup error:', err);
    }
  };

  return {
    startChat,
    endChat: () => cleanup(false, { keepLocalStream: false }),
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
