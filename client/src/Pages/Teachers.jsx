import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiEdit2,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiToggleLeft,
    FiToggleRight,
    FiUser,
    FiUsers,
    FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout";
import axiosInstance from "../Helper/axiosInstance";

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    employeeId: "",
};

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch all teachers
    const fetchTeachers = useCallback(async (showLoader = true) => {
        try {
            setError("");

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const response = await axiosInstance.get("/user/teachers");

            setTeachers(response.data.teachers || []);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to load teachers.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // Get department names for a teacher
    const getDepartmentNames = (teacher) => {
        return (teacher.departments || [])
            .map((department) => department?.name)
            .filter(Boolean)
            .join(", ");
    };

    // Search teachers
    const filteredTeachers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return teachers;

        return teachers.filter((teacher) => {
            const department = (teacher.departments || [])
                .map((department) => department?.name || "")
                .join(", ");

            return [
                teacher.fullName,
                teacher.email,
                teacher.employeeId,
                department,
            ].some((value) =>
                String(value || "").toLowerCase().includes(query)
            );
        });
    }, [teachers, search]);

    const activeCount = teachers.filter(
        (teacher) => teacher.isActive !== false
    ).length;

    const inactiveCount = teachers.length - activeCount;

    // Open create form
    const openCreateForm = () => {
        setEditingTeacher(null);
        setForm(initialForm);
        setShowForm(true);
    };

    // Open edit form
    const openEditForm = (teacher) => {
        setEditingTeacher(teacher);

        setForm({
            fullName: teacher.fullName || "",
            email: teacher.email || "",
            password: "",
            employeeId: teacher.employeeId || "",
        });

        setShowForm(true);
    };

    // Close form
    const closeForm = () => {
        if (submitting) return;

        setShowForm(false);
        setEditingTeacher(null);
        setForm(initialForm);
    };

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: name === "employeeId" ? value.toUpperCase() : value,
        }));
    };

    // Create or update teacher
    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            employeeId: form.employeeId.trim().toUpperCase(),
        };

        if (
            !payload.fullName ||
            !payload.email ||
            !payload.employeeId
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!editingTeacher && !form.password.trim()) {
            toast.error("Password is required when creating a teacher.");
            return;
        }

        if (!editingTeacher) {
            payload.password = form.password;
        }

        try {
            setSubmitting(true);

            if (editingTeacher) {
                const response = await axiosInstance.put(
                    `/user/teachers/${editingTeacher._id}`,
                    payload
                );

                toast.success(
                    response.data.message || "Teacher updated successfully."
                );
            } else {
                const response = await axiosInstance.post(
                    "/user/createTeacher",
                    payload
                );

                toast.success(
                    response.data.message || "Teacher created successfully."
                );
            }

            setShowForm(false);
            setEditingTeacher(null);
            setForm(initialForm);

            await fetchTeachers(false);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to save teacher."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Activate or deactivate teacher
    const toggleTeacherStatus = async (teacher) => {
        const isActive = teacher.isActive !== false;

        const confirmed = window.confirm(
            `${isActive ? "Deactivate" : "Activate"} ${teacher.fullName}?`
        );

        if (!confirmed) return;

        try {
            if (isActive) {
                await axiosInstance.delete(
                    `/user/teachers/${teacher._id}`
                );
            } else {
                await axiosInstance.put(
                    `/user/teachers/${teacher._id}`,
                    {
                        isActive: true,
                    }
                );
            }

            toast.success(
                `Teacher ${isActive ? "deactivated" : "activated"} successfully.`
            );

            await fetchTeachers(false);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to update teacher status."
            );
        }
    };

    return (
        <HomeLayout>
            <main className="min-h-screen bg-gray-900 px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-yellow-500">
                                <FiUsers size={22} />
                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    Administration
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Teacher Management
                            </h1>

                            <p className="mt-2 text-sm text-gray-400 sm:text-base">
                                Create, search, and manage your institution's teachers.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateForm}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition-all duration-300 hover:bg-yellow-400"
                        >
                            <FiPlus size={20} />
                            Add Teacher
                        </button>
                    </section>

                    {/* Statistics */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Total Teachers
                                </p>
                                <FiUsers className="text-yellow-500" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {teachers.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Active Teachers
                                </p>
                                <FiCheckCircle className="text-green-400" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {activeCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    Inactive Teachers
                                </p>
                                <FiAlertCircle className="text-red-400" size={22} />
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {inactiveCount}
                            </p>
                        </div>
                    </section>

                    {/* Teacher Directory */}
                    <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">

                        {/* Search and Refresh */}
                        <div className="flex flex-col gap-4 border-b border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    All Teachers
                                </h2>

                                <p className="mt-1 text-sm text-gray-400">
                                    {filteredTeachers.length} teacher
                                    {filteredTeachers.length !== 1 ? "s" : ""} found
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <label className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 focus-within:border-yellow-500">
                                    <FiSearch
                                        className="shrink-0 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search teachers..."
                                        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500 sm:w-56"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => fetchTeachers(false)}
                                    disabled={refreshing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
                                >
                                    <FiRefreshCw
                                        className={refreshing ? "animate-spin" : ""}
                                        size={16}
                                    />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center">
                                <span className="loading loading-spinner loading-lg text-yellow-500" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                                <FiAlertCircle
                                    size={38}
                                    className="text-red-400"
                                />

                                <p className="mt-4 font-semibold">
                                    Unable to load teachers
                                </p>

                                <p className="mt-2 text-sm text-gray-400">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => fetchTeachers()}
                                    className="mt-5 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-950 hover:bg-yellow-400"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                                <FiUser size={42} className="text-gray-500" />

                                <h3 className="mt-4 text-lg font-semibold">
                                    {search
                                        ? "No matching teachers"
                                        : "No teachers yet"}
                                </h3>

                                <p className="mt-2 text-sm text-gray-400">
                                    {search
                                        ? "Try searching with another keyword."
                                        : "Add your first teacher to get started."}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="table">
                                        <thead>
                                            <tr className="border-b border-gray-700 text-gray-400">
                                                <th className="bg-gray-800">Teacher</th>
                                                <th className="bg-gray-800">Employee ID</th>
                                                <th className="bg-gray-800">Department</th>
                                                <th className="bg-gray-800">Status</th>
                                                <th className="bg-gray-800">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredTeachers.map((teacher) => {
                                                const isActive =
                                                    teacher.isActive !== false;

                                                const department =
                                                    getDepartmentNames(teacher);

                                                return (
                                                    <tr
                                                        key={teacher._id}
                                                        className="border-b border-gray-700 hover:bg-gray-700/40"
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                                                    <FiUser size={20} />
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold text-gray-100">
                                                                        {teacher.fullName}
                                                                    </p>

                                                                    <p className="text-sm text-gray-400">
                                                                        {teacher.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="font-mono text-sm text-yellow-400">
                                                            {teacher.employeeId || "—"}
                                                        </td>

                                                        <td className="text-gray-300">
                                                            {department || "Not assigned"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    isActive
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : "bg-red-500/10 text-red-400"
                                                                }`}
                                                            >
                                                                {isActive
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditForm(teacher)
                                                                    }
                                                                    title="Edit teacher"
                                                                    aria-label={`Edit ${teacher.fullName}`}
                                                                    className="rounded-lg p-2 text-yellow-400 transition hover:bg-yellow-500/10"
                                                                >
                                                                    <FiEdit2 size={18} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleTeacherStatus(teacher)
                                                                    }
                                                                    title={
                                                                        isActive
                                                                            ? "Deactivate"
                                                                            : "Activate"
                                                                    }
                                                                    aria-label={`${
                                                                        isActive
                                                                            ? "Deactivate"
                                                                            : "Activate"
                                                                    } ${teacher.fullName}`}
                                                                    className={`rounded-lg p-2 transition hover:bg-gray-700 ${
                                                                        isActive
                                                                            ? "text-red-400"
                                                                            : "text-green-400"
                                                                    }`}
                                                                >
                                                                    {isActive ? (
                                                                        <FiToggleRight size={20} />
                                                                    ) : (
                                                                        <FiToggleLeft size={20} />
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

                                {/* Mobile and Tablet Cards */}
                                <div className="grid grid-cols-1 gap-4 p-4 md:hidden sm:grid-cols-2">
                                    {filteredTeachers.map((teacher) => {
                                        const isActive =
                                            teacher.isActive !== false;

                                        const department =
                                            getDepartmentNames(teacher);

                                        return (
                                            <article
                                                key={teacher._id}
                                                className="rounded-xl border border-gray-700 bg-gray-900 p-4 transition-all duration-300 hover:border-yellow-500/50"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                                        <FiUser size={21} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="wrap-break-word font-semibold">
                                                            {teacher.fullName}
                                                        </h3>

                                                        <p className="mt-1 break-all text-sm text-gray-400">
                                                            {teacher.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-3 border-t border-gray-700 pt-3 text-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="text-gray-400">
                                                            Employee ID
                                                        </span>

                                                        <span className="break-all font-mono text-yellow-400">
                                                            {teacher.employeeId || "—"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="text-gray-400">
                                                            Department
                                                        </span>

                                                        <span className="text-right text-gray-200">
                                                            {department || "Not assigned"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-gray-400">
                                                            Status
                                                        </span>

                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                                isActive
                                                                    ? "bg-green-500/10 text-green-400"
                                                                    : "bg-red-500/10 text-red-400"
                                                            }`}
                                                        >
                                                            {isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-3 border-t border-gray-700 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(teacher)
                                                        }
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium transition hover:border-yellow-500 hover:text-yellow-400"
                                                    >
                                                        <FiEdit2 size={16} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleTeacherStatus(teacher)
                                                        }
                                                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium transition hover:bg-gray-700 ${
                                                            isActive
                                                                ? "text-red-400"
                                                                : "text-green-400"
                                                        }`}
                                                    >
                                                        {isActive ? (
                                                            <FiToggleRight size={18} />
                                                        ) : (
                                                            <FiToggleLeft size={18} />
                                                        )}

                                                        {isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
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

                {/* Create / Edit Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="teacher-modal-title"
                            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-gray-700 p-5">
                                <div>
                                    <h2
                                        id="teacher-modal-title"
                                        className="text-xl font-bold"
                                    >
                                        {editingTeacher
                                            ? "Edit Teacher"
                                            : "Add Teacher"}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-400">
                                        {editingTeacher
                                            ? "Update the teacher's information."
                                            : "Enter the new teacher's information."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={submitting}
                                    aria-label="Close form"
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:opacity-50"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            {/* Teacher Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 p-5"
                            >
                                <div>
                                    <label
                                        htmlFor="teacher-name"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="teacher-name"
                                        type="text"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        minLength={5}
                                        maxLength={30}
                                        required
                                        placeholder="Enter full name"
                                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition focus:border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="teacher-email"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="teacher-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="teacher@example.com"
                                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition focus:border-yellow-500"
                                    />
                                </div>

                                {!editingTeacher && (
                                    <div>
                                        <label
                                            htmlFor="teacher-password"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Initial Password
                                        </label>

                                        <input
                                            id="teacher-password"
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            minLength={5}
                                            required
                                            autoComplete="new-password"
                                            placeholder="Enter initial password"
                                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition focus:border-yellow-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="teacher-employee-id"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Employee ID
                                    </label>

                                    <input
                                        id="teacher-employee-id"
                                        type="text"
                                        name="employeeId"
                                        value={form.employeeId}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. EMP001"
                                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 uppercase outline-none transition focus:border-yellow-500"
                                    />
                                </div>

                                <p className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-400">
                                    Teacher department assignments can be managed
                                    separately from the Allotment page.
                                </p>

                                {/* Modal Buttons */}
                                <div className="flex flex-col-reverse gap-3 border-t border-gray-700 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        disabled={submitting}
                                        className="rounded-lg border border-gray-600 px-5 py-3 font-medium transition hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiPlus size={18} />
                                                {editingTeacher
                                                    ? "Save Changes"
                                                    : "Create Teacher"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </HomeLayout>
    );
}

export default Teachers;
