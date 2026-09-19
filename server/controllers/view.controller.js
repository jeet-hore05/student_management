import User from "../models/user.model.js";
import Subject from "../models/subject.model.js";
import Routine from "../models/routine.model.js";
import Attendance from "../models/attendance.model.js";
import AppError from "../utils/error.util.js";


// View all students
const viewStudents = async (req, res, next) => {
    try {

        const students = await User.find({
            role: "STUDENT",
            isActive: true
        })
            .select("-password -forgotPasswordToken -forgotPasswordExpiry")
            .populate("department", "name code")
            .sort({ fullName: 1 });


        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View all teachers
const viewTeachers = async (req, res, next) => {
    try {

        const teachers = await User.find({
            role: "TEACHER",
            isActive: true
        })
            .select("-password -forgotPasswordToken -forgotPasswordExpiry")
            .populate("department", "name code")
            .sort({ fullName: 1 });


        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View all subjects
const viewSubjects = async (req, res, next) => {
    try {

        const subjects = await Subject.find({
            isActive: true
        })
            .populate("department", "name code")
            .sort({
                semester: 1,
                subjectName: 1
            });


        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View complete routine
const viewRoutine = async (req, res, next) => {
    try {

        const routines = await Routine.find({
            isActive: true
        })
            .populate("department", "name code")
            .populate("subject", "subjectName subjectCode subjectType")
            .populate("teacher", "fullName employeeId")
            .sort({
                semester: 1,
                section: 1,
                day: 1,
                startTime: 1
            });


        res.status(200).json({
            success: true,
            count: routines.length,
            routines
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View attendance
const viewAttendance = async (req, res, next) => {
    try {

        const attendance = await Attendance.find()
            .populate(
                "student",
                "fullName email rollNumber department semester section"
            )
            .populate(
                "subject",
                "subjectName subjectCode"
            )
            .populate(
                "teacher",
                "fullName employeeId"
            )
            .populate(
                "routine",
                "day startTime endTime room"
            )
            .sort({
                date: -1
            });


        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View complete student information
const viewStudentDetails = async (req, res, next) => {
    try {

        const { studentId } = req.params;


        const student = await User.findOne({
            _id: studentId,
            role: "STUDENT"
        })
            .select("-password -forgotPasswordToken -forgotPasswordExpiry")
            .populate("department", "name code");


        if (!student) {
            return next(new AppError("Student not found", 404));
        }


        res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// View student's complete information
// including attendance
const viewStudentDashboard = async (req, res, next) => {
    try {

        const { studentId } = req.params;


        // Find student
        const student = await User.findOne({
            _id: studentId,
            role: "STUDENT"
        })
            .select("-password -forgotPasswordToken -forgotPasswordExpiry")
            .populate("department", "name code");


        if (!student) {
            return next(new AppError("Student not found", 404));
        }


        // Find student's attendance
        const attendance = await Attendance.find({
            student: studentId
        })
            .populate("subject", "subjectName subjectCode")
            .populate("teacher", "fullName employeeId")
            .populate("routine", "day startTime endTime room")
            .sort({ date: -1 });


        res.status(200).json({
            success: true,

            student,

            attendance: {
                totalClasses: attendance.length,

                present: attendance.filter(
                    item => item.status === "PRESENT"
                ).length,

                absent: attendance.filter(
                    item => item.status === "ABSENT"
                ).length,

                records: attendance
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


export {
    viewStudents,
    viewTeachers,
    viewSubjects,
    viewRoutine,
    viewAttendance,
    viewStudentDetails,
    viewStudentDashboard
};