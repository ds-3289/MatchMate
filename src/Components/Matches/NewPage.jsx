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
                    <button className="like-btn" onClick={() => handleLike(match.id)}>
                      <Heart size={16} /> Like
                    </button>
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
