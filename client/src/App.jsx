import { Route, Routes } from "react-router-dom";

import "./App.css";

import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./Pages/ResetPasswordPage.jsx";
import ChangePasswordPage from "./Pages/ChangePasswordPage.jsx";
import Profile from "./Pages/Profile.jsx";

import Allotment from "./Pages/Allotment.jsx";
import Students from "./Pages/Students.jsx";
import Departments from "./Pages/Departments.jsx";
import Teachers from "./Pages/Teachers.jsx";
import Attendance from "./Pages/Attendance.jsx";
import Subjects from "./Pages/Subjects.jsx";
import Routines from "./Pages/Routines.jsx";
import View from "./Pages/View.jsx";

import ProtectedRoute from "./Components/ProtectedRoute.jsx";

import AboutUs from "./Pages/AboutUs.jsx";
import ContactUs from "./Pages/ContactUs.jsx";

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
            />
            <Route
                path="/reset/:resetToken"
                element={<ResetPasswordPage />}
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Any logged-in user */}
            <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/change-password"
                    element={<ChangePasswordPage />}
                />
            </Route>

            {/* Admin-only routes */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]} />
                }
            >
                <Route path="/allotment" element={<Allotment />} />
                <Route path="/students" element={<Students />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/teachers" element={<Teachers />} />
            </Route>

            {/* Admin and teacher routes */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "TEACHER"]}
                    />
                }
            >
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/routines" element={<Routines />} />
            </Route>

            {/* All authenticated roles */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}
                    />
                }
            >
                <Route path="/view" element={<View />} />
            </Route>
        </Routes>
    );
}

export default App;
