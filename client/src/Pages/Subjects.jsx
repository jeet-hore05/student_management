
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FiBookOpen,
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiEdit2,
    FiTrash2,
    FiX,
    FiFilter,
    FiLayers,
    FiCheckCircle,
    FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../Helper/axiosInstance";
import HomeLayout from "../Layouts/HomeLayout";

const emptyForm = {
    subjectName: "",
    subjectCode: "",
    department: "",
    semester: "",
    subjectType: "THEORY",
    isActive: true,
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || "";
};

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

const Subjects = () => {
    const auth = useSelector((state) => state.auth);
    const role = String(auth?.role || "").toUpperCase();
    const isAdmin = role === "ADMIN";

    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const inputClass =
        "w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";

    const labelClass = "mb-2 block text-sm font-medium text-gray-300";

    const loadSubjects = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.get("/subject/all");
            setSubjects(response.data?.subjects || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadDepartments = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/allotment/departments");
            setDepartments(response.data?.departments || []);
        } catch (error) {
            toast.error(
                `Could not load departments: ${getErrorMessage(error)}`
            );
        }
    }, []);

    useEffect(() => {
        loadSubjects();
        loadDepartments();
    }, [loadSubjects, loadDepartments]);

    const activeCount = subjects.filter(
        (subject) => subject.isActive !== false
    ).length;

    const inactiveCount = subjects.length - activeCount;

    const semesterOptions = useMemo(
        () =>
            [...new Set(subjects.map((subject) => String(subject.semester)))]
                .filter((semester) => semester !== "undefined")
                .sort((a, b) => Number(a) - Number(b)),
        [subjects]
    );

    const filteredSubjects = useMemo(() => {
        const term = search.trim().toLowerCase();

        return subjects.filter((subject) => {
            const matchesSearch =
                !term ||
                subject.subjectName?.toLowerCase().includes(term) ||
                subject.subjectCode?.toLowerCase().includes(term) ||
                subject.department?.name?.toLowerCase().includes(term) ||
                String(subject.semester || "").includes(term);

            const matchesSemester =
                semesterFilter === "ALL" ||
                String(subject.semester) === semesterFilter;

            const matchesDepartment =
                departmentFilter === "ALL" ||
                getId(subject.department) === departmentFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && subject.isActive !== false) ||
                (statusFilter === "INACTIVE" && subject.isActive === false);

            return (
                matchesSearch &&
                matchesSemester &&
                matchesDepartment &&
                matchesStatus
            );
        });
    }, [
        subjects,
        search,
        semesterFilter,
        departmentFilter,
        statusFilter,
    ]);

    const openCreateModal = () => {
        setEditingSubject(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (subject) => {
        setEditingSubject(subject);

        setForm({
            subjectName: subject.subjectName || "",
            subjectCode: subject.subjectCode || "",
            department: getId(subject.department),
            semester: String(subject.semester || ""),
            subjectType: subject.subjectType || "THEORY",
            isActive: subject.isActive !== false,
        });

        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingSubject(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.subjectName.trim() ||
            !form.subjectCode.trim() ||
            !form.department ||
            !form.semester
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const semesterNumber = Number(form.semester);

        if (
            !Number.isInteger(semesterNumber) ||
            semesterNumber < 1 ||
            semesterNumber > 12
        ) {
            toast.error("Enter a valid semester number.");
            return;
        }

        const payload = {
            subjectName: form.subjectName.trim(),
            subjectCode: form.subjectCode.trim().toUpperCase(),
            department: form.department,
            semester: semesterNumber,
            subjectType: form.subjectType,
        };

        setSaving(true);

        try {
            if (editingSubject) {
                await axiosInstance.put(
                    `/subject/update/${getId(editingSubject)}`,
                    {
                        ...payload,
                        isActive: form.isActive,
                    }
                );

                toast.success("Subject updated successfully.");
            } else {
                await axiosInstance.post("/subject/create", payload);
                toast.success("Subject created successfully.");
            }

            setModalOpen(false);
            setEditingSubject(null);
            setForm(emptyForm);
            await loadSubjects();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (subject) => {
        const confirmed = window.confirm(
            `Delete "${subject.subjectName}" (${subject.subjectCode})?`
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                `/subject/delete/${getId(subject)}`
            );

            toast.success("Subject deleted successfully.");
            await loadSubjects();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const statCards = [
        {
            title: "Total Subjects",
            value: subjects.length,
            icon: FiBookOpen,
            color: "text-yellow-400",
        },
        {
            title: "Active Subjects",
            value: activeCount,
            icon: FiCheckCircle,
            color: "text-green-400",
        },
        {
            title: "Inactive Subjects",
            value: inactiveCount,
            icon: FiAlertCircle,
            color: "text-red-400",
        },
        {
            title: "Departments",
            value: new Set(
                subjects.map((subject) => getId(subject.department)).filter(Boolean)
            ).size,
            icon: FiLayers,
            color: "text-blue-400",
        },
    ];

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-950 px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                                Subject Management
                            </h1>

                            <p className="mt-2 text-sm text-gray-400">
                                Manage subjects, departments, semesters, and subject types.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={loadSubjects}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
                            >
                                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>

                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-yellow-400"
                                >
                                    <FiPlus />
                                    Add Subject
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.title}
                                    className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-400">{stat.title}</p>
                                        <Icon className={`text-xl ${stat.color}`} />
                                    </div>
                                    <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Search and filters */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search subject or code..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            <div className="relative">
                                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <select
                                    value={departmentFilter}
                                    onChange={(event) =>
                                        setDepartmentFilter(event.target.value)
                                    }
                                    className={`${inputClass} pl-10`}
                                >
                                    <option value="ALL">All departments</option>
                                    {departments.map((department) => (
                                        <option
                                            key={getId(department)}
                                            value={getId(department)}
                                        >
                                            {department.name} ({department.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={semesterFilter}
                                onChange={(event) => setSemesterFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="ALL">All semesters</option>
                                {semesterOptions.map((semester) => (
                                    <option key={semester} value={semester}>
                                        Semester {semester}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        <p className="mt-4 text-sm text-gray-500">
                            Showing {filteredSubjects.length} of {subjects.length} subjects
                        </p>
                    </div>

                    {/* Subject list */}
                    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                            <div>
                                <h2 className="font-semibold">All Subjects</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Subject directory and details
                                </p>
                            </div>
                            <FiBookOpen className="text-xl text-yellow-500" />
                        </div>

                        {loading ? (
                            <div className="flex min-h-56 items-center justify-center">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
                            </div>
                        ) : filteredSubjects.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <FiBookOpen className="mb-3 text-4xl text-gray-600" />
                                <h3 className="font-semibold">No subjects found</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Change your filters or add a new subject.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[850px] text-left text-sm">
                                        <thead className="bg-gray-800/70 text-xs uppercase tracking-wider text-gray-400">
                                            <tr>
                                                <th className="px-5 py-4">Subject</th>
                                                <th className="px-5 py-4">Department</th>
                                                <th className="px-5 py-4">Semester</th>
                                                <th className="px-5 py-4">Type</th>
                                                <th className="px-5 py-4">Status</th>
                                                {isAdmin && (
                                                    <th className="px-5 py-4 text-right">Actions</th>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-800">
                                            {filteredSubjects.map((subject) => (
                                                <tr
                                                    key={getId(subject)}
                                                    className="transition hover:bg-gray-800/40"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium">
                                                            {subject.subjectName}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {subject.subjectCode}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p>{subject.department?.name || "—"}</p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {subject.department?.code || ""}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        Semester {subject.semester}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-medium">
                                                            {subject.subjectType || "THEORY"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${subject.isActive === false
                                                                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                                    : "border-green-500/30 bg-green-500/10 text-green-400"
                                                                }`}
                                                        >
                                                            {subject.isActive === false ? "Inactive" : "Active"}
                                                        </span>
                                                    </td>

                                                    {isAdmin && (
                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    title="Edit subject"
                                                                    onClick={() => openEditModal(subject)}
                                                                    className="rounded-lg border border-gray-700 p-2 text-yellow-400 transition hover:border-yellow-500 hover:bg-yellow-500/10"
                                                                >
                                                                    <FiEdit2 />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title="Delete subject"
                                                                    onClick={() => handleDelete(subject)}
                                                                    className="rounded-lg border border-gray-700 p-2 text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile and tablet cards */}
                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                                    {filteredSubjects.map((subject) => (
                                        <article
                                            key={getId(subject)}
                                            className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="break-words font-semibold">
                                                        {subject.subjectName}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-yellow-400">
                                                        {subject.subjectCode}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${subject.isActive === false
                                                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                            : "border-green-500/30 bg-green-500/10 text-green-400"
                                                        }`}
                                                >
                                                    {subject.isActive === false ? "Inactive" : "Active"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Department</p>
                                                    <p className="mt-1 break-words">
                                                        {subject.department?.name || "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-500">Semester</p>
                                                    <p className="mt-1">{subject.semester || "—"}</p>
                                                </div>

                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500">Subject Type</p>
                                                    <p className="mt-1">
                                                        {subject.subjectType || "THEORY"}
                                                    </p>
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <div className="mt-4 flex gap-2 border-t border-gray-800 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(subject)}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-yellow-400 transition hover:border-yellow-500"
                                                    >
                                                        <FiEdit2 /> Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(subject)}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-red-400 transition hover:border-red-500"
                                                    >
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Create/Edit modal */}
                    {modalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) closeModal();
                            }}
                        >
                            <div className="my-auto w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                                <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 sm:px-6">
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            {editingSubject ? "Edit Subject" : "Add New Subject"}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Enter the subject details below.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                                    >
                                        <FiX />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                                    <div>
                                        <label className={labelClass}>Subject Name *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={100}
                                            value={form.subjectName}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    subjectName: event.target.value,
                                                }))
                                            }
                                            placeholder="e.g. Data Structures"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Subject Code *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={30}
                                            value={form.subjectCode}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    subjectCode: event.target.value.toUpperCase(),
                                                }))
                                            }
                                            placeholder="e.g. CS301"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Department *</label>
                                        <select
                                            required
                                            value={form.department}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    department: event.target.value,
                                                }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select a department</option>
                                            {departments
                                                .filter((department) => department.isActive !== false)
                                                .map((department) => (
                                                    <option
                                                        key={getId(department)}
                                                        value={getId(department)}
                                                    >
                                                        {department.name} ({department.code})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>Semester *</label>
                                            <select
                                                required
                                                value={form.semester}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        semester: event.target.value,
                                                    }))
                                                }
                                                className={inputClass}
                                            >
                                                <option value="">Select semester</option>
                                                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                                                    (semester) => (
                                                        <option key={semester} value={semester}>
                                                            Semester {semester}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Subject Type *</label>
                                            <select
                                                required
                                                value={form.subjectType}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        subjectType: event.target.value,
                                                    }))
                                                }
                                                className={inputClass}
                                            >
                                                <option value="THEORY">Theory</option>
                                                <option value="PRACTICAL">Practical</option>
                                                <option value="PROJECT">Project</option>
                                            </select>
                                        </div>
                                    </div>

                                    {editingSubject && (
                                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        isActive: event.target.checked,
                                                    }))
                                                }
                                                className="h-4 w-4 accent-yellow-500"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium">
                                                    Active Subject
                                                </span>
                                                <span className="mt-1 block text-xs text-gray-500">
                                                    Inactive subjects can be excluded from scheduling.
                                                </span>
                                            </span>
                                        </label>
                                    )}

                                    <div className="flex flex-col-reverse gap-3 border-t border-gray-800 pt-4 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={saving}
                                            className="rounded-xl border border-gray-700 px-5 py-3 font-medium text-gray-300 transition hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving || departments.length === 0}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving && (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                                            )}
                                            {editingSubject ? "Save Changes" : "Create Subject"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
};

export default Subjects;
