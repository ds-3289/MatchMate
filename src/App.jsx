import React from "react";
import Home from './Components/Home.jsx';
import Header from './Components/Header.jsx';
import Footer from './Components/Footer.jsx';
import CallToAction from "./Components/CalltoAction.jsx";
import Features from "./Components/Features.jsx";


function App(){
  return (
    <>
    <Header/>
    <Home/>
    <Features/>
    <CallToAction/>
    <Footer/>
    </>
  )
}
export default App;