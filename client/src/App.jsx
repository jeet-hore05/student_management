import {Link, Route, Routes} from "react-router-dom";
import Footer from "./Components/Footer.jsx";


import './App.css';
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";

function App() {

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App;
