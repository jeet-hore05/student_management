import { Router } from "express";

import {
  markAttendance,
  getAllAttendance,
  getStudentAttendance,
  getSubjectAttendance,
  updateAttendance,
  deleteAttendance
} from "../controllers/attendance.controller.js";

import {
  isLoggedIn,
  authorizeRoles
} from "../middlewares/auth.middleware.js";

const router = Router();

// TEACHER can mark attendance
router.post(
  "/mark",
  isLoggedIn,
  authorizeRoles("TEACHER"),
  markAttendance
);


// ADMIN and TEACHER can view all attendance
router.get(
  "/all",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  getAllAttendance
);


// ADMIN, TEACHER and STUDENT can view student attendance
router.get(
  "/student/:studentId",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER", "STUDENT"),
  getStudentAttendance
);


// ADMIN and TEACHER can view subject attendance
router.get(
  "/subject/:subjectId",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  getSubjectAttendance
);


// TEACHER can update attendance
router.put(
  "/update/:attendanceId",
  isLoggedIn,
  authorizeRoles("TEACHER"),
  updateAttendance
);


// ADMIN can delete attendance
router.delete(
  "/delete/:attendanceId",
  isLoggedIn,
  authorizeRoles("ADMIN"),
  deleteAttendance
);


export default router;