import React, { useEffect, useState } from "react";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../Firebase";
import "./NewPage.css";
import { Heart, X, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { setDoc , query, where,serverTimestamp } from "firebase/firestore";

export default function NewPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedUserIds, setLikedUserIds] = useState([]);
  const [matchedUserIds, setMatchedUserIds] = useState([]);
  const [pulsingIds, setPulsingIds] = useState([]);


  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);
  }, []);


  const placeholderImages = [
    "https://plus.unsplash.com/premium_vector-1739269049762-7cc7ee26c327?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://plus.unsplash.com/premium_vector-1739921187649-dadadabc1e04?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/vector-1746201741369-91ae3307d64b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://plus.unsplash.com/premium_vector-1747848122226-7660e7f29551?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://plus.unsplash.com/premium_vector-1748205000114-86e7eb758212?q=80&w=1207&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/vector-1750426724736-56d459a42cc3?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://plus.unsplash.com/premium_vector-1720440170692-f25c2a0a5f1d?q=80&w=582&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/vector-1750071844608-b380f333fed6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/vector-1751354249052-d451c6f430a7?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://plus.unsplash.com/premium_vector-1731850954598-9877f725c123?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0"
  ];

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

useEffect(() => {
  const fetchLikedUsers = async () => {
    if (!currentUser) return;

    try {
      // Step 1: Get all users currentUser liked
      const likesQuery = query(
        collection(db, "likes"),
        where("from", "==", currentUser.uid)
      );
      const snapshot = await getDocs(likesQuery);
      const likedIds = snapshot.docs.map((doc) => doc.data().to);

      // Step 2: Check for mutual likes (i.e. matches)
      const matchedIds = [];

      for (const likedId of likedIds) {
        const reverseLikeDoc = await getDoc(
          doc(db, "likes", `${likedId}_${currentUser.uid}`)
        );

        if (reverseLikeDoc.exists()) {
          matchedIds.push(likedId);
        }
      }

      // Step 3: Set states
      setLikedUserIds(likedIds);       // All users the current user liked
      setMatchedUserIds(matchedIds);   // Only those where match is mutual

    } catch (error) {
      console.error("Error fetching liked users:", error);
    }
  };

  fetchLikedUsers();
}, [currentUser]);


  // Like handler
  const handleLike = async (likedUserId) => {
    if (!currentUser) return;

    const likeDocId = `${currentUser.uid}_${likedUserId}`;
    const reverseLikeDocId = `${likedUserId}_${currentUser.uid}`;

    const likeRef = doc(db, "likes", likeDocId);
    const reverseLikeRef = doc(db, "likes", reverseLikeDocId);

    try {
      // Start heart animation
      setPulsingIds((prev) => [...prev, likedUserId]);
      setTimeout(() => {
        setPulsingIds((prev) => prev.filter((id) => id !== likedUserId));
      }, 400);

      // Save like
      await setDoc(likeRef, {
        from: currentUser.uid,
        to: likedUserId,
        timestamp: serverTimestamp(),
      });

      // Update UI
      setLikedUserIds((prev) => [...prev, likedUserId]);

      // Check mutual like
      const reverseSnap = await getDoc(reverseLikeRef);

      if (reverseSnap.exists()) {
        const matchId = [currentUser.uid, likedUserId].sort().join("_");

        const matchRef = doc(db, "matches", matchId);
        const chatRef = doc(db, "chats", matchId);

        await setDoc(matchRef, {
          users: [currentUser.uid, likedUserId],
          createdAt: serverTimestamp(),
        });

        await setDoc(chatRef, {
          users: [currentUser.uid, likedUserId],
          messages: [],
        });

        setMatchedUserIds((prev) => [...prev, likedUserId]);

        alert("🎉 It's a match! You can now chat.");
      }
    } catch (error) {
      console.error("Like error:", error);
      alert("Something went wrong. Please try again.");
    }
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
          {matches.map((match, index) => {
            const fallbackImage = placeholderImages[index % placeholderImages.length];
            return (
              <div className="match-card" key={match.id}>
                <div className="match-img-container">
                  <img
                    src={match.image || fallbackImage}
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
                    <button
                        className={`like-btn ${pulsingIds.includes(match.id) ? 'pulsing' : ''} ${matchedUserIds.includes(match.id) ? 'matched' : ''}`}
                        disabled={likedUserIds.includes(match.id) && !matchedUserIds.includes(match.id)}
                        onClick={() => handleLike(match.id)}
                      >
                        {matchedUserIds.includes(match.id) ? (
                          <>
                            <Heart size={16} className="text-yellow-500" /> Matched!
                          </>
                        ) : likedUserIds.includes(match.id) ? (
                          <>
                            <Heart size={16} className="text-pink-500" /> Liked
                          </>
                        ) : (
                          <>
                            <Heart size={16} /> Like
                          </>
                        )}
                      </button>


                    {/* <button
                      onClick={() => handleLike(match.id)}
                      className={`like-button ${pulsingIds.includes(match.id) ? "pulse" : ""}`}
                    >
                      {likedUserIds.includes(match.id) ? "❤️" : "🤍"}
                    </button> */}



                  </div>

                  <Link to={`/profile/${match.id}`} className="view-profile">
                    View Full Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
