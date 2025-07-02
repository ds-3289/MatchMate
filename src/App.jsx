// import React from "react";
// import Home from './Components/Home.jsx';
// import Header from './Components/Header.jsx';
// import Footer from './Components/Footer.jsx';
// import CallToAction from "./Components/CalltoAction.jsx";
// import Features from "./Components/Features.jsx";


// function App(){
//   return (
//     <>
//     <Header/>
//     <Home/>
//     <Features/>
//     <CallToAction/>
//     <Footer/>
//     </>
//   )
// }
// export default App;


// import React from "react";
// import { Routes, Route } from "react-router-dom"; 
// import Home from './Components/LandingPage/Home.jsx';
// import Header from './Components/Header.jsx';
// import Footer from './Components/Footer.jsx';
// import CallToAction from "./Components/LandingPage/CalltoAction.jsx";
// import Features from "./Components/LandingPage/Features.jsx";
// import BioForm from "./Components/Bio/BioForm.jsx"; 
// import NewPage from "./Components/Matches/NewPage.jsx"; 

// function App() {
//   return (
//     <>
//       <Header />

//       <Routes>
//         <Route path="/" element={
//           <>
//             <Home />
//             <Features />
//             <CallToAction />
//           </>
//         } />

//         <Route path="/bio" element={<BioForm />} />
//         <Route path="/new" element={<NewPage />} />
//       </Routes>

//       <Footer />
//     </>
//   );
// }

// export default App;

// // src/App.jsx
// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import { Toaster } from "@/components/ui/toaster";
// // import { Toaster as Sonner } from "@/components/ui/sonner";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import AuthWrapper from "./AuthWrapper";
// import BioForm from "./components/Bio/BioForm.jsx";
// // import NotFound from "./components/Matches/NotFound"; 

// // const queryClient = new QueryClient();

// export default function App() {
//   return (
//     // <QueryClientProvider client={queryClient}>
//     //   <TooltipProvider>
//     //     <Toaster />
//     //     <Sonner />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/*" element={<AuthWrapper />} />
//             <Route path="/bio" element={<BioForm />} />
//             {/* <Route path="*" element={<NotFound />} /> */}
//           </Routes>
//         </BrowserRouter>
//       {/* </TooltipProvider>
//     </QueryClientProvider> */}
//   );
// }


import React from "react";
import { Routes, Route } from "react-router-dom";

import AuthWrapper from "./AuthWrapper";
import BioForm from "./components/Bio/BioForm.jsx";
import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/*" element={<AuthWrapper />} />
        <Route path="/bio" element={<BioForm />} />
      </Routes>
      <Footer />
    </>
  );
}