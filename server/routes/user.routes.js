import { Router } from "express";
import { getProfile, login, logout, createStudent, createTeacher, forgotPassword, resetPassword, changePassword, getAllStudents,getStudentById, updateStudent, deleteStudent } from "../controllers/user.controller.js";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";



const router = Router();


// public routes 
router.post("/login", login);
router.get("/logout", logout);
router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/change-password", isLoggedIn, changePassword);

// ADMIN routes

router.post("/createStudent", isLoggedIn,authorizeRoles("ADMIN"), upload.single("avatar") ,createStudent);
router.post("/createTeacher", isLoggedIn,authorizeRoles("ADMIN"),upload.single("avatar"), createTeacher);

router.get("/me", isLoggedIn, getProfile);

// Student management routes
router.get(
    "/students",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    getAllStudents
);

router.get(
    "/students/:studentId",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    getStudentById
);

router.put(
    "/students/:studentId",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    updateStudent
);

router.delete(
    "/students/:studentId",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    deleteStudent
);

export default router;