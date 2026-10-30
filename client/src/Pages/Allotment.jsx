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
  const [teacherAllotments, setTeacherAllotments] = useState([]);

  const [studentDepartmentId, setStudentDepartmentId] = useState("");
  const [teacherDepartmentId, setTeacherDepartmentId] = useState("");

  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingAllotments, setLoadingAllotments] = useState(false);

  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [submittingTeacher, setSubmittingTeacher] = useState(false);

  // Fetch all departments
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

  // Fetch all students (not department-wise)
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);

    try {
      const response = await axiosInstance.get("/user/students");

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
  }, []);

  // Fetch all teachers independently of their department assignments
  const fetchTeachers = useCallback(async () => {
    setLoadingTeachers(true);

    try {
      const response = await axiosInstance.get("/user/teachers");

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
  }, []);

  // Fetch teacher-department assignment records
  const fetchTeacherAllotments = useCallback(async () => {
    setLoadingAllotments(true);

    try {
      const response = await axiosInstance.get("/allotment/teachers");

      if (response.data?.success) {
        setTeacherAllotments(response.data.allotments || []);
      } else {
        setTeacherAllotments([]);
        toast.error(
          response.data?.message || "Failed to load teacher allotments."
        );
      }
    } catch (error) {
      setTeacherAllotments([]);
      toast.error(
        error.response?.data?.message ||
          "Failed to load teacher allotments."
      );
    } finally {
      setLoadingAllotments(false);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    fetchDepartments();
    fetchStudents();
    fetchTeachers();
    fetchTeacherAllotments();
  }, [
    fetchDepartments,
    fetchStudents,
    fetchTeachers,
    fetchTeacherAllotments,
  ]);

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
        setTeacherDepartmentId("");

        await fetchTeacherAllotments();
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

  const refreshAllData = async () => {
    await Promise.all([
      fetchDepartments(),
      fetchStudents(),
      fetchTeachers(),
      fetchTeacherAllotments(),
    ]);
  };

  const getDepartmentName = (department) =>
    department?.name || department?.code || "Department";

  const getUserName = (user) =>
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Unnamed user";

  return (
    <HomeLayout>
      <main className="min-h-screen bg-gray-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
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
              onClick={refreshAllData}
              disabled={
                loadingDepartments ||
                loadingStudents ||
                loadingTeachers ||
                loadingAllotments
              }
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900 disabled:opacity-60"
            >
              <FaSyncAlt
                className={
                  loadingDepartments ||
                  loadingStudents ||
                  loadingTeachers ||
                  loadingAllotments
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh Data
            </button>
          </div>

          {loadingDepartments ? (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-gray-700 bg-gray-800">
              <span className="loading loading-spinner loading-lg text-warning" />
            </div>
          ) : departments.length === 0 ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center">
              <FaBuilding className="mx-auto text-4xl text-yellow-500" />

              <h2 className="mt-4 text-xl font-bold">
                No Departments Found
              </h2>

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
                    <h2 className="text-xl font-bold">
                      Student Allotment
                    </h2>
                    <p className="text-sm text-gray-400">
                      Assign a department, semester and section.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleStudentAllotment}
                  className="space-y-5"
                >
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
                        setStudentDepartmentId(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="">Select department</option>

                      {departments.map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
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
                      disabled={loadingStudents}
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

                    {!loadingStudents && students.length === 0 && (
                      <p className="mt-2 text-sm text-amber-400">
                        No students found. Create student accounts first.
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
                    {submittingStudent
                      ? "Allocating Student..."
                      : "Allocate Student"}
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
                    <h2 className="text-xl font-bold">
                      Teacher Allotment
                    </h2>
                    <p className="text-sm text-gray-400">
                      Assign a teacher to a department.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleTeacherAllotment}
                  className="space-y-5"
                >
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
                        setTeacherDepartmentId(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="">Select department</option>

                      {departments.map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
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
                      disabled={loadingTeachers}
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

                    {!loadingTeachers && teachers.length === 0 && (
                      <p className="mt-2 text-sm text-amber-400">
                        No teachers found. Create teacher accounts first.
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-400">
                    All teachers are available here, regardless of their
                    existing department assignments. A teacher can be
                    assigned to multiple departments.
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTeacher || loadingTeachers}
                    className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingTeacher
                      ? "Allocating Teacher..."
                      : "Allocate Teacher"}
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* Teacher Department Assignments */}
          {!loadingDepartments && departments.length > 0 && (
            <section className="mt-8 rounded-2xl border border-gray-700 bg-gray-800 p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    Teacher Department Assignments
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Teachers and the departments assigned to them.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchTeacherAllotments}
                  disabled={loadingAllotments}
                  className="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-3 py-2 text-sm text-yellow-500 transition hover:bg-yellow-500 hover:text-gray-900 disabled:opacity-60"
                >
                  <FaSyncAlt
                    className={loadingAllotments ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {loadingAllotments ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg text-warning" />
                </div>
              ) : teacherAllotments.length === 0 ? (
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
                  <FaChalkboardTeacher className="mx-auto text-3xl text-yellow-500" />

                  <p className="mt-3 font-semibold">
                    No Teacher Assignments Found
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Teacher department assignments will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="border-b border-gray-700 text-yellow-500">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Teacher</th>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Department</th>
                      </tr>
                    </thead>

                    <tbody>
                      {teacherAllotments.map((allotment, index) => (
                        <tr
                          key={allotment._id}
                          className="border-b border-gray-700 last:border-0 hover:bg-gray-700/40"
                        >
                          <td className="px-4 py-4 text-gray-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold">
                              {getUserName(allotment.teacher)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {allotment.teacher?.email || "No email"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-gray-300">
                            {allotment.teacher?.employeeId || "N/A"}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-400">
                              {getDepartmentName(allotment.department)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Available Departments */}
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
