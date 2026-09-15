import {Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"]
    },

    routine: {
      type: Schema.Types.ObjectId,
      ref: "Routine",
      required: [true, "Routine is required"]
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

    date: {
      type: Date,
      required: [true, "Attendance date is required"]
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      required: [true, "Attendance status is required"]
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [200, "Remarks should be less than 200 characters"]
    }
  },
  {
    timestamps: true
  }
);


// Prevent duplicate attendance for the same student,
// routine and date
attendanceSchema.index(
  {
    student: 1,
    routine: 1,
    date: 1
  },
  {
    unique: true
  }
);


const Attendance = model("Attendance", attendanceSchema);

export default Attendance;