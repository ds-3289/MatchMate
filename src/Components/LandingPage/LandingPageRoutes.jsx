import React from "react";
import Home from "./Home.jsx";
import Features from "./Features.jsx";
import CallToAction from "./CallToAction.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

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
