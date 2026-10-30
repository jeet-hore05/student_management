import { Router } from "express";
import { createDepartment,allotStudent, getDepartmentStudents,  getAllDepartments, allotTeacherToDepartment, getTeacherDepartmentAllotments } from "../controllers/allotment.controller.js";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/department", isLoggedIn, authorizeRoles("ADMIN"), createDepartment);
router.post("/student", isLoggedIn, authorizeRoles("ADMIN"), allotStudent);
router.post("/teacher", isLoggedIn, authorizeRoles("ADMIN"), allotTeacherToDepartment);

// get students of a dept.
router.get("/students", isLoggedIn, authorizeRoles("ADMIN","TEACHER"), getDepartmentStudents);
//get teachers of a dept.
router.get("/teachers", isLoggedIn, authorizeRoles("ADMIN"), getTeacherDepartmentAllotments);


router.get(
    "/departments",
    isLoggedIn,
    authorizeRoles("ADMIN", "TEACHER"),
    getAllDepartments
);

export default router;