
import React from "react";
import { Routes, Route } from "react-router-dom";

import AuthWrapper from "./AuthWrapper";
import BioForm from "./Components/Bio/BioForm.jsx";
import Header from "./Components/LandingPage/Header.jsx";
import Footer from "./Components/LandingPage/Footer.jsx";

export default function App() {
  return (
    <>
      {/* <Header /> */}
      <Routes>
        <Route path="/*" element={<AuthWrapper />} />
        <Route path="/bio" element={<BioForm />} />
      </Routes>
      {/* <Footer /> */}
    </>
  );
}