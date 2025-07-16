// import { useEffect, useRef, useState } from 'react';
// import Peer from 'simple-peer';
// import { db } from '../../Firebase';
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   setDoc,
// } from 'firebase/firestore';

// export const useOmegleVideoChat = (userId) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const MAX_RETRIES = 3;

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const myDocRef = useRef(null);
//   const unsubQueue = useRef(null);
//   const unsubCalls = useRef(null);
//   const alreadyHandledCall = useRef(false);
//   const timeoutRef = useRef(null);
//   const hasReceivedAnswer = useRef(false);
//   const hasReceivedOffer = useRef(false);

//   useEffect(() => {
//     return () => {
//       cleanup();
//     };
//   }, []);

//   const startChat = async () => {
//     setIsSearching(true);
//     setError(null);

//     try {
//       const localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localStreamRef.current = localStream;
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = localStream;
//       }

//       const queueRef = collection(db, 'omegleQueue');
//       const myDoc = await addDoc(queueRef, {
//         userId,
//         timestamp: Date.now(),
//       });
//       myDocRef.current = myDoc;

//       unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
//         const others = snapshot.docs.filter((doc) => doc.id !== myDoc.id);

//         if (others.length > 0 && !alreadyHandledCall.current) {
//           alreadyHandledCall.current = true;

//           const otherDoc = others[0];
//           const otherUserId = otherDoc.data().userId;
//           const chatId = [userId, otherUserId].sort().join('-');
//           const callRef = doc(db, 'omegleCalls', chatId);

//           const peer = createPeer(true, localStream);

//           peer.on('signal', (signal) => {
//             setDoc(callRef, {
//               offer: signal,
//               from: userId,
//             });
//           });

//           unsubCalls.current = onSnapshot(callRef, (snap) => {
//             const data = snap.data();
//             if (
//               data?.answer &&
//               !peer.destroyed &&
//               peer._pc?.signalingState === 'have-local-offer' &&
//               !hasReceivedAnswer.current
//             ) {
//               hasReceivedAnswer.current = true;
//               try {
//                 peer.signal(data.answer);
//               } catch (err) {
//                 console.error('Failed to process answer:', err);
//                 handleRetry();
//               }
//             }
//           });

//           peerRef.current = peer;
//           await deleteDoc(myDoc);
//           unsubQueue.current && unsubQueue.current();
//         }
//       });

//       listenForIncomingOffers(localStream);

//       timeoutRef.current = setTimeout(() => {
//         if (!isConnected) {
//           setError('No match found. Try again.');
//           cleanup();
//         }
//       }, 20000);
//     } catch (err) {
//       console.error('Error starting chat:', err);
//       setError('Could not access camera/microphone.');
//       cleanup();
//     }
//   };

//   const listenForIncomingOffers = (localStream) => {
//     const callsRef = collection(db, 'omegleCalls');

//     unsubCalls.current = onSnapshot(callsRef, (snapshot) => {
//       snapshot.docChanges().forEach((change) => {
//         const data = change.doc.data();
//         const chatId = change.doc.id;

//         if (
//           data?.offer &&
//           data?.from !== userId &&
//           !alreadyHandledCall.current &&
//           !hasReceivedOffer.current
//         ) {
//           alreadyHandledCall.current = true;
//           hasReceivedOffer.current = true;

//           const peer = createPeer(false, localStream);

//           peer.on('signal', (signal) => {
//             setDoc(
//               doc(db, 'omegleCalls', chatId),
//               {
//                 answer: signal,
//                 to: userId,
//               },
//               { merge: true }
//             );
//           });

//           try {
//             peer.signal(data.offer);
//           } catch (err) {
//             console.error('Failed to process offer:', err);
//             handleRetry();
//           }

//           peerRef.current = peer;

//           if (unsubQueue.current) unsubQueue.current();
//           if (myDocRef.current) deleteDoc(myDocRef.current);
//         }
//       });
//     });
//   };

//   const createPeer = (initiator, localStream) => {
//     const peer = new Peer({
//       initiator,
//       trickle: false,
//       stream: localStream,
//       config: {
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' },
//           {
//             urls: 'turn:relay1.expressturn.com:3478',
//             username: 'efR7uFZ6JhkkTxLN3A',
//             credential: 'Fv4hN8aFkGXePYKL',
//           },
//         ],
//         iceCandidatePoolSize: 0,
//       },
//     });

//     peer.on('stream', (stream) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = stream;
//       }
//     });

//     peer.on('connect', () => {
//       setIsConnected(true);
//       setIsSearching(false);
//       setRetryCount(0);
//       clearTimeout(timeoutRef.current);
//     });

//     peer.on('error', (err) => {
//       console.error('Peer connection error:', err);
//       setError('Connection failed. Retrying...');
//       handleRetry();
//     });

//     peer.on('close', () => {
//       cleanup();
//     });

//     return peer;
//   };

//   const handleRetry = () => {
//     if (retryCount < MAX_RETRIES) {
//       setRetryCount((prev) => prev + 1);
//       setTimeout(startChat, 1000 * (retryCount + 1));
//     } else {
//       setError('Max retries reached. Please refresh.');
//       cleanup();
//     }
//   };

//   const cleanup = () => {
//     try {
//       if (peerRef.current) {
//         peerRef.current.destroy();
//         peerRef.current = null;
//       }

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//         localStreamRef.current = null;
//       }

//       if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//       if (localVideoRef.current) localVideoRef.current.srcObject = null;

//       if (myDocRef.current) {
//         deleteDoc(myDocRef.current).catch(() => {});
//         myDocRef.current = null;
//       }

//       if (unsubQueue.current) {
//         unsubQueue.current();
//         unsubQueue.current = null;
//       }

//       if (unsubCalls.current) {
//         unsubCalls.current();
//         unsubCalls.current = null;
//       }

//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//         timeoutRef.current = null;
//       }

//       alreadyHandledCall.current = false;
//       hasReceivedAnswer.current = false;
//       hasReceivedOffer.current = false;
//       setIsConnected(false);
//       setIsSearching(false);
//     } catch (err) {
//       console.error('Cleanup error:', err);
//     }
//   };

//   return {
//     startChat,
//     endChat: cleanup,
//     isConnected,
//     isSearching,
//     error,
//     localVideoRef,
//     remoteVideoRef,
//   };
// };



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
  const connectionAttempts = useRef(0);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startChat = async () => {
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
      }

      console.log('Adding to queue...');
      const queueRef = collection(db, 'omegleQueue');
      const myDoc = await addDoc(queueRef, {
        userId,
        timestamp: Date.now(),
      });
      myDocRef.current = myDoc;

      setConnectionStatus('searching');
      unsubQueue.current = onSnapshot(queueRef, async (snapshot) => {
        const others = snapshot.docs.filter((doc) => doc.id !== myDoc.id);

        if (others.length > 0 && !alreadyHandledCall.current) {
          console.log('Potential match found');
          alreadyHandledCall.current = true;

          const otherDoc = others[0];
          const otherUserId = otherDoc.data().userId;
          const chatId = [userId, otherUserId].sort().join('-');
          const callRef = doc(db, 'omegleCalls', chatId);

          console.log('Creating peer as initiator...');
          const peer = createPeer(true, localStream, chatId);

          peer.on('signal', (signal) => {
            console.log('Sending offer signal...');
            setDoc(callRef, {
              offer: signal,
              from: userId,
              createdAt: Date.now(),
            }).catch(err => console.error('Error sending offer:', err));
          });

          unsubCalls.current = onSnapshot(callRef, (snap) => {
            const data = snap.data();
            if (
              data?.answer &&
              !peer.destroyed &&
              peer._pc?.signalingState === 'have-local-offer' &&
              !hasReceivedAnswer.current
            ) {
              console.log('Received answer signal');
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
          console.log('Connection timeout reached');
          setError('No match found. Try again.');
          cleanup();
        }
      }, 20000);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Could not access camera/microphone. Please check permissions.');
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
          console.log('Received incoming offer');
          alreadyHandledCall.current = true;
          hasReceivedOffer.current = true;

          const peer = createPeer(false, localStream, chatId);

          peer.on('signal', (signal) => {
            console.log('Sending answer signal...');
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
            console.log('Processing offer signal...');
            peer.signal(data.offer);
          } catch (err) {
            console.error('Failed to process offer:', err);
            handleRetry();
          }

          peerRef.current = peer;

          if (unsubQueue.current) unsubQueue.current();
          if (myDocRef.current) deleteDoc(myDocRef.current).catch(() => {});
        }
      });
    });
  };

  const createPeer = (initiator, localStream, chatId) => {
    console.log(`Creating new peer (initiator: ${initiator})`);
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efR7uFZ6JhkkTxLN3A',
            credential: 'Fv4hN8aFkGXePYKL',
          },
        ],
        iceCandidatePoolSize: 10,
      },
    });

    peer.on('stream', (stream) => {
      console.log('Stream event received', stream);
      setRemoteStreamActive(stream.active);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(e => console.error('Video play error:', e));
      }
    });

    peer.on('connect', () => {
      console.log('Peer connected!');
      setIsConnected(true);
      setIsSearching(false);
      setRetryCount(0);
      setConnectionStatus('connected');
      clearTimeout(timeoutRef.current);
    });

    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setError('Connection failed. Retrying...');
      setConnectionStatus('error');
      handleRetry();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      cleanup();
    });

    peer.on('signal', (data) => {
      console.log('Signal event:', data.type);
    });

    peer.on('iceConnectionStateChange', () => {
      console.log('ICE connection state:', peer.iceConnectionState);
      setConnectionStatus(peer.iceConnectionState);
    });

    peer.on('connectionStateChange', () => {
      console.log('Connection state:', peer.connectionState);
    });

    return peer;
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying... (attempt ${retryCount + 1})`);
      setRetryCount((prev) => prev + 1);
      setTimeout(() => {
        cleanup(true);
        startChat();
      }, 1000 * (retryCount + 1));
    } else {
      console.log('Max retries reached');
      setError('Max retries reached. Please refresh.');
      cleanup();
    }
  };

  const cleanup = (isRetry = false) => {
    try {
      console.log('Cleaning up...');
      
      if (peerRef.current) {
        console.log('Destroying peer...');
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        console.log('Stopping local stream...');
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
        console.log('Removing queue document...');
        deleteDoc(myDocRef.current).catch(() => {});
        myDocRef.current = null;
      }

      if (unsubQueue.current) {
        console.log('Unsubscribing from queue...');
        unsubQueue.current();
        unsubQueue.current = null;
      }

      if (unsubCalls.current) {
        console.log('Unsubscribing from calls...');
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
      setRemoteStreamActive(false);
      
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