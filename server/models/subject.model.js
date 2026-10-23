import { Schema, model } from "mongoose";

const subjectSchema = new Schema(
    {
        subjectName: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
            minLength: [2, "Subject name must be at least 2 charcters"],
            maxLength: [50, "Subject name sholud be less than 50 characters"]
        },
        subjectCode: {
            type: String,
            required: [true, "Subject code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [2, "Subject code must be at least 2 characters"],
            maxlength: [20, "Subject code should be less than 20 characters"]
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"]
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [1, "Semester must be at least 1"],
            max: [8, "Semester cannot be greater than 8"]
        },

        subjectType: {
            type: String,
            enum: ["THEORY", "PRACTICAL"],
            default: "THEORY"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Subject = model("Subject", subjectSchema);

export default Subject;