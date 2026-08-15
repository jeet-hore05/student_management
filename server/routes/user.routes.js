import { Router } from "express";
import { getProfile, login, logout, createStudent, createTeacher } from "../controllers/user.controller.js";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";



const router = Router();


// public routes 
router.post("/login", login);
router.get("/logout", logout);

// ADMIN routes

router.post("/createStudent", isLoggedIn,authorizeRoles("ADMIN"), createStudent);
router.post("/createTeacher", isLoggedIn,authorizeRoles("ADMIN"), createTeacher);

router.get("/me", isLoggedIn, getProfile);

export default router;