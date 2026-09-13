import { Router } from "express";

import {
  createRoutine,
  getAllRoutines,
  getRoutine,
  getRoutineByDay,
  updateRoutine,
  deleteRoutine
} from "../controllers/routine.controller.js";

import { isLoggedIn,authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", isLoggedIn, authorizeRoles("ADMIN"), createRoutine);
router.get("/all", isLoggedIn, authorizeRoles("ADMIN","TEACHER","STUDENT"),getAllRoutines);
router.get("/view", isLoggedIn, authorizeRoles("ADMIN","TEACHER","STUDENT"),getRoutine);
router.get("/day", isLoggedIn, authorizeRoles("ADMIN","TEACHER","STUDENT"),getRoutineByDay);
router.put("/update/:routineID", isLoggedIn, authorizeRoles("ADMIN"),updateRoutine);
router.delete("/delete/:routineId", isLoggedIn, authorizeRoles("ADMIN"), deleteRoutine);

export default router;