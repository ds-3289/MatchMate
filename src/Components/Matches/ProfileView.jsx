import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap,
  Heart, MessageSquare, Music, Book, Eye, Ruler
} from "lucide-react";
import "./ProfileView.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase";

// Reuse the same placeholder images array
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
  "https://plus.unsplash.com/premium_vector-1731850954598-9877f725c123?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/vector-1752341240241-de940d7799ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1723658879778-668cb248f351?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1730944647492-19d98f476e4b?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1723422046166-faafe3ce61cf?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/vector-1751482574434-ec51b921cf57?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1723658879778-668cb248f351?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1697729851630-345e9e19a2b3?q=80&w=972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1725994277561-1f2a9a66b04b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1741899809398-baa35dccef11?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1723652267719-f5e134bbf9b5?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1739352687644-2ec01fdf77a4?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1728567177350-2abddc2f8ce1?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1746432244561-698f141332e5?q=80&w=1178&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1746884794173-c17cb1db2b75?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_vector-1730931472622-3a86a06a8e89?q=80&w=816&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

// Utility: Get fallback image by hashing the user ID
const getFallbackImage = (userId) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.error("No such user found!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleSendMessage = () => navigate("/chat");

  if (!profile) return <p>Loading...</p>;

  const fallbackImage = getFallbackImage(id);
  const mainImage = profile.image || profile.images?.[0] || fallbackImage;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={mainImage} alt={profile.firstName} className="profile-image" />
        <div className="overlay" />
        <button
          onClick={() => navigate(-1)}
          className="back-button border border-gray-300 px-3 py-1 text-sm rounded bg-white hover:bg-gray-100 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          
        </button>
        <div className="profile-overlay-text">
          <h1>{profile.firstName} {profile.lastName}, {profile.age}</h1>
          <div className="location">
            <MapPin className="icon" />
            <span>{profile.location}</span>
          </div>
        </div>
      </div>

      <div className="profile-content container">
        <div className="card romantic-card">
          <h2>About Me</h2>
          <p>{profile.bio}</p>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="info-section">
              <h3>Basic Info</h3>
              <ul>
                <li><Heart className="icon" /> {profile.relationshipGoals}</li>
                <li><Briefcase className="icon" /> {profile.occupation}</li>
                <li><GraduationCap className="icon" /> {profile.education}</li>
                <li><Ruler className="icon" /> {profile.height}, {profile.bodyType}</li>
                <li><Eye className="icon" /> {profile.eyeColor} eyes, {profile.hairColor} hair</li>
              </ul>
            </div>
            <div className="info-section">
              <h3>Interests & Hobbies</h3>
              <div className="tags">
                {profile.hobbies?.split(",").map((h, i) => <span key={i} className="tag lavender">{h.trim()}</span>)}
              </div>
              <div className="tags">
                {profile.interests?.split(",").map((i, j) => <span key={j} className="tag mint">{i.trim()}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="card romantic-card">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3><Music className="icon" /> Music Taste</h3>
              <p>{profile.musicTaste}</p>
            </div>
            <div>
              <h3><Book className="icon" /> Favorite Books</h3>
              <p>{profile.favoriteBooks}</p>
            </div>
          </div>
        </div>

        <div className="card romantic-card">
          <h3>More Photos</h3>
          <div className="gallery">
            {profile.images?.slice(1).map((img, i) => (
              <img key={i} src={img} alt={`Photo ${i + 2}`} className="gallery-img" />
            ))}
          </div>
        </div>

        <div className="message-button">
          <button onClick={handleSendMessage} className="romantic-button flex items-center px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600">
            <MessageSquare className="w-5 h-5 mr-2" />
            
          </button>
        </div>
      </div>
    </div>
  );
}

