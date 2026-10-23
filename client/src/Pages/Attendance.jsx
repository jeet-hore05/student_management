
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiSearch,
    FiUsers,
    FiXCircle,
    FiSave,
    FiRefreshCw,
    FiClipboard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../Helper/axiosInstance";
import HomeLayout from "../Layouts/HomeLayout";

const STUDENTS_API = "/user/students";
const ROUTINES_API = "/routine/all";
const ATTENDANCE_API = "/attendance/mark";

const getArray = (data, keys) => {
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
        if (Array.isArray(data?.data?.[key])) return data.data[key];
    }

    if (Array.isArray(data?.data)) return data.data;

    return [];
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }
    return String(value);
};

const getStudentName = (student) => {
    if (student.name) return student.name;

    const firstName =
        student.firstName || student.user?.firstName || "";
    const lastName =
        student.lastName || student.user?.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        student.fullName ||
        student.user?.name ||
        "Unnamed Student"
    );
};

const getRollNumber = (student) => {
    return (
        student.rollNumber ??
        student.rollNo ??
        student.roll ??
        student.registrationNumber ??
        student.user?.rollNumber ??
        ""
    );
};

const getRoutineLabel = (routine) => {
    const department =
        typeof routine.department === "object"
            ? routine.department?.name
            : "";

    const subject =
        typeof routine.subject === "object"
            ? routine.subject?.name ||
            routine.subject?.subjectName ||
            routine.subject?.subjectCode
            : "";

    const day = routine.day || "";
    const startTime = routine.startTime || "";
    const endTime = routine.endTime || "";

    return [
        department,
        subject,
        `Semester ${routine.semester ?? "-"}`,
        `Section ${routine.section ?? "-"}`,
        day,
        `${startTime}${endTime ? ` - ${endTime}` : ""}`,
    ]
        .filter(Boolean)
        .join(" | ");
};

const getErrorMessage = (error) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong.";

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [routines, setRoutines] = useState([]);

    const [selectedRoutine, setSelectedRoutine] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [markedAttendance, setMarkedAttendance] = useState({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const [studentResponse, routineResponse] =
                await Promise.all([
                    axiosInstance.get(STUDENTS_API),
                    axiosInstance.get(ROUTINES_API),
                ]);

            const studentList = getArray(
                studentResponse.data,
                ["students", "users"]
            );

            const routineList = getArray(
                routineResponse.data,
                ["routines"]
            );

            setStudents(studentList);
            setRoutines(routineList);

            if (!studentList.length) {
                toast("No students found.");
            }

            if (!routineList.length) {
                toast("No routines found. Please create a routine first.");
            }
        } catch (error) {
            console.error("Attendance loading error:", error);

            toast.error(
                `Failed to load students or routines: ${getErrorMessage(error)}`
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const activeRoutine = useMemo(
        () =>
            routines.find(
                (routine) => String(routine._id) === selectedRoutine
            ),
        [routines, selectedRoutine]
    );

    const sortedStudents = useMemo(() => {
        const filtered = students.filter((student) => {
            const search = searchTerm.trim().toLowerCase();

            if (!search) return true;

            const name = getStudentName(student).toLowerCase();
            const roll = String(getRollNumber(student)).toLowerCase();

            return name.includes(search) || roll.includes(search);
        });

        return [...filtered].sort((a, b) => {
            const rollA = String(getRollNumber(a));
            const rollB = String(getRollNumber(b));

            return rollA.localeCompare(rollB, undefined, {
                numeric: true,
                sensitivity: "base",
            });
        });
    }, [students, searchTerm]);

    const presentCount = students.filter(
        (student) =>
            markedAttendance[String(student._id)] === "PRESENT"
    ).length;

    const absentCount = students.filter(
        (student) =>
            markedAttendance[String(student._id)] === "ABSENT"
    ).length;

    const markedCount = presentCount + absentCount;
    const unmarkedCount = students.length - markedCount;

    const handleMark = (studentId, status) => {
        setMarkedAttendance((previous) => ({
            ...previous,
            [String(studentId)]: status,
        }));
    };

    const markAll = (status) => {
        const updated = {};

        students.forEach((student) => {
            updated[String(student._id)] = status;
        });

        setMarkedAttendance(updated);
        toast.success(
            `All students marked ${status.toLowerCase()}.`
        );
    };

    const handleRoutineChange = (routineId) => {
        setSelectedRoutine(routineId);

        // Clear unsaved selections when switching classes.
        setMarkedAttendance({});
    };

    const handleSaveAttendance = async () => {
        if (!selectedRoutine || !activeRoutine) {
            toast.error("Please select a routine first.");
            return;
        }

        if (!attendanceDate) {
            toast.error("Please select the attendance date.");
            return;
        }

        if (!students.length) {
            toast.error("No students available.");
            return;
        }

        if (unmarkedCount > 0) {
            toast.error(
                `Please mark attendance for all students. ${unmarkedCount} still unmarked.`
            );
            return;
        }

        const subjectId = getId(activeRoutine.subject);
        const teacherId = getId(activeRoutine.teacher);

        if (!subjectId || !teacherId) {
            toast.error(
                "The selected routine must include its subject and teacher. Check your routine API population."
            );
            return;
        }

        const confirmed = window.confirm(
            `Save attendance for ${students.length} students on ${attendanceDate}?`
        );

        if (!confirmed) return;

        setSaving(true);

        let successCount = 0;
        const failedStudents = [];

        try {
            // The backend exposes POST /attendance/mark for
            // one student's attendance record at a time.
            for (const student of students) {
                const studentId = String(student._id);
                const status = markedAttendance[studentId];

                const payload = {
                    student: studentId,
                    routine: selectedRoutine,
                    subject: subjectId,
                    teacher: teacherId,
                    date: attendanceDate,
                    status,
                    remarks: "",
                };

                try {
                    await axiosInstance.post(
                        ATTENDANCE_API,
                        payload
                    );

                    successCount++;
                } catch (error) {
                    const details = {
                        name: getStudentName(student),
                        roll: getRollNumber(student),
                        status,
                        httpStatus: error.response?.status,
                        message: error.response?.data?.message,
                        error: error.response?.data?.error,
                    };

                    failedStudents.push(details);
                    console.error("Attendance save failed:", details);
                }
            }

            if (failedStudents.length === 0) {
                toast.success(
                    `Attendance saved successfully for ${successCount} students!`
                );

                setMarkedAttendance({});
            } else {
                console.table(failedStudents);

                toast.error(
                    `${successCount} saved; ${failedStudents.length} failed. Check the console for details.`
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-950 text-gray-300">
                <FiRefreshCw className="mr-3 animate-spin text-2xl text-yellow-400" />
                <span>Loading attendance data...</span>
            </div>
        );
    }

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-950 px-3 py-6 text-gray-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                                    <FiClipboard size={26} />
                                </div>

                                <h1 className="text-2xl font-bold sm:text-3xl">
                                    Mark Attendance
                                </h1>
                            </div>

                            <p className="text-sm text-gray-400 sm:text-base">
                                Mark students present or absent by roll number.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadData}
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
                        >
                            <FiRefreshCw />
                            Refresh
                        </button>
                    </div>

                    {/* Class and date selection */}
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-6 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="routine"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Select Class / Routine
                            </label>

                            <select
                                id="routine"
                                value={selectedRoutine}
                                onChange={(event) =>
                                    handleRoutineChange(event.target.value)
                                }
                                disabled={saving}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            >
                                <option value="">-- Select a routine --</option>

                                {routines.map((routine) => (
                                    <option key={routine._id} value={routine._id}>
                                        {getRoutineLabel(routine)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="attendanceDate"
                                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"
                            >
                                <FiCalendar className="text-yellow-400" />
                                Attendance Date
                            </label>

                            <input
                                id="attendanceDate"
                                type="date"
                                value={attendanceDate}
                                max={new Date().toLocaleDateString("en-CA")}
                                onChange={(event) => {
                                    setAttendanceDate(event.target.value);
                                    setMarkedAttendance({});
                                }}
                                disabled={saving}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            />
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-400 sm:text-sm">
                                    Total Students
                                </p>
                                <FiUsers className="text-xl text-yellow-400" />
                            </div>

                            <p className="mt-3 text-2xl font-bold">
                                {students.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-green-900/70 bg-gray-900 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-400 sm:text-sm">
                                    Present
                                </p>
                                <FiCheckCircle className="text-xl text-green-400" />
                            </div>

                            <p className="mt-3 text-2xl font-bold text-green-400">
                                {presentCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-red-900/70 bg-gray-900 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-400 sm:text-sm">
                                    Absent
                                </p>
                                <FiXCircle className="text-xl text-red-400" />
                            </div>

                            <p className="mt-3 text-2xl font-bold text-red-400">
                                {absentCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-yellow-900/70 bg-gray-900 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-400 sm:text-sm">
                                    Not Marked
                                </p>
                                <FiClipboard className="text-xl text-yellow-400" />
                            </div>

                            <p className="mt-3 text-2xl font-bold text-yellow-400">
                                {unmarkedCount}
                            </p>
                        </div>
                    </div>

                    {/* Student list */}
                    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
                        <div className="flex flex-col gap-4 border-b border-gray-800 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Student List
                                </h2>

                                <p className="mt-1 text-sm text-gray-400">
                                    Select Present or Absent for every student.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-xs">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search roll number or name..."
                                    className="w-full rounded-lg border border-gray-700 bg-gray-950 py-2.5 pl-10 pr-3 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-yellow-500"
                                />
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-2 border-b border-gray-800 p-4">
                            <button
                                type="button"
                                onClick={() => markAll("PRESENT")}
                                disabled={!students.length || saving}
                                className="rounded-lg border border-green-700 px-3 py-2 text-sm font-medium text-green-400 transition hover:bg-green-600 hover:text-white disabled:opacity-50"
                            >
                                Mark All Present
                            </button>

                            <button
                                type="button"
                                onClick={() => markAll("ABSENT")}
                                disabled={!students.length || saving}
                                className="rounded-lg border border-red-700 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                            >
                                Mark All Absent
                            </button>

                            <button
                                type="button"
                                onClick={() => setMarkedAttendance({})}
                                disabled={!markedCount || saving}
                                className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
                            >
                                Clear Selection
                            </button>
                        </div>

                        {students.length === 0 ? (
                            <div className="px-4 py-16 text-center">
                                <FiUsers className="mx-auto mb-3 text-4xl text-gray-600" />

                                <h3 className="font-semibold text-gray-300">
                                    No students found
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Check your student records and API response.
                                </p>
                            </div>
                        ) : sortedStudents.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-400">
                                No students match your search.
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-950 text-xs uppercase tracking-wider text-gray-400">
                                            <tr>
                                                <th className="px-5 py-4">#</th>
                                                <th className="px-5 py-4">Roll Number</th>
                                                <th className="px-5 py-4">Student Name</th>
                                                <th className="px-5 py-4 text-center">
                                                    Attendance Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-800">
                                            {sortedStudents.map((student, index) => {
                                                const studentId = String(student._id);
                                                const status = markedAttendance[studentId];

                                                return (
                                                    <tr
                                                        key={studentId}
                                                        className="transition hover:bg-gray-800/60"
                                                    >
                                                        <td className="px-5 py-4 text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span className="rounded-md border border-gray-700 bg-gray-950 px-3 py-1.5 font-mono text-sm text-yellow-400">
                                                                {getRollNumber(student) || "N/A"}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 font-medium text-gray-100">
                                                            {getStudentName(student)}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleMark(studentId, "PRESENT")
                                                                    }
                                                                    disabled={saving}
                                                                    aria-pressed={status === "PRESENT"}
                                                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${status === "PRESENT"
                                                                        ? "border-green-500 bg-green-600 text-white shadow-lg shadow-green-950/30"
                                                                        : "border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400"
                                                                        }`}
                                                                >
                                                                    <FiCheckCircle />
                                                                    Present
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleMark(studentId, "ABSENT")
                                                                    }
                                                                    disabled={saving}
                                                                    aria-pressed={status === "ABSENT"}
                                                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${status === "ABSENT"
                                                                        ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/30"
                                                                        : "border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400"
                                                                        }`}
                                                                >
                                                                    <FiXCircle />
                                                                    Absent
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="space-y-3 p-3 md:hidden">
                                    {sortedStudents.map((student, index) => {
                                        const studentId = String(student._id);
                                        const status = markedAttendance[studentId];

                                        return (
                                            <div
                                                key={studentId}
                                                className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                                            >
                                                <div className="mb-4 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 font-bold text-yellow-400">
                                                        {index + 1}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold">
                                                            {getStudentName(student)}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-400">
                                                            Roll No:{" "}
                                                            <span className="font-mono text-yellow-400">
                                                                {getRollNumber(student) || "N/A"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMark(studentId, "PRESENT")
                                                        }
                                                        disabled={saving}
                                                        aria-pressed={status === "PRESENT"}
                                                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${status === "PRESENT"
                                                            ? "border-green-500 bg-green-600 text-white"
                                                            : "border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400"
                                                            }`}
                                                    >
                                                        <FiCheckCircle />
                                                        Present
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMark(studentId, "ABSENT")
                                                        }
                                                        disabled={saving}
                                                        aria-pressed={status === "ABSENT"}
                                                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${status === "ABSENT"
                                                            ? "border-red-500 bg-red-600 text-white"
                                                            : "border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400"
                                                            }`}
                                                    >
                                                        <FiXCircle />
                                                        Absent
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Save footer */}
                        <div className="border-t border-gray-800 bg-gray-950 p-4 sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium text-gray-200">
                                        {markedCount} of {students.length} students marked
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {unmarkedCount > 0
                                            ? `${unmarkedCount} students still need a status.`
                                            : "All students have an attendance status."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSaveAttendance}
                                    disabled={
                                        saving ||
                                        !students.length ||
                                        !selectedRoutine ||
                                        markedCount !== students.length
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-gray-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                >
                                    {saving ? (
                                        <>
                                            <FiRefreshCw className="animate-spin" />
                                            Saving Attendance...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Attendance;
