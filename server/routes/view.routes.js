import { Router } from "express";

import {
  viewStudents,
  viewTeachers,
  viewSubjects,
  viewRoutine,
  viewAttendance,
  viewStudentDetails,
  viewStudentDashboard
} from "../controllers/view.controller.js";

import {
  isLoggedIn,
  authorizeRoles
} from "../middlewares/auth.middleware.js";

const router = Router();


// View all students
router.get(
  "/students",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  viewStudents
);


// View all teachers
router.get(
  "/teachers",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  viewTeachers
);


// View all subjects
router.get(
  "/subjects",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER", "STUDENT"),
  viewSubjects
);


// View complete routine
router.get(
  "/routine",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER", "STUDENT"),
  viewRoutine
);


// View attendance
router.get(
  "/attendance",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  viewAttendance
);


// View particular student details
router.get(
  "/student/:studentId",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER"),
  viewStudentDetails
);


// View student's dashboard
router.get(
  "/student/:studentId/dashboard",
  isLoggedIn,
  authorizeRoles("ADMIN", "TEACHER", "STUDENT"),
  viewStudentDashboard
);


export default router;