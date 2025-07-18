// src/components/Matches/MatchesRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import NewPage from "./NewPage";
import SwipeUI from "./SwipeUI";
import Chat from "./Chat";
import Settings from "./Settings";
import ProfileView from "./ProfileView";
import Navigation from "./Navigation";
import BioForm from "../../Components/Bio/BioForm"; 


export default function MatchesRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/new" element={<NewPage />} />
        <Route path="swipe" element={<SwipeUI />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile/:id" element={<ProfileView />} />
        <Route path="/bio" element={<BioForm />} />
      </Routes>
    </>
  );
}
