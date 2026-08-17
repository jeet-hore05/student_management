import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";


const cookieOptions = {
    maxAge : 7*24*60*60*1000,  // 7 days
    httpOnly : true,
    secure : true
}

// CREATE STUDENT
// Only ADMIN should be able to call this controller

const createStudent = async(req,res,next)=>{

    try{
        const {
            fullName,
            email,
            password,
            rollNumber,
            department,
            semester
        } = req.body;

        // Check required fields
        if (
            !fullName ||
            !email ||
            !password ||
            !rollNumber ||
            !department ||
            !semester
        ) {
            return next(
                new AppError("All fields are required", 400)
            );
        }
        // Check if email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(
                new AppError("Email already exists.", 400)
            );
        }


        // Check if roll number already exists
        const rollNumberExists = await User.findOne({
            rollNumber
        });

        if (rollNumberExists) {
            return next(
                new AppError("Roll number already exists.", 400)
            );
        }

        // Create student
        const student = await User.create({

            fullName,
            email,
            password,

            // IMPORTANT:
            // Admin decides the role.
            // Student cannot decide their own role.
            role: "STUDENT",

            rollNumber,
            department,
            semester,

            avatar: {
                public_id: email,
                secure_url: ""
            }
        });

        if (!student) {
            return next(
                new AppError(
                    "Student creation failed, try again.",
                    400
                )
            );
        }

        //TODO : File upload
        if(req.file){
        try{
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder : "student",
                width : 250,
                height : 250,
                gravity : "faces",
                crop : "fill"
            });

            if(result) {
                student.avatar.public_id = result.public_id;
                student.avatar.secure_url = result.secure_url;

                await student.save();
                // remove file from server
                await fs.rm(`uploads/${req.file.filename}`)
            }
        }catch(error){
            return next(
                new AppError(error.message || "File not uploaded, please try again.",500)
            )
        }
    }


        // Remove password from response
        student.password = undefined;


        res.status(201).json({
            success: true,
            message: "Student created successfully",
            student
        });

    } catch(error){
        return next(
            new AppError(error.message, 500)
        );
    }
};

// CREATE TEACHER
// Only ADMIN should be able to call this controller

const createTeacher = async (req, res, next) => {

    try {

        const {
            fullName,
            email,
            password
        } = req.body;


        if (!fullName || !email || !password) {
            return next(
                new AppError("All fields are required", 400)
            );
        }

        // Check email
        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(
                new AppError("Email already exists.", 400)
            );
        }


        // Create teacher
        const teacher = await User.create({

            fullName,
            email,
            password,

            // Role is decided by admin/controller
            role: "TEACHER",

            avatar: {
                public_id: email,
                secure_url: ""
            }
        });

        if (!teacher) {
            return next(
                new AppError(
                    "Teacher creation failed, try again.",
                    400
                )
            );
        }

        // TODO : File upload

        if(req.file){
        try{
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder : "student",
                width : 250,
                height : 250,
                gravity : "faces",
                crop : "fill"
            });

            if(result) {
                teacher.avatar.public_id = result.public_id;
                teacher.avatar.secure_url = result.secure_url;

                await student.save();
                // remove file from server
                await fs.rm(`uploads/${req.file.filename}`)
            }
        }catch(error){
            return next(
                new AppError(error.message || "File not uploaded, please try again.",500)
            )
        }
    }



        teacher.password = undefined;


        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacher
        });

    } catch (e) {

        return next(
            new AppError(e.message, 500)
        );
    }
};



const login = async(req,res,next)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return next(new AppError("All fields are requird.",400));
        }

        const user = await User.findOne({
            email
        }).select("+password"); // password need explictly

        if(!user || !( await user.comparePassword(password))) {
            return next(new AppError("Email or password does not match.",400));
        }   

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success : true,
            message : "User logged In successfully",
            user
        })
    } catch(e){
        return next(new AppError(e.message,500));
    }


};

const logout = (req,res)=>{
    res.cookie("token", null, {
        secure : true,
        maxAge : 0,
        httpOnly : true
    });

    res.status(200).json({
        success:true,
        message:"User logged out."
    })
};

const getProfile = async(req,res)=>{
    try{
        const userId = req.user.id;

        const user = await User.findById(userId);

        res.status(200).json({
            success : true,
            message:"User details",
            user
        })
    } catch(e){
        return next(new AppError("Failed to fetch user details",500));
    }

};


export {
    createStudent,
    createTeacher,
    login,
    logout,
    getProfile
}