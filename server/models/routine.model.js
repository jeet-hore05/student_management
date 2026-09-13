import { Schema, model } from "mongoose";

const routineSchema = new Schema({
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

    section: {
        type: String,
        required: [true, "Section is required"],
        trim: true,
        uppercase: true
    },

    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: [true, "Subject is required"]
    },

    teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Teacher is required"]
    },

    day: {
        type: String,
        enum: [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY"
        ],
        required: [true, "Day is required"]
    },

    startTime: {
        type: String,
        required: [true, "Start time is required"]
    },

    endTime: {
        type: String,
        required: [true, "End time is required"]
    },

    room: {
        type: String,
        trim: true
    },

    routineType: {
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

    });

const Routine = model("Routine", routineSchema);

export default Routine;