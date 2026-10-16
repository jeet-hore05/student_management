import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiEdit2,
    FiUserX,
    FiUserCheck,
    FiX,
    FiUsers,
    FiFilter,
    FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout";
import axiosInstance from "../Helper/axiosInstance";

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    rollNumber: "",
    department: "",
    semester: "1",
    section: "A",
};

const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";

const labelClass = "mb-2 block text-sm font-medium text-gray-300";

const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

const getErrorMessage = (error) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong.";

const getDepartmentId = (department) =>
    typeof department === "object" && department !== null
        ? department._id
        : department || "";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [semesterFilter, setSemesterFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form, setForm] = useState(initialForm);

    const fetchStudents = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await axiosInstance.get("/user/students");
            setStudents(data.students || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        setDepartmentsLoading(true);

        try {
            const { data } = await axiosInstance.get(
                "/allotment/departments"
            );

            setDepartments(data.departments || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDepartmentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, [fetchStudents, fetchDepartments]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const departmentId = getDepartmentId(student.department);

            const matchesSearch =
                !query ||
                student.fullName?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query) ||
                student.rollNumber?.toLowerCase().includes(query);

            const matchesDepartment =
                departmentFilter === "ALL" ||
                departmentId === departmentFilter;

            const matchesSemester =
                semesterFilter === "ALL" ||
                String(student.semester) === semesterFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && student.isActive !== false) ||
                (statusFilter === "INACTIVE" && student.isActive === false);

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesSemester &&
                matchesStatus
            );
        });
    }, [
        students,
        search,
        departmentFilter,
        semesterFilter,
        statusFilter,
    ]);

    const activeCount = students.filter(
        (student) => student.isActive !== false
    ).length;

    const inactiveCount = students.length - activeCount;

    const openCreateForm = () => {
        setEditingStudent(null);
        setForm(initialForm);
        setIsFormOpen(true);
    };

    const openEditForm = (student) => {
        setEditingStudent(student);

        setForm({
            fullName: student.fullName || "",
            email: student.email || "",
            password: "",
            rollNumber: student.rollNumber || "",
            department: getDepartmentId(student.department),
            semester: String(student.semester || 1),
            section: student.section || "A",
        });

        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (saving) return;

        setIsFormOpen(false);
        setEditingStudent(null);
        setForm(initialForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.department) {
            toast.error("Please select a department.");
            return;
        }

        if (!editingStudent && !form.password.trim()) {
            toast.error("Please enter a student password.");
            return;
        }

        setSaving(true);

        try {
            if (editingStudent) {
                const payload = {
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    rollNumber: form.rollNumber.trim(),
                    department: form.department,
                    semester: Number(form.semester),
                    section: form.section.trim().toUpperCase(),
                };

                await axiosInstance.put(
                    `/user/students/${editingStudent._id}`,
                    payload
                );

                toast.success("Student updated successfully.");
            } else {
                const payload = new FormData();

                payload.append("fullName", form.fullName.trim());
                payload.append("email", form.email.trim());
                payload.append("password", form.password);
                payload.append("rollNumber", form.rollNumber.trim());
                payload.append("department", form.department);
                payload.append("semester", form.semester);
                payload.append("section", form.section.trim().toUpperCase());

                await axiosInstance.post(
                    "/user/createStudent",
                    payload
                );

                toast.success("Student created successfully.");
            }

            closeForm();
            await fetchStudents();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (student) => {
        const isActive = student.isActive !== false;

        const confirmed = window.confirm(
            isActive
                ? `Deactivate ${student.fullName}'s account?`
                : `Reactivate ${student.fullName}'s account?`
        );

        if (!confirmed) return;

        setActionId(student._id);

        try {
            if (isActive) {
                await axiosInstance.delete(
                    `/user/students/${student._id}`
                );
            } else {
                await axiosInstance.put(
                    `/user/students/${student._id}`,
                    { isActive: true }
                );
            }

            toast.success(
                isActive
                    ? "Student account deactivated."
                    : "Student account reactivated."
            );

            await fetchStudents();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionId("");
        }
    };

    return (
        <HomeLayout>
            <main className="min-h-screen bg-gray-900 px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Header */}
                    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                                Administration
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Student Management
                            </h1>

                            <p className="mt-2 text-sm text-gray-400 sm:text-base">
                                Create, manage, and organize student accounts.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateForm}
                            className={`${buttonClass} bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                        >
                            <FiPlus size={18} />
                            Add Student
                        </button>
                    </section>

                    {/* Summary cards */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Total Students
                                </p>
                                <FiUsers className="text-yellow-500" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {students.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                            <p className="text-sm text-gray-400">
                                Active Students
                            </p>
                            <p className="mt-3 text-3xl font-bold text-green-400">
                                {activeCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 sm:col-span-2 lg:col-span-1">
                            <p className="text-sm text-gray-400">
                                Inactive Students
                            </p>
                            <p className="mt-3 text-3xl font-bold text-red-400">
                                {inactiveCount}
                            </p>
                        </div>
                    </section>

                    {/* Filters */}
                    <section className="space-y-4 rounded-xl border border-gray-700 bg-gray-800 p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-yellow-500" />
                            <h2 className="font-semibold">Search and Filters</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="relative">
                                <FiSearch
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    size={18}
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Name, email, roll number..."
                                    className={`${inputClass} pl-10`}
                                />
                            </label>

                            <label className="relative">
                                <select
                                    value={departmentFilter}
                                    onChange={(event) =>
                                        setDepartmentFilter(event.target.value)
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    <option value="ALL">All Departments</option>
                                    {departments.map((department) => (
                                        <option
                                            key={department._id}
                                            value={department._id}
                                        >
                                            {department.name} ({department.code})
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </label>

                            <label className="relative">
                                <select
                                    value={semesterFilter}
                                    onChange={(event) =>
                                        setSemesterFilter(event.target.value)
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    <option value="ALL">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                        (semester) => (
                                            <option
                                                key={semester}
                                                value={String(semester)}
                                            >
                                                Semester {semester}
                                            </option>
                                        )
                                    )}
                                </select>
                                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </label>

                            <label className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </label>
                        </div>

                        <div className="flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                Showing{" "}
                                <span className="font-semibold text-white">
                                    {filteredStudents.length}
                                </span>{" "}
                                of {students.length} students
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setDepartmentFilter("ALL");
                                    setSemesterFilter("ALL");
                                    setStatusFilter("ALL");
                                }}
                                className="self-start text-yellow-500 transition-colors hover:text-yellow-400 sm:self-auto"
                            >
                                Clear filters
                            </button>
                        </div>
                    </section>

                    {/* Student list */}
                    <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                        <div className="flex flex-col gap-3 border-b border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    All Students
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Manage student accounts and academic details.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    fetchStudents();
                                    fetchDepartments();
                                }}
                                disabled={loading || departmentsLoading}
                                className={`${buttonClass} border border-gray-600 text-gray-200 hover:border-yellow-500 hover:text-yellow-500`}
                            >
                                <FiRefreshCw
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex min-h-56 items-center justify-center">
                                <span className="loading loading-spinner loading-lg text-warning" />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                                <FiUsers
                                    size={40}
                                    className="mb-4 text-gray-600"
                                />
                                <h3 className="text-lg font-semibold">
                                    No students found
                                </h3>
                                <p className="mt-2 max-w-md text-sm text-gray-400">
                                    {students.length === 0
                                        ? "Create your first student account to get started."
                                        : "Try changing your search or filter settings."}
                                </p>

                                {students.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={openCreateForm}
                                        className={`${buttonClass} mt-5 bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                                    >
                                        <FiPlus />
                                        Create Student
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop and tablet table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-900/70 text-xs uppercase tracking-wider text-gray-400">
                                            <tr>
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Roll Number</th>
                                                <th className="px-6 py-4">Department</th>
                                                <th className="px-6 py-4">Semester</th>
                                                <th className="px-6 py-4">Section</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-700">
                                            {filteredStudents.map((student) => {
                                                const active =
                                                    student.isActive !== false;

                                                return (
                                                    <tr
                                                        key={student._id}
                                                        className="transition-colors hover:bg-gray-700/30"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-white">
                                                                {student.fullName}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {student.email}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 font-medium text-gray-200">
                                                            {student.rollNumber || "—"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {student.department?.name || "Not assigned"}
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {student.department?.code || ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {student.semester
                                                                ? `Semester ${student.semester}`
                                                                : "—"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {student.section || "—"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                    active
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : "bg-red-500/10 text-red-400"
                                                                }`}
                                                            >
                                                                {active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    title="Edit student"
                                                                    onClick={() =>
                                                                        openEditForm(student)
                                                                    }
                                                                    className="rounded-lg border border-gray-600 p-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-yellow-500/10"
                                                                >
                                                                    <FiEdit2 size={16} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title={
                                                                        active
                                                                            ? "Deactivate student"
                                                                            : "Reactivate student"
                                                                    }
                                                                    disabled={
                                                                        actionId === student._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleToggleStatus(student)
                                                                    }
                                                                    className={`rounded-lg border border-gray-600 p-2 transition-colors ${
                                                                        active
                                                                            ? "text-red-400 hover:border-red-400 hover:bg-red-500/10"
                                                                            : "text-green-400 hover:border-green-400 hover:bg-green-500/10"
                                                                    }`}
                                                                >
                                                                    {active ? (
                                                                        <FiUserX size={16} />
                                                                    ) : (
                                                                        <FiUserCheck size={16} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile student cards */}
                                <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
                                    {filteredStudents.map((student) => {
                                        const active =
                                            student.isActive !== false;

                                        return (
                                            <article
                                                key={student._id}
                                                className="rounded-lg border border-gray-700 bg-gray-900/60 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="wrap-break-word font-semibold">
                                                            {student.fullName}
                                                        </h3>
                                                        <p className="mt-1 break-all text-sm text-gray-400">
                                                            {student.email}
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-yellow-500">
                                                            {student.rollNumber || "No roll number"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            active
                                                                ? "bg-green-500/10 text-green-400"
                                                                : "bg-red-500/10 text-red-400"
                                                        }`}
                                                    >
                                                        {active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-700 pt-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Department
                                                        </p>
                                                        <p className="mt-1">
                                                            {student.department?.name || "Not assigned"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Semester / Section
                                                        </p>
                                                        <p className="mt-1">
                                                            {student.semester || "—"} / {student.section || "—"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(student)
                                                        }
                                                        className={`${buttonClass} flex-1 border border-gray-600 text-yellow-500 hover:border-yellow-500`}
                                                    >
                                                        <FiEdit2 />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionId === student._id
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(student)
                                                        }
                                                        className={`${buttonClass} flex-1 border border-gray-600 ${
                                                            active
                                                                ? "text-red-400 hover:border-red-400"
                                                                : "text-green-400 hover:border-green-400"
                                                        }`}
                                                    >
                                                        {active ? (
                                                            <FiUserX />
                                                        ) : (
                                                            <FiUserCheck />
                                                        )}
                                                        {active ? "Deactivate" : "Reactivate"}
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* Create / Edit modal */}
            {isFormOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 py-6 backdrop-blur-sm sm:items-center sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="student-form-title"
                        className="my-auto w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-700 p-5 sm:p-6">
                            <div>
                                <h2
                                    id="student-form-title"
                                    className="text-xl font-bold sm:text-2xl"
                                >
                                    {editingStudent
                                        ? "Edit Student"
                                        : "Create Student"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    {editingStudent
                                        ? "Update the student's information."
                                        : "Enter the details to create a student account."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Full Name *
                                    </label>
                                    <input
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                        minLength={5}
                                        maxLength={30}
                                        placeholder="Enter full name"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="student@example.com"
                                        className={inputClass}
                                    />
                                </div>

                                {!editingStudent && (
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Initial Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            minLength={5}
                                            autoComplete="new-password"
                                            placeholder="Enter initial password"
                                            className={inputClass}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Share the initial password securely with the student.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>
                                        Roll Number *
                                    </label>
                                    <input
                                        name="rollNumber"
                                        value={form.rollNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. CSE001"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Department *
                                    </label>
                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                        disabled={departmentsLoading}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {departmentsLoading
                                                ? "Loading departments..."
                                                : "Select department"}
                                        </option>

                                        {departments.map((department) => (
                                            <option
                                                key={department._id}
                                                value={department._id}
                                            >
                                                {department.name} ({department.code})
                                            </option>
                                        ))}
                                    </select>

                                    {!departmentsLoading &&
                                        departments.length === 0 && (
                                            <p className="mt-2 text-xs text-yellow-500">
                                                Create a department in Allotment before creating students.
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Semester *
                                    </label>
                                    <select
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                            (semester) => (
                                                <option
                                                    key={semester}
                                                    value={String(semester)}
                                                >
                                                    Semester {semester}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Section *
                                    </label>
                                    <input
                                        name="section"
                                        value={form.section}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        placeholder="e.g. A"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-700 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className={`${buttonClass} border border-gray-600 text-gray-300 hover:bg-gray-700`}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        departmentsLoading ||
                                        departments.length === 0
                                    }
                                    className={`${buttonClass} bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                                >
                                    {saving && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}
                                    {editingStudent
                                        ? "Save Changes"
                                        : "Create Student"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </HomeLayout>
    );
};

export default Students;
