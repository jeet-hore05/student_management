import {Link, Route, Routes} from "react-router-dom";
import Footer from "./Components/Footer.jsx";


import './App.css';
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./Pages/ResetPasswordPage.jsx";
import ChangePasswordPage from "./Pages/ChangePasswordPage.jsx";
import Profile from "./Pages/Profile.jsx";
import Allotment from "./Pages/Allotment.jsx";
import Students from "./Pages/Students.jsx";
import Departments from "./Pages/Departments.jsx";

function App() {

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/reset/:resetToken"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/change-password"
        element={<ChangePasswordPage />}
      />
      <Route path="/profile" element={<Profile />} />
      <Route path="/allotment" element={<Allotment />} />
      <Route path="/students" element={<Students/>}/>
      <Route path="/departments" element={<Departments />} />

      </Routes>
    </>
  )
}

export default App;
