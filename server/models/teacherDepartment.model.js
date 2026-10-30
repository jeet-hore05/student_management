import { Schema, model } from "mongoose";

const teacherDepartmentSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate allotments for the same teacher and department.
teacherDepartmentSchema.index(
  { teacher: 1, department: 1 },
  { unique: true }
);

const TeacherDepartment = model(
  "TeacherDepartment",
  teacherDepartmentSchema
);

export default TeacherDepartment;