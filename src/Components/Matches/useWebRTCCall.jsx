import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../Firebase";

const useWebRTCCall = (currentUser, remoteUser) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState(null);
  const peerRef = useRef(null);
  const hasSignaledAnswer = useRef(false);
  const unsubscribeRef = useRef(null); // To store the Firestore unsubscribe function

  const startCall = async (type = "video") => {
    try {
      console.log("📞 Starting call...");
      console.log("Caller:", currentUser?.uid);
      console.log("Receiver:", remoteUser?.id);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });

      console.log("🎥 Got local stream");
      setLocalStream(stream);

      const newCallId = [currentUser.uid, remoteUser.id].sort().join("_");
      setCallId(newCallId);

      const callRef = doc(db, "calls", newCallId);

      peerRef.current = new Peer({ initiator: true, trickle: false, stream });

      peerRef.current.on("signal", async (offer) => {
        try {
          console.log("📡 Got signal. Saving offer to Firestore...");
          await setDoc(callRef, {
            offer,
            from: currentUser.uid,
            to: remoteUser.id,
            type,
          });
          console.log("✅ Offer saved to Firestore:", callRef.path);
        } catch (error) {
          console.error("❌ Error saving offer to Firestore:", error);
        }
      });

      peerRef.current.on("stream", (stream) => {
        console.log("📥 Received remote stream");
        setRemoteStream(stream);
      });

      peerRef.current.on("connect", () => {
        console.log("✅ Peer connected successfully");
      });

      peerRef.current.on("error", (err) => {
        console.error("❌ Peer connection error:", err);
      });

      // Set up Firestore listener for answer
      unsubscribeRef.current = onSnapshot(callRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.answer && !hasSignaledAnswer.current && peerRef.current && !peerRef.current.destroyed) {
          try {
            console.log("📲 Received answer signal");
            peerRef.current.signal(data.answer);
            hasSignaledAnswer.current = true;
          } catch (err) {
            console.error("❌ Error signaling answer:", err);
          }
        }
      });

    } catch (err) {
      console.error("❌ Error in startCall:", err);
    }
  };

  const answerCall = async (incomingCallData) => {
    try {
      console.log("📲 Answering call:", incomingCallData.id);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCallData.type === "video",
        audio: true,
      });

      console.log("🎥 Got local stream for answering");
      setLocalStream(stream);

      const callRef = doc(db, "calls", incomingCallData.id);
      setCallId(incomingCallData.id);

      peerRef.current = new Peer({ initiator: false, trickle: false, stream });

      peerRef.current.on("signal", async (answer) => {
        try {
          console.log("📡 Sending answer to Firestore...");
          await updateDoc(callRef, { answer });
          console.log("✅ Answer updated in Firestore");
        } catch (error) {
          console.error("❌ Error updating answer in Firestore:", error);
        }
      });

      peerRef.current.on("stream", (stream) => {
        console.log("📥 Received remote stream");
        setRemoteStream(stream);
      });

      peerRef.current.on("connect", () => {
        console.log("✅ Peer connected successfully");
      });

      peerRef.current.on("error", (err) => {
        console.error("❌ Peer connection error:", err);
      });

      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(incomingCallData.offer);
      }

    } catch (err) {
      console.error("❌ Error in answerCall:", err);
    }
  };

  const endCall = async () => {
    try {
      console.log("🚫 Ending call...");

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        console.log("🎙️ Local media tracks stopped");
      }

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
        console.log("🔌 Peer connection destroyed");
      }

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("🧹 Firestore listener unsubscribed");
      }

      if (callId) {
        await deleteDoc(doc(db, "calls", callId));
        console.log("🗑️ Firestore call doc deleted");
      }

      setCallId(null);
      setLocalStream(null);
      setRemoteStream(null);
      hasSignaledAnswer.current = false;
    } catch (err) {
      console.error("❌ Error ending call:", err);
    }
  };

  return {
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
  };
};

export default useWebRTCCall;
