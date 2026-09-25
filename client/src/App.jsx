import {Link, Route, Routes} from "react-router-dom";
import Footer from "./Components/Footer.jsx";


import './App.css';
import HomePage from "./Pages/HomePage.jsx";

function App() {

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage/>}/>
      </Routes>
    </>
  )
}

export default App;
