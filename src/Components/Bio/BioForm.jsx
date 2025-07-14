import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BioForm.css";
import { Heart, User, Ruler, Book } from "lucide-react";
import { toast } from "sonner";
import { db } from "../../Firebase"; 
import { doc, setDoc , getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";


export default function BioForm() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", age: "", gender: "", location: "",
    height: "", bodyType: "", eyeColor: "", hairColor: "",
    occupation: "", education: "", interests: "", hobbies: "",
    musicTaste: "", favoriteBooks: "", bio: "", lookingFor: "", relationshipGoals: ""
  });

  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

  const sections = [
    { title: "Basic Info", icon: <User /> },
    { title: "Physical Details", icon: <Ruler /> },
    { title: "Lifestyle", icon: <Book /> },
    { title: "About You", icon: <Heart /> }
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setCurrentSection((s) => Math.min(s + 1, sections.length - 1));
  const handlePrevious = () => setCurrentSection((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
  e.preventDefault();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    toast.error("You must be logged in to submit the form.");
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid), formData);
    toast.success("Profile created successfully!");
    navigate("/new");
  } catch (err) {
    console.error("Error saving profile:", err);
    toast.error("Failed to save profile.");
  }
};


  const renderSection = () => {
    const input = (id, label, value, type = "text") => (
      <div className="bio-input-group">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => handleChange(id, e.target.value)}
          required
        />
      </div>
    );

    switch (currentSection) {
      case 0:
        return (
          <>
            {input("firstName", "First Name", formData.firstName)}
            {input("lastName", "Last Name", formData.lastName)}
            {input("age", "Age", formData.age, "number")}
            {/* {input("gender", "Gender", formData.gender)} */}
            
            <div className="bio-input-group">
  <label htmlFor="gender">Gender</label>
  <select
    id="gender"
    value={formData.gender}
    onChange={(e) => handleChange("gender", e.target.value)}
    className="bio-input"
    required
  >
    <option value="">Select your gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>
</div>

            {input("location", "Location", formData.location)}
          </>
        );
      case 1:
        return (
          <>
            {input("height", "Height", formData.height)}
            {input("bodyType", "Body Type", formData.bodyType)}
            {input("eyeColor", "Eye Color", formData.eyeColor)}
            {input("hairColor", "Hair Color", formData.hairColor)}
          </>
        );
      case 2:
        return (
          <>
            {input("occupation", "Occupation", formData.occupation)}
            {input("education", "Education", formData.education)}
            {input("interests", "Interests", formData.interests)}
            {input("hobbies", "Hobbies", formData.hobbies)}
            {input("musicTaste", "Music Taste", formData.musicTaste)}
            {input("favoriteBooks", "Favorite Books", formData.favoriteBooks)}
          </>
        );
      case 3:
        return (
          <>
            <div className="bio-input-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </div>

            <div className="bio-input-group">
              <label htmlFor="lookingFor">Looking For</label>
              <input
                id="lookingFor"
                value={formData.lookingFor}
                onChange={(e) => handleChange("lookingFor", e.target.value)}
              />
            </div>

            <div className="bio-input-group">
              <label htmlFor="relationshipGoals">Relationship Goals</label>
              <textarea
                id="relationshipGoals"
                value={formData.relationshipGoals}
                onChange={(e) => handleChange("relationshipGoals", e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to edit your profile.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else {
        console.log("No profile data found, starting fresh.");
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      toast.error("Could not load your profile.");
    }
  };

  fetchUserData();
}, []);


  return (
    <div className="bio-container">
      <div className="bio-header">
        <Heart />
        <h1>Create Your Profile</h1>
        <Heart />
      </div>

      <div className="bio-steps">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className={`bio-step ${idx <= currentSection ? "active" : ""}`}
          >
            {section.icon}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bio-form">
        {renderSection()}

        <div className="bio-buttons">
          <button type="button" onClick={handlePrevious} disabled={currentSection === 0}>
            Previous
          </button>
          {currentSection === sections.length - 1 ? (
            <button type="button" onClick={handleSubmit}>Submit</button>
          ) : (
            <button type="button" onClick={handleNext}>Next</button>
          )}
        </div>
      </form>
    </div>
  );
}
