// import React, { useEffect, useState } from "react";
// import { getDoc, doc, collection, getDocs } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from "../../Firebase"; 

// export default function NewPage() {
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const calculateMatchScore = (currentUser, candidate) => {
//     let score = 0;
//     if (
//       candidate.lookingFor.toLowerCase().includes(
//         currentUser.relationshipGoals.toLowerCase()
//       )
//     ) {
//       score += 3;
//     }


//     const ageDiff = Math.abs(Number(currentUser.age) - Number(candidate.age));
//     if (ageDiff <= 3) score += 2;

    
//     if (
//       currentUser.location.toLowerCase() === candidate.location.toLowerCase()
//     ) {
//       score += 1;
//     }

   
//     const curHobbies = currentUser.hobbies.toLowerCase().split(/,|\s+/);
//     const candHobbies = candidate.hobbies.toLowerCase();
//     const hobbiesMatched = curHobbies.some((hobby) =>
//       candHobbies.includes(hobby)
//     );
//     if (hobbiesMatched) score += 2;

    
//     const curInterests = currentUser.interests.toLowerCase().split(/,|\s+/);
//     const candInterests = candidate.interests.toLowerCase();
//     const interestsMatched = curInterests.some((int) =>
//       candInterests.includes(int)
//     );
//     if (interestsMatched) score += 2;


//     if (
//       candidate.gender.toLowerCase() !== currentUser.gender.toLowerCase()
//     ) {
//       score += 1;
//     }

//     return score;
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
//       if (!user) {
//         console.warn("Not signed in.");
//         setLoading(false);
//         return;
//       }

//       console.log("Logged-in User:", user.uid);

//       try {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         const currentUserData = userDoc.data();

//         console.log("Current User Data:", currentUserData);

//         const snapshot = await getDocs(collection(db, "users"));
//         const potentialMatches = [];

//         snapshot.forEach((docSnap) => {
//           if (docSnap.id === user.uid) return; 

//           const candidate = docSnap.data();
//           const score = calculateMatchScore(currentUserData, candidate);

//           console.log("Evaluating:", candidate.firstName, "| Score:", score);

//           if (score >= 1) {
//             potentialMatches.push({ id: docSnap.id, ...candidate, score });
//           }
//         });

//         potentialMatches.sort((a, b) => b.score - a.score);
//         setMatches(potentialMatches);
//       } catch (error) {
//         console.error("Error fetching matches:", error);
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Best Matches for You</h2>

//       {loading ? (
//         <p>Loading matches...</p>
//       ) : matches.length === 0 ? (
//         <p>No suitable matches found yet.</p>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {matches.map((match) => (
//             <div
//               key={match.id}
//               className="rounded-xl border p-4 shadow-md bg-white"
//             >
//               <h3 className="text-xl font-semibold">
//                 {match.firstName} {match.lastName} ({match.age})
//               </h3>
//               <p>Location: {match.location}</p>
//               <p>Hobbies: {match.hobbies}</p>
//               <p>Interests: {match.interests}</p>
//               <p>Looking For: {match.lookingFor}</p>
//               <p>Goals: {match.relationshipGoals}</p>
//               <p className="text-sm text-gray-500">
//                 Match Score: {match.score}/11
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../Firebase";
import "./NewPage.css";
import { Heart, X, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateMatchScore = (currentUser, candidate) => {
    let score = 0;

    if (
      candidate.lookingFor?.toLowerCase().includes(
        currentUser.relationshipGoals?.toLowerCase()
      )
    ) score += 3;

    const ageDiff = Math.abs(Number(currentUser.age) - Number(candidate.age));
    if (ageDiff <= 3) score += 2;

    if (
      currentUser.location?.toLowerCase() === candidate.location?.toLowerCase()
    ) score += 1;

    const curHobbies = currentUser.hobbies?.toLowerCase().split(/,|\s+/) || [];
    const candHobbies = candidate.hobbies?.toLowerCase() || "";
    if (curHobbies.some((h) => candHobbies.includes(h))) score += 2;

    const curInterests = currentUser.interests?.toLowerCase().split(/,|\s+/) || [];
    const candInterests = candidate.interests?.toLowerCase() || "";
    if (curInterests.some((i) => candInterests.includes(i))) score += 2;

    if (
      candidate.gender?.toLowerCase() !== currentUser.gender?.toLowerCase()
    ) score += 1;

    return score;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return setLoading(false);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const currentUserData = userDoc.data();

        const snapshot = await getDocs(collection(db, "users"));
        const potentialMatches = [];

        snapshot.forEach((docSnap) => {
          if (docSnap.id === user.uid) return;

          const candidate = docSnap.data();
          const score = calculateMatchScore(currentUserData, candidate);

          if (score >= 1) {
            potentialMatches.push({ id: docSnap.id, ...candidate, score });
          }
        });

        potentialMatches.sort((a, b) => b.score - a.score);
        setMatches(potentialMatches);
      } catch (err) {
        console.error("Match fetch error:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePass = (id) => {
    setMatches(matches.filter((m) => m.id !== id));
  };

  const handleLike = (id) => {
    console.log(`Liked user ${id}`);
  };

  return (
    <div className="match-wrapper">
      <div className="match-header">
        <h1>Your Perfect Matches</h1>
        <p>Discover people who share your interests ✨</p>
      </div>

      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No suitable matches found yet.</p>
      ) : (
        <div className="match-grid">
          {matches.map((match) => (
            <div className="match-card" key={match.id}>
              <div className="match-img-container">
                <img
                  src={match.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${match.firstName}`}
                  alt={match.firstName}
                  className="match-img"
                />
                <div className="match-score">
                  <Star size={16} className="text-yellow-500" />
                  <span>{match.score * 10}%</span>
                </div>
              </div>

              <div className="match-content">
                <h3>
                  {match.firstName} {match.lastName}, {match.age}
                </h3>
                <p className="match-location">
                  <MapPin size={14} /> {match.location}
                </p>
                <p className="match-bio">{match.bio}</p>

                <div className="match-tags">
                  {(match.hobbies?.split(",").slice(0, 2) || []).map((hobby, i) => (
                    <span key={i} className="match-tag">{hobby.trim()}</span>
                  ))}
                </div>

                <div className="match-actions">
                  <button className="pass-btn" onClick={() => handlePass(match.id)}>
                    <X size={16} /> Pass
                  </button>
                  <button className="like-btn" onClick={() => handleLike(match.id)}>
                    <Heart size={16} /> Like
                  </button>
                </div>

                <Link to={`/profile/${match.id}`} className="view-profile">
                  View Full Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
