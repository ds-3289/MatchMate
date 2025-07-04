// src/components/LandingPage/LandingPage.jsx

import React from "react";
import Home from "./Home.jsx";
import Features from "./Features.jsx";
import CallToAction from "./CallToAction.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
//import AuthModal from "./AuthModal"; // if modal is used

export default function LandingPage() {
  return (
    <div>
      <Header/>
      <Home />
      <Features />
      <CallToAction />
      <Footer/>
    </div>
  );
}
