import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import Routine from "../models/routine.model.js";
import Subject from "../models/subject.model.js";
import AppError from "../utils/error.util.js";

const markAttendance = async (req, res, next) => {
  try {
    const {
      student,
      routine,
      subject,
      teacher,
      date,
      status,
      remarks
    } = req.body;

    if (
      !student ||
      !routine ||
      !subject ||
      !teacher ||
      !date ||
      !status
    ) {
      return next(
        new AppError("Please provide all required fields", 400)
      );
    }

    const studentExists = await User.findById(student);

    if (!studentExists) {
      return next(new AppError("Student not found", 404));
    }

    if (studentExists.role !== "STUDENT") {
      return next(new AppError("Selected user is not a student", 400));
    }

    const routineExists = await Routine.findById(routine);

    if (!routineExists) {
      return next(new AppError("Routine not found", 404));
    }


    // Check subject
    const subjectExists = await Subject.findById(subject);

    if (!subjectExists) {
      return next(new AppError("Subject not found", 404));
    }


    // Check teacher
    const teacherExists = await User.findById(teacher);

    if (!teacherExists) {
      return next(new AppError("Teacher not found", 404));
    }

    if (teacherExists.role !== "TEACHER") {
      return next(new AppError("Selected user is not a teacher", 400));
    }


    // Check attendance status
    if (!["PRESENT", "ABSENT"].includes(status.toUpperCase())) {
      return next(
        new AppError(
          "Attendance status must be PRESENT or ABSENT",
          400
        )
      );
    }

    // Check duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student,
      routine,
      date: new Date(date)
    });

    if (existingAttendance) {
      return next(
        new AppError(
          "Attendance has already been marked for this class",
          409
        )
      );
    }


    // Create attendance
    const attendance = await Attendance.create({
      student,
      routine,
      subject,
      teacher,
      date: new Date(date),
      status: status.toUpperCase(),
      remarks
    });


    // Populate related information
    await attendance.populate([
      {
        path: "student",
        select: "fullName email rollNumber"
      },
      {
        path: "routine",
        select: "day startTime endTime room"
      },
      {
        path: "subject",
        select: "subjectName subjectCode"
      },
      {
        path: "teacher",
        select: "fullName employeeId"
      }
    ]);


    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// Get all attendance
const getAllAttendance = async (req, res, next) => {
  try {

    const attendance = await Attendance.find()
      .populate("student", "fullName email rollNumber")
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "fullName employeeId")
      .populate("routine", "day startTime endTime room")
      .sort({ date: -1 });


    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// Get attendance of a particular student
const getStudentAttendance = async (req, res, next) => {
  try {

    const { studentId } = req.params;

    // Check student
    const studentExists = await User.findById(studentId);

    if (!studentExists) {
      return next(new AppError("Student not found", 404));
    }

    if (studentExists.role !== "STUDENT") {
      return next(new AppError("User is not a student", 400));
    }


    const attendance = await Attendance.find({
      student: studentId
    })
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "fullName employeeId")
      .populate("routine", "day startTime endTime room")
      .sort({ date: -1 });


    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get attendance of a particular subject
const getSubjectAttendance = async (req, res, next) => {
  try {

    const { subjectId } = req.params;

    // Check subject
    const subjectExists = await Subject.findById(subjectId);

    if (!subjectExists) {
      return next(new AppError("Subject not found", 404));
    }


    const attendance = await Attendance.find({
      subject: subjectId
    })
      .populate("student", "fullName email rollNumber")
      .populate("teacher", "fullName employeeId")
      .populate("routine", "day startTime endTime room")
      .sort({ date: -1 });


    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// Update attendance
const updateAttendance = async (req, res, next) => {
  try {

    const { attendanceId } = req.params;

    const {
      status,
      remarks
    } = req.body;


    // Find attendance
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return next(new AppError("Attendance record not found", 404));
    }


    // Update status
    if (status) {

      if (!["PRESENT", "ABSENT"].includes(status.toUpperCase())) {
        return next(
          new AppError(
            "Attendance status must be PRESENT or ABSENT",
            400
          )
        );
      }

      attendance.status = status.toUpperCase();
    }


    // Update remarks
    if (remarks !== undefined) {
      attendance.remarks = remarks;
    }


    await attendance.save();


    await attendance.populate([
      {
        path: "student",
        select: "fullName email rollNumber"
      },
      {
        path: "subject",
        select: "subjectName subjectCode"
      },
      {
        path: "teacher",
        select: "fullName employeeId"
      }
    ]);


    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// Delete attendance
const deleteAttendance = async (req, res, next) => {
  try {

    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return next(new AppError("Attendance record not found", 404));
    }


    await Attendance.findByIdAndDelete(attendanceId);


    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully"
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



export {
  markAttendance,
  getAllAttendance,
  getStudentAttendance,
  getSubjectAttendance,
  updateAttendance,
  deleteAttendance
};