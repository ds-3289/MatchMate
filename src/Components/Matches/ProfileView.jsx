import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap,
  Heart, MessageSquare, Music, Book, Eye, Ruler
} from "lucide-react";
import "./ProfileView.css";

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // TODO: Fetch profile data using ID (for now, using mock data)
    setProfile({
      id,
      name: "Emma",
      age: 26,
      gender: "Female",
      location: "San Francisco, CA",
      bio: "Adventure seeker who loves hiking and coffee dates...",
      relationshipGoals: "Looking for a serious relationship",
      hobbies: "Photography, Hiking, Reading, Cooking, Yoga",
      interests: "Travel, Art, Music, Nature, Food",
      education: "Masters in Marketing",
      occupation: "Digital Marketing Manager",
      eyeColor: "Green",
      hairColor: "Brunette",
      bodyType: "Athletic",
      height: "5'6\"",
      musicTaste: "Indie Rock, Jazz, Classical",
      favoriteBooks: "The Alchemist, Pride and Prejudice, 1984",
      images: [
        "https://images.unsplash.com/photo-1494790108755-2616c4498674?w=600",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
      ],
    });
  }, [id]);

  const handleSendMessage = () => navigate("/chat");

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profile.images[0]} alt={profile.name} className="profile-image" />
        <div className="overlay" />
        <button onClick={() => navigate(-1)} className="back-button border border-gray-300 px-3 py-1 text-sm rounded bg-white hover:bg-gray-100 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <div className="profile-overlay-text">
          <h1>{profile.name}, {profile.age}</h1>
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
                {profile.hobbies.split(", ").map((h, i) => <span key={i} className="tag lavender">{h}</span>)}
              </div>
              <div className="tags">
                {profile.interests.split(", ").map((i, j) => <span key={j} className="tag mint">{i}</span>)}
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
            {profile.images.slice(1).map((img, i) => (
              <img key={i} src={img} alt={`Photo ${i + 2}`} className="gallery-img" />
            ))}
          </div>
        </div>

        <div className="message-button">
          <button onClick={handleSendMessage} className="romantic-button flex items-center px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600">
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
