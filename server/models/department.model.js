import { Schema, model } from "mongoose";

const departmentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Department name is required"],
        unique: true,
        trim: true,
        minlength: [2, "Department name must be at least 2 characters"],
        maxlength: [50, "Department name should be less than 30 characters"]
    },

    code: {
        type: String,
        required: [true, "Department code is required"],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [2, "Department code must be at least 2 characters"],
        maxlength: [10, "Department code should be less than 10 characters"]
    },

    description: {
        type: String,
        trim: true,
        maxlength: [
            200,
            "Description should be less than 200 characters"
        ]
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Department = model("Department", departmentSchema);
export default Department;