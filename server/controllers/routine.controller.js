import User from "../models/user.model.js";
import Routine from "../models/routine.model.js";
import Department from "../models/department.model.js";
import Subject from "../models/subject.model.js";
import AppError from "../utils/error.util.js";

const createRoutine = async (req, res, next) => {
    try {
        const {
            department,
            semester,
            section,
            subject,
            teacher,
            day,
            startTime,
            endTime,
            room,
            routineType
        } = req.body;

        if (
            !department ||
            !semester ||
            !section ||
            !subject ||
            !teacher ||
            !day ||
            !startTime ||
            !endTime
        ) {
            return next(
                new AppError("Please provide all required fields", 400)
            );
        }

        // Check department
        const departmentExists = await Department.findById(department);

        if (!departmentExists) {
            return next(new AppError("Department not found", 404));
        }

        if (!departmentExists.isActive) {
            return next(new AppError("Department is not active", 400));
        }

        // Check subject
        const subjectExists = await Subject.findById(subject);

        if (!subjectExists) {
            return next(new AppError("Subject not found", 404));
        }

        if (!subjectExists.isActive) {
            return next(new AppError("Subject is not active", 400));
        }

        // Check teacher
        const teacherExists = await User.findById(teacher);

        if (!teacherExists) {
            return next(new AppError("Teacher not found", 404));
        }

        if (teacherExists.role !== "TEACHER") {
            return next(new AppError("Selected user is not a teacher", 400));
        }
        // Check whether the same subject is already scheduled
        const existingRoutine = await Routine.findOne({
            department,
            semester,
            section: section.toUpperCase(),
            day,
            startTime,
            isActive: true
        });

        if (existingRoutine) {
            return next(
                new AppError(
                    "A class is already scheduled at this time",
                    409
                )
            );
        }

        // Create routine
        const routine = await Routine.create({
            department,
            semester,
            section,
            subject,
            teacher,
            day,
            startTime,
            endTime,
            room,
            routineType: routineType || "THEORY"
        });


        // Populate references
        await routine.populate([
            {
                path: "department",
                select: "name code"
            },
            {
                path: "subject",
                select: "subjectName subjectCode"
            },
            {
                path: "teacher",
                select: "fullName email employeeId"
            }
        ]);


        res.status(201).json({
            success: true,
            message: "Routine created successfully",
            routine
        });

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
};

// Get complete routine
const getAllRoutines = async (req, res, next) => {
  try {

    const routines = await Routine.find({
      isActive: true
    })
      .populate("department", "name code")
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "fullName email employeeId")
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
    return next(error);
  }
};



// Get routine by department, semester and section
const getRoutine = async (req, res, next) => {
  try {

    const {
      departmentId,
      semester,
      section
    } = req.query;


    if (!departmentId || !semester || !section) {
      return next(
        new AppError(
          "Department, semester and section are required",
          400
        )
      );
    }


    // Check department
    const departmentExists = await Department.findById(departmentId);

    if (!departmentExists) {
      return next(new AppError("Department not found", 404));
    }


    const routines = await Routine.find({
      department: departmentId,
      semester,
      section: section.toUpperCase(),
      isActive: true
    })
      .populate("department", "name code")
      .populate("subject", "subjectName subjectCode subjectType")
      .populate("teacher", "fullName employeeId")
      .sort({
        day: 1,
        startTime: 1
      });


    res.status(200).json({
      success: true,
      count: routines.length,
      routines
    });

  } catch (error) {
    return next(error);
  }
};



// Get routine for a particular day
const getRoutineByDay = async (req, res, next) => {
  try {

    const {
      departmentId,
      semester,
      section,
      day
    } = req.query;


    if (!departmentId || !semester || !section || !day) {
      return next(
        new AppError(
          "Department, semester, section and day are required",
          400
        )
      );
    }


    const routines = await Routine.find({
      department: departmentId,
      semester,
      section: section.toUpperCase(),
      day: day.toUpperCase(),
      isActive: true
    })
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "fullName employeeId")
      .sort({
        startTime: 1
      });


    res.status(200).json({
      success: true,
      count: routines.length,
      routines
    });

  } catch (error) {
    return next(error);
  }
};



// Update routine
const updateRoutine = async (req, res, next) => {
  try {

    const { routineId } = req.params;

    const {
      subject,
      teacher,
      day,
      startTime,
      endTime,
      room,
      routineType,
      isActive
    } = req.body;


    // Find routine
    const routine = await Routine.findById(routineId);

    if (!routine) {
      return next(new AppError("Routine not found", 404));
    }


    // Check subject if provided
    if (subject) {

      const subjectExists = await Subject.findById(subject);

      if (!subjectExists) {
        return next(new AppError("Subject not found", 404));
      }

      routine.subject = subject;
    }


    // Check teacher if provided
    if (teacher) {

      const teacherExists = await User.findById(teacher);

      if (!teacherExists) {
        return next(new AppError("Teacher not found", 404));
      }

      if (teacherExists.role !== "TEACHER") {
        return next(new AppError("Selected user is not a teacher", 400));
      }

      routine.teacher = teacher;
    }


    // Update fields
    if (day) routine.day = day.toUpperCase();
    if (startTime) routine.startTime = startTime;
    if (endTime) routine.endTime = endTime;
    if (room) routine.room = room;
    if (routineType) routine.routineType = routineType;

    if (typeof isActive === "boolean") {
      routine.isActive = isActive;
    }


    await routine.save();


    await routine.populate([
      {
        path: "department",
        select: "name code"
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
      message: "Routine updated successfully",
      routine
    });

  } catch (error) {
    return next(error);
  }
};



// Delete routine
const deleteRoutine = async (req, res, next) => {
  try {

    const { routineId } = req.params;

    const routine = await Routine.findById(routineId);

    if (!routine) {
      return next(new AppError("Routine not found", 404));
    }


    await Routine.findByIdAndDelete(routineId);


    res.status(200).json({
      success: true,
      message: "Routine deleted successfully"
    });

  } catch (error) {
    return next(error);
  }
};

export {
    createRoutine,
    getAllRoutines,
    getRoutineByDay,
    getRoutine,
    updateRoutine,
    deleteRoutine
}