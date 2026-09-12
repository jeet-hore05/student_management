import { Router } from "express";
import {createSubject, getAllSubjects, getSubjectsByDepartment, getSubjectsBySemester,updateSubject,deleteSubject} from "../controllers/subject.controller.js";
import {isLoggedIn, authorizeRoles} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", isLoggedIn, authorizeRoles("ADMIN"),createSubject);
router.get("/all",isLoggedIn,authorizeRoles("ADMIN","TEACHER"), getAllSubjects);
router.get(
    "/department/:departmentId",
    isLoggedIn,
    authorizeRoles("ADMIN","TEACHER"),
    getSubjectsByDepartment
);

router.get(
    "/semester/:semester",
    isLoggedIn,
    authorizeRoles("ADMIN","TEACHER"),
    getSubjectsBySemester
);

router.put(
    "/update/:subjectId",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    updateSubject
);

router.delete(
    "/delete/:subjectId",
    isLoggedIn,
    authorizeRoles("ADMIN"),
    deleteSubject
)

export default router;