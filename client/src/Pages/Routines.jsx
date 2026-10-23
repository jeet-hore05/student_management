
import { useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiRefreshCw,
    FiCalendar,
    FiClock,
    FiX,
    FiBookOpen,
    FiFilter
} from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../Helper/axiosInstance";
import HomeLayout from "../Layouts/HomeLayout";

const ROUTINE_API = "/routine";
const DEPARTMENT_API = "/allotment/departments";
const SUBJECT_API = "/subject/all";
const TEACHER_API = "/user/teachers";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
];

const ROUTINE_TYPES = ["THEORY", "PRACTICAL"];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SECTIONS = ["A", "B", "C", "D"];

const initialForm = {
    department: "",
    semester: "1",
    section: "A",
    subject: "",
    teacher: "",
    day: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    routineType: "THEORY"
};

const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";

const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-300";

const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
        return value._id || value.id || "";
    }

    return value;
};

const getArray = (response, keys) => {
    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
};

const getDisplayName = (value, fallback = "—") => {
    if (!value) return fallback;

    if (typeof value === "string") {
        return value;
    }

    return (
        value.name ||
        value.subjectName ||
        value.fullName ||
        [value.firstName, value.lastName].filter(Boolean).join(" ") ||
        value.email ||
        fallback
    );
};

const getDepartmentName = (routine) =>
    getDisplayName(routine.department, "Unknown department");

const getSubjectName = (routine) =>
    getDisplayName(routine.subject, "Unknown subject");

const getTeacherName = (routine) =>
    getDisplayName(routine.teacher, "Unassigned");

const formatDay = (day) => {
    if (!day) return "—";

    return day.charAt(0) + day.slice(1).toLowerCase();
};

const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

export default function Routines() {
    const [routines, setRoutines] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");
    const [dayFilter, setDayFilter] = useState("");

    const [form, setForm] = useState(initialForm);

    // Load all routines
    const loadRoutines = async (showLoader = true) => {
        if (showLoader) setLoading(true);

        try {
            const response = await axiosInstance.get(
                `${ROUTINE_API}/all`
            );

            setRoutines(getArray(response, ["routines"]));
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load routines"
            );
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // Load departments
    const loadDepartments = async () => {
        try {
            const response = await axiosInstance.get(
                DEPARTMENT_API
            );

            setDepartments(
                getArray(response, ["departments"])
            );
        } catch (error) {
            console.error(
                "Department loading error:",
                error.response?.data || error.message
            );

            toast.error("Failed to load departments");
        }
    };

    // Load subjects
    const loadSubjects = async () => {
        try {
            const response = await axiosInstance.get(
                SUBJECT_API
            );

            setSubjects(
                getArray(response, ["subjects"])
            );
        } catch (error) {
            console.error(
                "Subject loading error:",
                error.response?.data || error.message
            );

            toast.error("Failed to load subjects");
        }
    };

    // Load teachers
    const loadTeachers = async () => {
        try {
            const response = await axiosInstance.get(
                TEACHER_API
            );

            setTeachers(
                getArray(response, ["teachers", "users"])
            );
        } catch (error) {
            console.error(
                "Teacher loading error:",
                error.response?.data || error.message
            );
        }
    };

    const refreshData = async () => {
        await Promise.all([
            loadRoutines(),
            loadDepartments(),
            loadSubjects(),
            loadTeachers()
        ]);
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Filter subjects based on selected department and semester
    const availableSubjects = useMemo(() => {
        return subjects.filter((subject) => {
            const departmentMatches =
                !form.department ||
                getId(subject.department) === form.department;

            const semesterMatches =
                Number(subject.semester) === Number(form.semester);

            return departmentMatches && semesterMatches;
        });
    }, [subjects, form.department, form.semester]);

    // Filter routines
    const filteredRoutines = useMemo(() => {
        return routines.filter((routine) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                [
                    getDepartmentName(routine),
                    getSubjectName(routine),
                    getTeacherName(routine),
                    routine.section,
                    routine.room,
                    routine.subject?.subjectCode
                ].some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(searchText)
                );

            const matchesDepartment =
                !departmentFilter ||
                getId(routine.department) === departmentFilter;

            const matchesSemester =
                !semesterFilter ||
                String(routine.semester) === semesterFilter;

            const matchesSection =
                !sectionFilter ||
                String(routine.section).toUpperCase() === sectionFilter;

            const matchesDay =
                !dayFilter ||
                routine.day === dayFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesSemester &&
                matchesSection &&
                matchesDay
            );
        });
    }, [
        routines,
        search,
        departmentFilter,
        semesterFilter,
        sectionFilter,
        dayFilter
    ]);

    // Update form fields
    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "department" || name === "semester"
                ? { subject: "" }
                : {})
        }));
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (routine) => {
        setEditingId(routine._id);

        setForm({
            department: getId(routine.department),
            semester: String(routine.semester || "1"),
            section: String(routine.section || "A").toUpperCase(),
            subject: getId(routine.subject),
            teacher: getId(routine.teacher),
            day: routine.day || "MONDAY",
            startTime: routine.startTime || "09:00",
            endTime: routine.endTime || "10:00",
            room: routine.room || "",
            routineType: routine.routineType || "THEORY"
        });

        setModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    // Create or update routine
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.department ||
            !form.subject ||
            !form.teacher ||
            !form.semester ||
            !form.section ||
            !form.day ||
            !form.startTime ||
            !form.endTime ||
            !form.routineType
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (form.endTime <= form.startTime) {
            toast.error("End time must be later than start time");
            return;
        }

        const payload = {
            department: form.department,
            semester: Number(form.semester),
            section: form.section.trim().toUpperCase(),
            subject: form.subject,
            teacher: form.teacher,
            day: form.day,
            startTime: form.startTime,
            endTime: form.endTime,
            room: form.room.trim(),
            routineType: form.routineType
        };

        setSaving(true);

        try {
            if (editingId) {
                await axiosInstance.put(
                    `${ROUTINE_API}/update/${editingId}`,
                    payload
                );

                toast.success("Routine updated successfully");
            } else {
                await axiosInstance.post(
                    `${ROUTINE_API}/create`,
                    payload
                );

                toast.success("Routine created successfully");
            }

            setModalOpen(false);
            setEditingId(null);
            setForm(initialForm);

            await loadRoutines(false);
        } catch (error) {
            console.error(
                "Routine save error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                `Failed to ${editingId ? "update" : "create"} routine`
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete routine
    const handleDelete = async (routine) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the routine for "${getSubjectName(routine)}"?`
        );

        if (!confirmed) return;

        setDeletingId(routine._id);

        try {
            await axiosInstance.delete(
                `${ROUTINE_API}/delete/${routine._id}`
            );

            setRoutines((previous) =>
                previous.filter((item) => item._id !== routine._id)
            );

            toast.success("Routine deleted successfully");
        } catch (error) {
            console.error(
                "Routine deletion error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete routine"
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearch("");
        setDepartmentFilter("");
        setSemesterFilter("");
        setSectionFilter("");
        setDayFilter("");
    };

    const uniqueDepartments = new Set(
        routines.map((routine) => getId(routine.department))
    ).size;

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-950 p-4 text-gray-100 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-yellow-400">
                                <FiCalendar size={22} />

                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    Academic Management
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Routine Management
                            </h1>

                            <p className="mt-2 text-sm text-gray-400">
                                Manage class schedules, subjects, teachers and timings.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={refreshData}
                                disabled={loading}
                                className={`${buttonClass} border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700`}
                            >
                                <FiRefreshCw />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className={`${buttonClass} bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                            >
                                <FiPlus />
                                Add Routine
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Total Routines
                                </p>
                                <FiCalendar className="text-yellow-400" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {routines.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Departments Covered
                                </p>
                                <FiBookOpen className="text-yellow-400" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {uniqueDepartments}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Filtered Results
                                </p>
                                <FiFilter className="text-yellow-400" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {filteredRoutines.length}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <FiFilter className="text-yellow-400" />

                            <h2 className="font-semibold">
                                Search & Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="relative sm:col-span-2 lg:col-span-2">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search subject, teacher..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            <select
                                value={departmentFilter}
                                onChange={(event) => setDepartmentFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="">All Departments</option>

                                {departments.map((department) => (
                                    <option
                                        key={department._id}
                                        value={department._id}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={semesterFilter}
                                onChange={(event) => setSemesterFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="">All Semesters</option>

                                {SEMESTERS.map((semester) => (
                                    <option key={semester} value={semester}>
                                        Semester {semester}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sectionFilter}
                                onChange={(event) => setSectionFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="">All Sections</option>

                                {SECTIONS.map((section) => (
                                    <option key={section} value={section}>
                                        Section {section}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={dayFilter}
                                onChange={(event) => setDayFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="">All Days</option>

                                {DAYS.map((day) => (
                                    <option key={day} value={day}>
                                        {formatDay(day)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-sm text-yellow-400 transition hover:text-yellow-300"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Routine List */}
                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
                        <div className="flex flex-col gap-1 border-b border-gray-800 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-semibold">
                                Routine List
                            </h2>

                            <p className="text-sm text-gray-400">
                                {filteredRoutines.length} schedule(s) found
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex min-h-56 items-center justify-center">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-400" />
                            </div>
                        ) : filteredRoutines.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                                <FiCalendar size={42} className="text-gray-600" />

                                <h3 className="mt-4 text-lg font-semibold">
                                    No routines found
                                </h3>

                                <p className="mt-2 text-sm text-gray-400">
                                    Add a routine or adjust your search filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className={`${buttonClass} mt-4 bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                                >
                                    <FiPlus />
                                    Create Routine
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1050px] text-left text-sm">
                                    <thead className="bg-gray-800/70 text-xs uppercase tracking-wider text-gray-400">
                                        <tr>
                                            <th className="px-5 py-4">Class</th>
                                            <th className="px-5 py-4">Subject</th>
                                            <th className="px-5 py-4">Teacher</th>
                                            <th className="px-5 py-4">Day</th>
                                            <th className="px-5 py-4">Time</th>
                                            <th className="px-5 py-4">Room</th>
                                            <th className="px-5 py-4">Type</th>
                                            <th className="px-5 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-800">
                                        {filteredRoutines.map((routine) => (
                                            <tr
                                                key={routine._id}
                                                className="transition hover:bg-gray-800/40"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-medium">
                                                        {getDepartmentName(routine)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Sem {routine.semester} · Section {routine.section}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium">
                                                        {getSubjectName(routine)}
                                                    </p>

                                                    {routine.subject?.subjectCode && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {routine.subject.subjectCode}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-gray-300">
                                                    {getTeacherName(routine)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-md bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-400">
                                                        {formatDay(routine.day)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <FiClock className="shrink-0 text-yellow-400" />

                                                        <span>
                                                            {formatTime(routine.startTime)}
                                                            {" – "}
                                                            {formatTime(routine.endTime)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-gray-300">
                                                    {routine.room || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300">
                                                        {formatDay(routine.routineType)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            title="Edit routine"
                                                            onClick={() => openEditModal(routine)}
                                                            className="rounded-lg border border-gray-700 p-2.5 text-yellow-400 transition hover:border-yellow-500 hover:bg-yellow-500/10"
                                                        >
                                                            <FiEdit2 />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete routine"
                                                            disabled={deletingId === routine._id}
                                                            onClick={() => handleDelete(routine)}
                                                            className="rounded-lg border border-gray-700 p-2.5 text-red-400 transition hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                                        >
                                                            {deletingId === routine._id ? (
                                                                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                                            ) : (
                                                                <FiTrash2 />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create / Edit Modal */}
                {modalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-gray-800 p-5 sm:p-6">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {editingId ? "Edit Routine" : "Create Routine"}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-400">
                                        Enter the class schedule details.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

                                    {/* Department */}
                                    <div>
                                        <label className={labelClass}>
                                            Department *
                                        </label>

                                        <select
                                            name="department"
                                            value={form.department}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select department
                                            </option>

                                            {departments.map((department) => (
                                                <option
                                                    key={department._id}
                                                    value={department._id}
                                                >
                                                    {department.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Semester */}
                                    <div>
                                        <label className={labelClass}>
                                            Semester *
                                        </label>

                                        <select
                                            name="semester"
                                            value={form.semester}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            {SEMESTERS.map((semester) => (
                                                <option key={semester} value={semester}>
                                                    Semester {semester}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Section */}
                                    <div>
                                        <label className={labelClass}>
                                            Section *
                                        </label>

                                        <select
                                            name="section"
                                            value={form.section}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            {SECTIONS.map((section) => (
                                                <option key={section} value={section}>
                                                    Section {section}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Day */}
                                    <div>
                                        <label className={labelClass}>
                                            Day *
                                        </label>

                                        <select
                                            name="day"
                                            value={form.day}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            {DAYS.map((day) => (
                                                <option key={day} value={day}>
                                                    {formatDay(day)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className={labelClass}>
                                            Subject *
                                        </label>

                                        <select
                                            name="subject"
                                            value={form.subject}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select subject
                                            </option>

                                            {availableSubjects.map((subject) => (
                                                <option
                                                    key={subject._id}
                                                    value={subject._id}
                                                >
                                                    {subject.subjectName} ({subject.subjectCode})
                                                </option>
                                            ))}
                                        </select>

                                        {form.department && availableSubjects.length === 0 && (
                                            <p className="mt-1.5 text-xs text-yellow-400">
                                                No subjects found for this department and semester.
                                            </p>
                                        )}
                                    </div>

                                    {/* Teacher */}
                                    <div>
                                        <label className={labelClass}>
                                            Teacher *
                                        </label>

                                        <select
                                            name="teacher"
                                            value={form.teacher}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select teacher
                                            </option>

                                            {teachers.map((teacher) => (
                                                <option
                                                    key={teacher._id}
                                                    value={teacher._id}
                                                >
                                                    {getDisplayName(
                                                        teacher,
                                                        "Teacher"
                                                    )}
                                                </option>
                                            ))}
                                        </select>

                                        {teachers.length === 0 && (
                                            <p className="mt-1.5 text-xs text-yellow-400">
                                                No teachers loaded. Verify the teacher-list endpoint.
                                            </p>
                                        )}
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className={labelClass}>
                                            Start Time *
                                        </label>

                                        <input
                                            type="time"
                                            name="startTime"
                                            value={form.startTime}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label className={labelClass}>
                                            End Time *
                                        </label>

                                        <input
                                            type="time"
                                            name="endTime"
                                            value={form.endTime}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Room */}
                                    <div>
                                        <label className={labelClass}>
                                            Room / Classroom
                                        </label>

                                        <input
                                            type="text"
                                            name="room"
                                            value={form.room}
                                            onChange={updateField}
                                            placeholder="e.g. Room 204"
                                            maxLength={50}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Routine Type */}
                                    <div>
                                        <label className={labelClass}>
                                            Routine Type *
                                        </label>

                                        <select
                                            name="routineType"
                                            value={form.routineType}
                                            onChange={updateField}
                                            required
                                            className={inputClass}
                                        >
                                            {ROUTINE_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.charAt(0) +
                                                        type.slice(1).toLowerCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex flex-col-reverse gap-3 border-t border-gray-800 p-5 sm:flex-row sm:justify-end sm:p-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className={`${buttonClass} border border-gray-700 text-gray-300 hover:bg-gray-800`}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`${buttonClass} bg-yellow-500 text-gray-950 hover:bg-yellow-400`}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                {editingId ? <FiEdit2 /> : <FiPlus />}
                                                {editingId
                                                    ? "Update Routine"
                                                    : "Create Routine"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}
