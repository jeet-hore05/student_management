import User from "../models/user.model.js";
import Department from "../models/department.model.js";
import TeacherDepartment from "../models/teacherDepartment.model.js";

import AppError from "../utils/error.util.js";

const createDepartment = async(req,res,next) =>{
    try{
        const { name, code, description } = req.body;

        if(!name || !code || !description){
            return next(new AppError("Department name & code are required", 400));
        }

        const departmentNameExists =await Department.findOne({name: name.trim()});

        if(departmentNameExists){
            return next(new AppError("Department name is already exists.", 400));
        }

        const departmentCodeExists =
            await Department.findOne({
                code: code.toUpperCase().trim()
            });

        if (departmentCodeExists) {
            return next(
                new AppError("Department code already exists.",400)
            );
        }

        const department = await Department.create({
            name : name.trim(),
            code : code.toUpperCase().trim(),
            description: description.trim()
        });

        if(!department) {
            return next(new AppError("Department creation failed. Please try again.", 400));
        }

        res.status(201).json({
            success : true,
            message : "Department created successfully",
            department
        })

    } catch(error){
        return next(new AppError(error.message, 500));
    }
};

const allotStudent = async (req, res, next) => {
    try {
        const { studentId, departmentId, semester, section } = req.body;

        if (!studentId || !departmentId || !semester || !section) {
            return next(new AppError("Student Id, department Id , section, semester are required", 400));
        }

        // find student
        const student = await User.findById(studentId);
        if (!student) {
            return next(new AppError("Student not found.", 404));
        }

        // check weather selected user is actually a student

        if (student.role !== "STUDENT") {
            return next(new AppError("Selected user is not a student", 404));
        }

        //find department
        const department = await Department.findById(departmentId);
        if (!department) {
            return next(new AppError("Department not found.", 404));
        }

        if (!department.isActive) {
            return next(new AppError("Department is currently inactive.", 400));
        }

        // allot student

        student.department = departmentId;
        student.semester = semester;
        student.section = section;

        await student.save();

        const updatedStudent = await User
            .findById(student._id)
            .populate("department");

        res.status(200).json({

            success: true,
            message: "Student allotted successfully.",
            student: updatedStudent
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// const allotTeacher = async (req, res, next) => {
//     try {
//         const { teacherId, departmentId } = req.body;

//         if (!teacherId || !departmentId) {
//             return next(new AppError("Teacher ID and Department ID are required", 400));
//         }

//         // find teacher
//         const teacher = await User.findById(teacherId);
//         if (!teacher) {
//             return next(new AppError("Teacher not found.", 404));
//         }

//         // check weather selected user is actually a Teacher

//         if (teacher.role !== "TEACHER") {
//             return next(new AppError("Selected user is not a teacher", 404));
//         }

//         //find department
//         const department = await Department.findById(departmentId);
//         if (!department) {
//             return next(new AppError("Department not found.", 404));
//         }

//         if (!department.isActive) {
//             return next(new AppError("Department is currently inactive.", 400));
//         }

//         // allot teacher

//         teacher.department = departmentId;
//         await teacher.save();
//         const updatedTeacher = await User
//             .findById(teacher._id)
//             .populate("department");

//         res.status(200).json({

//             success: true,
//             message: "Teacher allotted successfully.",
//             teacher: updatedTeacher
//         });

//     } catch (error) {
//         return next(new AppError(error.message, 500));
//     }
// };

// get student of a department
const getDepartmentStudents = async (req, res, next) => {
    try {
        const { departmentId, semester, section } = req.query;

        if (!departmentId) { // check required dept.
            return next(new AppError("Department ID is required.", 400));
        }

        const department = await Department.findById(
            departmentId
        );

        if (!department) {
            return next(
                new AppError(
                    "Department not found.",
                    404
                )
            );
        }

        // Build query 
        const query = {
            role: "STUDENT",
            department: departmentId
        }

        // If semester is provided
        if (semester) {
            query.semester = semester;
        }

        // If section is provided
        if (section) {
            query.section = section;
        }

        // find student
        const students = await User
            .find(query)
            .populate("department")
            .select("-password");

        res.status(200).json({

            success: true,
            message: "Students fetched successfully.",
            count: students.length,
            students
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

//Get teachers of a dept.
// const getDepartmentTeachers = async (req, res, next) => {
//     try {

//         const { departmentId } = req.query;

//         if (!departmentId) {

//             return next(
//                 new AppError(
//                     "Department ID is required.",
//                     400
//                 )
//             );
//         }

//         const department = await Department.findById(
//             departmentId
//         );

//         if (!department) {

//             return next(
//                 new AppError(
//                     "Department not found.",
//                     404
//                 )
//             );
//         }

//         const teachers = await User
//             .find({
//                 role: "TEACHER",
//                 department: departmentId
//             })
//             .populate("department")
//             .select("-password");


//         res.status(200).json({

//             success: true,
//             message: "Teachers fetched successfully.",
//             count: teachers.length,
//             teachers
//         });


//     } catch (error) {

//         return next(
//             new AppError(
//                 error.message,
//                 500
//             )
//         );
//     }
// };

const getAllDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            message: "Departments fetched successfully.",
            count: departments.length,
            departments
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// ALLOT A TEACHER TO A DEPARTMENT
const allotTeacherToDepartment = async (req, res, next) => {
  try {
    const { teacherId, departmentId } = req.body;

    if (!teacherId || !departmentId) {
      return next(
        new AppError("Teacher and department are required.", 400)
      );
    }

    const teacher = await User.findOne({
      _id: teacherId,
      role: "TEACHER",
      isActive: { $ne: false },
    });

    if (!teacher) {
      return next(new AppError("Teacher not found or inactive.", 404));
    }

    const department = await Department.findOne({
      _id: departmentId,
      isActive: { $ne: false },
    });

    if (!department) {
      return next(new AppError("Department not found or inactive.", 404));
    }

    const existingAllotment = await TeacherDepartment.findOne({
      teacher: teacherId,
      department: departmentId,
    });

    if (existingAllotment) {
      return next(
        new AppError("This teacher is already allotted to this department.", 400)
      );
    }

    const allotment = await TeacherDepartment.create({
      teacher: teacherId,
      department: departmentId,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher allotted to department successfully.",
      allotment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError("This teacher is already allotted to this department.", 400)
      );
    }

    return next(new AppError(error.message, 500));
  }
};


// GET ALL TEACHER-DEPARTMENT ALLOTMENTS
const getTeacherDepartmentAllotments = async (req, res, next) => {
  try {
    const allotments = await TeacherDepartment.find()
      .populate("teacher", "fullName email employeeId")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: allotments.length,
      allotments,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
    createDepartment,
    allotStudent,
    // allotTeacher,
    getDepartmentStudents,
    // getDepartmentTeachers,
    getAllDepartments,
    allotTeacherToDepartment,
    getTeacherDepartmentAllotments
};