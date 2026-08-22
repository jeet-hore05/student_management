import { Router } from "express";
import { getProfile, login, logout, createStudent, createTeacher, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";



const router = Router();


// public routes 
router.post("/login", login);
router.get("/logout", logout);
router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);

// ADMIN routes

router.post("/createStudent", isLoggedIn,authorizeRoles("ADMIN"), upload.single("avatar") ,createStudent);
router.post("/createTeacher", isLoggedIn,authorizeRoles("ADMIN"),upload.single("avatar"), createTeacher);

router.get("/me", isLoggedIn, getProfile);

export default router;