import Subject from "../models/subject.model.js";
import Department from "../models/department.model.js";
import AppError from "../utils/error.util.js";

//Create a new subject
const createSubject = async (req, res, next) => {
    try {
        const { subjectName, subjectCode, department, semester, subjectType } = req.body;

        if (!subjectName || !subjectCode || !department || !semester) {
            return next(new AppError("Please provide all required fields.", 400));
        }

        // Check required fields
        if (!subjectName || !subjectCode || !department || !semester) {
            return next(new AppError("Please provide all required fields", 400));
        }


        // Check if department exists
        const departmentExists = await Department.findById(department);

        if (!departmentExists) {
            return next(new AppError("Department not found", 404));
        }


        // Check if department is active
        if (!departmentExists.isActive) {
            return next(new AppError("Department is not active", 400));
        }


        // Check if subject code already exists
        const existingSubject = await Subject.findOne({
            subjectCode: subjectCode.toUpperCase()
        });

        if (existingSubject) {
            return next(new AppError("Subject code already exists", 409));
        }
        // create subject
        const subject = await Subject.create({
            subjectName,
            subjectCode,
            department,
            semester,
            subjectType: subjectType || "THEORY"
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.find()
            .populate("department", "name code")
            .sort({ subjectName: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get subjects by department
const getSubjectsByDepartment = async (req, res, next) => {
    try {

        const { departmentId } = req.params;

        // Check department
        const departmentExists = await Department.findById(departmentId);

        if (!departmentExists) {
            return next(new AppError("Department not found", 404));
        }


        const subjects = await Subject.find({
            department: departmentId,
            isActive: true
        })
            .populate("department", "name code")
            .sort({ semester: 1, subjectName: 1 });


        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// Get subjects by semester
const getSubjectsBySemester = async (req, res, next) => {
    try {

        const { semester } = req.params;

        const subjects = await Subject.find({
            semester: semester,
            isActive: true
        })
            .populate("department", "name code")
            .sort({ subjectName: 1 });


        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// Update subject
const updateSubject = async (req, res, next) => {
    try {

        const { subjectId } = req.params;

        const {
            subjectName,
            subjectCode,
            department,
            semester,
            subjectType,
            isActive
        } = req.body;


        // Find subject
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return next(new AppError("Subject not found", 404));
        }


        // If department is being changed, check department
        if (department) {

            const departmentExists = await Department.findById(department);

            if (!departmentExists) {
                return next(new AppError("Department not found", 404));
            }

            if (!departmentExists.isActive) {
                return next(new AppError("Department is not active", 400));
            }

            subject.department = department;
        }


        // Check subject code
        if (subjectCode && subjectCode.toUpperCase() !== subject.subjectCode) {

            const existingSubject = await Subject.findOne({
                subjectCode: subjectCode.toUpperCase(),
                _id: { $ne: subjectId }
            });

            if (existingSubject) {
                return next(new AppError("Subject code already exists", 409));
            }

            subject.subjectCode = subjectCode.toUpperCase();
        }


        // Update fields
        if (subjectName) subject.subjectName = subjectName;
        if (semester) subject.semester = semester;
        if (subjectType) subject.subjectType = subjectType;

        if (typeof isActive === "boolean") {
            subject.isActive = isActive;
        }


        await subject.save();


        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            subject
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



// Delete subject
const deleteSubject = async (req, res, next) => {
    try {

        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return next(new AppError("Subject not found", 404));
        }


        await Subject.findByIdAndDelete(subjectId);


        res.status(200).json({
            success: true,
            message: "Subject deleted successfully"
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    createSubject,
    getAllSubjects,
    getSubjectsByDepartment,
    getSubjectsBySemester,
    updateSubject,
    deleteSubject
}
