// src/AuthWrapper.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";

// Correct imports
import LandingPage from "./Components/LandingPage/LandingPageRoutes.jsx";
import BioForm from "./components/Bio/BioForm.jsx";
import MatchesRoutes from "./Components/Matches/MatchesRoutes.jsx";

export default function AuthWrapper() {
  const [status, setStatus] = useState("loading");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("no-user");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setStatus("no-profile");
          navigate("/bio");
        } else {
          setUserData(docSnap.data());
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setStatus("no-profile");
        navigate("/bio");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (status === "loading") return <LandingPage />;
  // <div className="p-4">Loading...</div>;
  if (status === "no-user") return <LandingPage />;
  if (status === "no-profile") return <BioForm />;
  return <MatchesRoutes />;
}
