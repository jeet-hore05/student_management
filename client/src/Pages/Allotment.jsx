import { useCallback, useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBuilding,
  FaSyncAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

const Allotment = () => {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [departmentId, setDepartmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");

  const [studentDepartmentId, setStudentDepartmentId] = useState("");
  const [teacherDepartmentId, setTeacherDepartmentId] = useState("");

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [submittingTeacher, setSubmittingTeacher] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoadingDepartments(true);

    try {
      const response = await axiosInstance.get("/allotment/departments");

      if (response.data?.success) {
        setDepartments(response.data.departments || []);
      } else {
        toast.error(response.data?.message || "Failed to load departments.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!studentDepartmentId) {
      setStudents([]);
      return;
    }

    setLoadingStudents(true);

    try {
      const response = await axiosInstance.get("/allotment/students", {
        params: { departmentId: studentDepartmentId },
      });

      if (response.data?.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents([]);
        toast.error(response.data?.message || "Failed to load students.");
      }
    } catch (error) {
      setStudents([]);
      toast.error(
        error.response?.data?.message || "Failed to load students."
      );
    } finally {
      setLoadingStudents(false);
    }
  }, [studentDepartmentId]);

  const fetchTeachers = useCallback(async () => {
    if (!teacherDepartmentId) {
      setTeachers([]);
      return;
    }

    setLoadingTeachers(true);

    try {
      const response = await axiosInstance.get("/allotment/teachers", {
        params: { departmentId: teacherDepartmentId },
      });

      if (response.data?.success) {
        setTeachers(response.data.teachers || []);
      } else {
        setTeachers([]);
        toast.error(response.data?.message || "Failed to load teachers.");
      }
    } catch (error) {
      setTeachers([]);
      toast.error(
        error.response?.data?.message || "Failed to load teachers."
      );
    } finally {
      setLoadingTeachers(false);
    }
  }, [teacherDepartmentId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleStudentDepartmentChange = (value) => {
    setStudentDepartmentId(value);
    setStudentId("");
  };

  const handleTeacherDepartmentChange = (value) => {
    setTeacherDepartmentId(value);
    setTeacherId("");
  };

  const handleStudentAllotment = async (event) => {
    event.preventDefault();

    if (!studentId || !studentDepartmentId || !semester || !section) {
      toast.error("Please fill in all student allotment fields.");
      return;
    }

    setSubmittingStudent(true);

    try {
      const response = await axiosInstance.post("/allotment/student", {
        studentId,
        departmentId: studentDepartmentId,
        semester: Number(semester),
        section: section.trim().toUpperCase(),
      });

      if (response.data?.success) {
        toast.success(
          response.data.message || "Student allotted successfully."
        );

        setStudentId("");
        setSemester("");
        setSection("");

        await fetchStudents();
      } else {
        toast.error(response.data?.message || "Student allotment failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Student allotment failed."
      );
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleTeacherAllotment = async (event) => {
    event.preventDefault();

    if (!teacherId || !teacherDepartmentId) {
      toast.error("Please select a teacher and department.");
      return;
    }

    setSubmittingTeacher(true);

    try {
      const response = await axiosInstance.post("/allotment/teacher", {
        teacherId,
        departmentId: teacherDepartmentId,
      });

      if (response.data?.success) {
        toast.success(
          response.data.message || "Teacher allotted successfully."
        );

        setTeacherId("");
        await fetchTeachers();
      } else {
        toast.error(response.data?.message || "Teacher allotment failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Teacher allotment failed."
      );
    } finally {
      setSubmittingTeacher(false);
    }
  };

  const getDepartmentName = (department) =>
    department?.name || department?.code || "Department";

  const getUserName = (user) =>
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Unnamed user";

  const getUserId = (user) => user?._id || user?.id || "";

  return (
    <HomeLayout>
      <main className="min-h-screen bg-gray-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                Academic Management
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Student & Teacher{" "}
                <span className="text-yellow-500">Allotment</span>
              </h1>
              <p className="mt-3 max-w-2xl text-gray-400">
                Assign students and teachers to their respective departments.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDepartments}
              disabled={loadingDepartments}
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900 disabled:opacity-60"
            >
              <FaSyncAlt className={loadingDepartments ? "animate-spin" : ""} />
              Refresh Departments
            </button>
          </div>

          {loadingDepartments ? (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-gray-700 bg-gray-800">
              <span className="loading loading-spinner loading-lg text-warning" />
            </div>
          ) : departments.length === 0 ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center">
              <FaBuilding className="mx-auto text-4xl text-yellow-500" />
              <h2 className="mt-4 text-xl font-bold">No Departments Found</h2>
              <p className="mt-2 text-gray-400">
                Create a department before allotting students or teachers.
              </p>
              <button
                type="button"
                onClick={fetchDepartments}
                className="mt-5 rounded-lg bg-yellow-500 px-5 py-2 font-bold text-gray-900 hover:bg-yellow-400"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Student Allotment */}
              <section className="rounded-2xl border border-gray-700 bg-gray-800 p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-xl text-gray-900">
                    <FaUserGraduate />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Student Allotment</h2>
                    <p className="text-sm text-gray-400">
                      Assign a department, semester and section.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStudentAllotment} className="space-y-5">
                  <div>
                    <label
                      htmlFor="studentDepartment"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Department
                    </label>
                    <select
                      id="studentDepartment"
                      value={studentDepartmentId}
                      onChange={(event) =>
                        handleStudentDepartmentChange(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {getDepartmentName(department)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="student"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Student
                    </label>
                    <select
                      id="student"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value)}
                      required
                      disabled={!studentDepartmentId || loadingStudents}
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500 disabled:opacity-60"
                    >
                      <option value="">
                        {loadingStudents
                          ? "Loading students..."
                          : "Select student"}
                      </option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {getUserName(student)} — {student.email}
                        </option>
                      ))}
                    </select>
                    {studentDepartmentId &&
                      !loadingStudents &&
                      students.length === 0 && (
                        <p className="mt-2 text-sm text-amber-400">
                          No students found in this department.
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="semester"
                        className="mb-2 block text-sm font-medium text-gray-200"
                      >
                        Semester
                      </label>
                      <select
                        id="semester"
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                      >
                        <option value="">Select semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                          <option key={value} value={value}>
                            Semester {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="section"
                        className="mb-2 block text-sm font-medium text-gray-200"
                      >
                        Section
                      </label>
                      <select
                        id="section"
                        value={section}
                        onChange={(event) => setSection(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                      >
                        <option value="">Select section</option>
                        {["A", "B", "C", "D"].map((value) => (
                          <option key={value} value={value}>
                            Section {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingStudent || loadingStudents}
                    className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingStudent ? "Allocating Student..." : "Allocate Student"}
                  </button>
                </form>
              </section>

              {/* Teacher Allotment */}
              <section className="rounded-2xl border border-gray-700 bg-gray-800 p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-xl text-gray-900">
                    <FaChalkboardTeacher />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Teacher Allotment</h2>
                    <p className="text-sm text-gray-400">
                      Assign a teacher to a department.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTeacherAllotment} className="space-y-5">
                  <div>
                    <label
                      htmlFor="teacherDepartment"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Department
                    </label>
                    <select
                      id="teacherDepartment"
                      value={teacherDepartmentId}
                      onChange={(event) =>
                        handleTeacherDepartmentChange(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {getDepartmentName(department)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="teacher"
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Teacher
                    </label>
                    <select
                      id="teacher"
                      value={teacherId}
                      onChange={(event) => setTeacherId(event.target.value)}
                      required
                      disabled={!teacherDepartmentId || loadingTeachers}
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500 disabled:opacity-60"
                    >
                      <option value="">
                        {loadingTeachers
                          ? "Loading teachers..."
                          : "Select teacher"}
                      </option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {getUserName(teacher)} — {teacher.email}
                        </option>
                      ))}
                    </select>
                    {teacherDepartmentId &&
                      !loadingTeachers &&
                      teachers.length === 0 && (
                        <p className="mt-2 text-sm text-amber-400">
                          No teachers found in this department.
                        </p>
                      )}
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-400">
                    Teachers are fetched from the selected department. A
                    teacher already assigned elsewhere may not appear in this
                    list.
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTeacher || loadingTeachers}
                    className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingTeacher ? "Allocating Teacher..." : "Allocate Teacher"}
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* Department list */}
          {!loadingDepartments && departments.length > 0 && (
            <section className="mt-8 rounded-2xl border border-gray-700 bg-gray-800 p-5 sm:p-7">
              <h2 className="text-xl font-bold">Available Departments</h2>
              <p className="mt-1 text-sm text-gray-400">
                Departments returned by your backend.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <div
                    key={department._id}
                    className="rounded-xl border border-gray-700 bg-gray-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {department.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Code: {department.code}
                        </p>
                      </div>
                      <FaBuilding className="mt-1 shrink-0 text-xl text-yellow-500" />
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                      {department.description || "No description available."}
                    </p>
                    <span
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        department.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </HomeLayout>
  );
};

export default Allotment;
