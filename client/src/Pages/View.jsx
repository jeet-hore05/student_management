import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiUser,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiBarChart2,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../Helper/axiosInstance";
import HomeLayout from "../Layouts/HomeLayout";

const TABS = [
  {
    id: "students",
    label: "Students",
    icon: FiUsers,
    endpoint: "/view/students",
    dataKey: "students",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: FiUser,
    endpoint: "/view/teachers",
    dataKey: "teachers",
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: FiBookOpen,
    endpoint: "/view/subjects",
    dataKey: "subjects",
  },
  {
    id: "routine",
    label: "Routine",
    icon: FiCalendar,
    endpoint: "/view/routine",
    dataKey: "routines",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: FiClipboard,
    endpoint: "/view/attendance",
    dataKey: "attendance",
  },
];

const ROLE_TABS = {
  ADMIN: ["students", "teachers", "subjects", "routine", "attendance"],
  TEACHER: ["students", "teachers", "subjects", "routine", "attendance"],
  STUDENT: ["subjects", "routine"],
};

const getName = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;

  return (
    value.fullName ||
    value.name ||
    value.subjectName ||
    value.email ||
    "—"
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const columns = {
  students: [
    { label: "Name", render: (r) => r.fullName },
    { label: "Roll Number", render: (r) => r.rollNumber },
    { label: "Email", render: (r) => r.email },
    { label: "Department", render: (r) => getName(r.department) },
    { label: "Semester", render: (r) => r.semester },
    { label: "Section", render: (r) => r.section },
  ],

  teachers: [
    { label: "Name", render: (r) => r.fullName },
    { label: "Employee ID", render: (r) => r.employeeId },
    { label: "Email", render: (r) => r.email },
    { label: "Department", render: (r) => getName(r.department) },
  ],

  subjects: [
    { label: "Subject", render: (r) => r.subjectName },
    { label: "Code", render: (r) => r.subjectCode },
    { label: "Department", render: (r) => getName(r.department) },
    { label: "Semester", render: (r) => r.semester },
    { label: "Type", render: (r) => r.subjectType },
  ],

  routine: [
    { label: "Day", render: (r) => r.day },
    {
      label: "Time",
      render: (r) => `${r.startTime || "—"} - ${r.endTime || "—"}`,
    },
    { label: "Subject", render: (r) => getName(r.subject) },
    { label: "Teacher", render: (r) => getName(r.teacher) },
    { label: "Department", render: (r) => getName(r.department) },
    { label: "Semester", render: (r) => r.semester },
    { label: "Section", render: (r) => r.section },
    { label: "Room", render: (r) => r.room },
  ],

  attendance: [
    { label: "Student", render: (r) => getName(r.student) },
    { label: "Roll Number", render: (r) => r.student?.rollNumber },
    { label: "Subject", render: (r) => getName(r.subject) },
    { label: "Teacher", render: (r) => getName(r.teacher) },
    { label: "Date", render: (r) => formatDate(r.date) },
    { label: "Status", render: (r) => r.status, status: true },
  ],
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>

        <Icon className="text-2xl text-yellow-400" />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-700 py-3 sm:flex-row sm:justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="break-words font-medium text-gray-100 sm:max-w-[65%] sm:text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function View() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("subjects");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const role = currentUser?.role?.toUpperCase();
  const visibleTabIds = ROLE_TABS[role] || [];

  const visibleTabs = TABS.filter((tab) =>
    visibleTabIds.includes(tab.id)
  );

  const currentTab = visibleTabs.find((tab) => tab.id === activeTab);

  // Load the authenticated user's profile.
  useEffect(() => {
    let cancelled = false;

    const fetchCurrentUser = async () => {
      setUserLoading(true);

      try {
        const response = await axiosInstance.get("/user/me");

        const user =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.profile;

        if (!user?._id || !user?.role) {
          throw new Error(
            "The /user/me response must contain the logged-in user's ID and role."
          );
        }

        if (cancelled) return;

        setCurrentUser(user);

        const userRole = user.role.toUpperCase();

        setActiveTab(
          userRole === "STUDENT" ? "subjects" : "students"
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load current user:", error);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to load your profile."
        );
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load only the records permitted for the current role.
  const fetchRecords = useCallback(async () => {
    if (!currentUser || !currentTab) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(currentTab.endpoint);

      const data = response.data?.[currentTab.dataKey];

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "View module error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          `Failed to load ${currentTab.label.toLowerCase()}.`
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTab]);

  useEffect(() => {
    if (!userLoading && currentUser && currentTab) {
      fetchRecords();
    }
  }, [userLoading, currentUser, currentTab, fetchRecords]);

  // Students see their own dashboard only.
  useEffect(() => {
    if (userLoading || role !== "STUDENT" || !currentUser?._id) {
      return;
    }

    let cancelled = false;

    const fetchOwnDashboard = async () => {
      setModalLoading(true);

      try {
        const response = await axiosInstance.get(
          `/view/student/${currentUser._id}/dashboard`
        );

        if (!cancelled) {
          setStudentDashboard(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load own dashboard:",
            error.response?.data || error
          );

          toast.error(
            error.response?.data?.message ||
              "Failed to load your attendance dashboard."
          );
        }
      } finally {
        if (!cancelled) setModalLoading(false);
      }
    };

    fetchOwnDashboard();

    return () => {
      cancelled = true;
    };
  }, [userLoading, role, currentUser?._id]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const values = [
        record.fullName,
        record.name,
        record.email,
        record.rollNumber,
        record.employeeId,
        record.subjectName,
        record.subjectCode,
        record.day,
        record.section,
        record.room,
        record.status,
        record.semester,
        record.department?.name,
        record.department?.code,
        record.subject?.subjectName,
        record.student?.fullName,
        record.student?.rollNumber,
        record.teacher?.fullName,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const openStudentDetails = async (studentId) => {
    if (!studentId) {
      toast.error("Student ID is unavailable.");
      return;
    }

    setSelectedStudent(null);
    setStudentDashboard(null);
    setModalLoading(true);

    try {
      const response = await axiosInstance.get(
        `/view/student/${studentId}`
      );

      setSelectedStudent(response.data.student);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load student details."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const openStudentDashboard = async (studentId) => {
    if (!studentId) {
      toast.error("Student ID is unavailable.");
      return;
    }

    setSelectedStudent(null);
    setStudentDashboard(null);
    setModalLoading(true);

    try {
      const response = await axiosInstance.get(
        `/view/student/${studentId}/dashboard`
      );

      setStudentDashboard(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load student dashboard."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentDashboard(null);
    setModalLoading(false);
  };

  const activeColumns = columns[activeTab] || [];

  if (userLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-900 text-white">
        <span className="loading loading-spinner loading-lg text-warning" />
        <p className="text-gray-400">Loading your account...</p>
      </div>
    );
  }

  if (!currentUser || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 text-center text-white">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <FiShield className="mx-auto mb-3 text-4xl text-yellow-400" />
          <h2 className="text-xl font-bold">Unable to verify your account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Please sign in again and reopen this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout>
    <div className="min-h-screen bg-gray-900 px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
              <FiShield />
              {role} ACCESS
            </div>

            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {role === "STUDENT" ? "My Academic Dashboard" : "View Management"}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Welcome, {currentUser.fullName || currentUser.email || "User"}.
              {" "}You can access the records permitted for your role.
            </p>
          </div>

          {role !== "STUDENT" && (
            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading || !currentTab}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 font-semibold text-gray-950 transition hover:bg-yellow-400 disabled:opacity-60"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>

        {/* Student-only dashboard */}
        {role === "STUDENT" && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="My Roll Number"
                value={currentUser.rollNumber || "—"}
                icon={FiUser}
              />
              <StatCard
                label="My Department"
                value={getName(currentUser.department)}
                icon={FiBookOpen}
              />
              <StatCard
                label="Semester"
                value={currentUser.semester ?? "—"}
                icon={FiCalendar}
              />
              <StatCard
                label="Section"
                value={currentUser.section || "—"}
                icon={FiUsers}
              />
            </div>

            <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-5">
              <h2 className="mb-4 text-lg font-bold text-white">
                My Profile
              </h2>

              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <DetailRow label="Full Name" value={currentUser.fullName} />
                <DetailRow label="Roll Number" value={currentUser.rollNumber} />
                <DetailRow label="Email" value={currentUser.email} />
                <DetailRow label="Department" value={getName(currentUser.department)} />
                <DetailRow label="Semester" value={currentUser.semester} />
                <DetailRow label="Section" value={currentUser.section} />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                My Attendance
              </h2>

              {modalLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <span className="loading loading-spinner loading-lg text-warning" />
                </div>
              ) : studentDashboard ? (
                <>
                  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                      label="Total Classes"
                      value={studentDashboard.attendance?.totalClasses ?? 0}
                      icon={FiBookOpen}
                    />
                    <StatCard
                      label="Present"
                      value={studentDashboard.attendance?.present ?? 0}
                      icon={FiCheckCircle}
                    />
                    <StatCard
                      label="Absent"
                      value={studentDashboard.attendance?.absent ?? 0}
                      icon={FiXCircle}
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max text-left text-sm">
                        <thead className="bg-gray-950 text-gray-400">
                          <tr>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Subject</th>
                            <th className="px-5 py-4">Teacher</th>
                            <th className="px-5 py-4">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-700">
                          {(studentDashboard.attendance?.records || []).map((item) => (
                            <tr key={item._id} className="hover:bg-gray-700/40">
                              <td className="px-5 py-4">{formatDate(item.date)}</td>
                              <td className="px-5 py-4">{getName(item.subject)}</td>
                              <td className="px-5 py-4">{getName(item.teacher)}</td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    item.status === "PRESENT"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-red-500/10 text-red-400"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {!(studentDashboard.attendance?.records || []).length && (
                      <p className="p-6 text-center text-sm text-gray-400">
                        No attendance records found yet.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="rounded-xl border border-gray-700 bg-gray-800 p-5 text-gray-400">
                  Your attendance dashboard could not be loaded. Please refresh the page.
                </p>
              )}
            </div>
          </>
        )}

        {/* Admin and Teacher records */}
        {role !== "STUDENT" && (
          <>
            <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 p-2">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearch("");
                    }}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-yellow-500 text-gray-950"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
              <div className="flex flex-col gap-4 border-b border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    All {currentTab?.label || "Records"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {filteredRecords.length} record(s) found
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search records..."
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                  <span className="loading loading-spinner loading-lg text-warning" />
                  <p className="text-sm text-gray-400">
                    Loading {currentTab?.label.toLowerCase()}...
                  </p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <FiSearch className="mb-3 text-4xl text-gray-600" />
                  <h3 className="font-semibold text-white">No records found</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {search
                      ? "Try another search term."
                      : "There are no records to display."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <thead className="bg-gray-950 text-xs uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-5 py-4">#</th>
                        {activeColumns.map((column) => (
                          <th key={column.label} className="px-5 py-4">
                            {column.label}
                          </th>
                        ))}
                        {activeTab === "students" && (
                          <th className="px-5 py-4 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                      {filteredRecords.map((record, index) => (
                        <tr
                          key={record._id || `${activeTab}-${index}`}
                          className="transition hover:bg-gray-700/40"
                        >
                          <td className="px-5 py-4 text-gray-400">
                            {index + 1}
                          </td>

                          {activeColumns.map((column) => {
                            const value = column.render(record);

                            return (
                              <td key={column.label} className="px-5 py-4">
                                {column.status ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                      value === "PRESENT"
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {value === "PRESENT" ? (
                                      <FiCheckCircle />
                                    ) : (
                                      <FiXCircle />
                                    )}
                                    {value || "—"}
                                  </span>
                                ) : (
                                  <span className="text-gray-200">
                                    {value ?? "—"}
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          {activeTab === "students" && (
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openStudentDetails(record._id)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-yellow-400 transition hover:border-yellow-500 hover:bg-gray-700"
                                >
                                  <FiEye />
                                  Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openStudentDashboard(record._id)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 font-semibold text-gray-950 transition hover:bg-yellow-400"
                                >
                                  <FiBarChart2 />
                                  Dashboard
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-gray-700 px-5 py-4 text-sm text-gray-400">
                Showing {filteredRecords.length} of {records.length} records
              </div>
            </div>
          </>
        )}
      </div>

      {/* Student details / dashboard modal for Admin and Teacher */}
      {role !== "STUDENT" &&
        (selectedStudent || studentDashboard || modalLoading) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-modal-title"
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-700 pb-4">
                <div>
                  <h2
                    id="student-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    {studentDashboard
                      ? "Student Attendance Dashboard"
                      : "Student Details"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Student information and academic records
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close dialog"
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white"
                >
                  <FiX size={22} />
                </button>
              </div>

              {modalLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <span className="loading loading-spinner loading-lg text-warning" />
                </div>
              ) : selectedStudent ? (
                <>
                  <div className="mb-4 rounded-xl bg-gray-900 p-4">
                    <h3 className="text-lg font-bold text-yellow-400">
                      {selectedStudent.fullName || "Student"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {selectedStudent.rollNumber || "No roll number"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <DetailRow label="Full Name" value={selectedStudent.fullName} />
                    <DetailRow label="Roll Number" value={selectedStudent.rollNumber} />
                    <DetailRow label="Email" value={selectedStudent.email} />
                    <DetailRow
                      label="Department"
                      value={getName(selectedStudent.department)}
                    />
                    <DetailRow label="Semester" value={selectedStudent.semester} />
                    <DetailRow label="Section" value={selectedStudent.section} />
                    <DetailRow
                      label="Status"
                      value={selectedStudent.isActive ? "Active" : "Inactive"}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        openStudentDashboard(selectedStudent._id)
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 font-semibold text-gray-950 transition hover:bg-yellow-400"
                    >
                      <FiBarChart2 />
                      View Attendance Dashboard
                    </button>
                  </div>
                </>
              ) : studentDashboard ? (
                <>
                  <div className="mb-5 rounded-xl bg-gray-900 p-4">
                    <h3 className="text-lg font-bold text-yellow-400">
                      {studentDashboard.student?.fullName || "Student"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {studentDashboard.student?.rollNumber || "No roll number"}
                    </p>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                      label="Total Classes"
                      value={studentDashboard.attendance?.totalClasses ?? 0}
                      icon={FiBookOpen}
                    />
                    <StatCard
                      label="Present"
                      value={studentDashboard.attendance?.present ?? 0}
                      icon={FiCheckCircle}
                    />
                    <StatCard
                      label="Absent"
                      value={studentDashboard.attendance?.absent ?? 0}
                      icon={FiXCircle}
                    />
                  </div>

                  <h3 className="mb-3 font-bold text-white">
                    Attendance History
                  </h3>

                  <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full min-w-max text-left text-sm">
                      <thead className="bg-gray-950 text-gray-400">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3">Teacher</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-700">
                        {(studentDashboard.attendance?.records || []).map(
                          (item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-3">
                                {formatDate(item.date)}
                              </td>
                              <td className="px-4 py-3">
                                {getName(item.subject)}
                              </td>
                              <td className="px-4 py-3">
                                {getName(item.teacher)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    item.status === "PRESENT"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-red-500/10 text-red-400"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    {!(studentDashboard.attendance?.records || []).length && (
                      <p className="p-5 text-center text-sm text-gray-400">
                        No attendance records found.
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
    </div>
    </HomeLayout>
  );
}

export default View;