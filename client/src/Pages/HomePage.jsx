import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaCalendarAlt,
} from "react-icons/fa";

import HomeLayout from "../Layouts/HomeLayout";

function HomePage() {

    const { isLoggedIn, role } = useSelector((state) => state.auth);

    const userRole = String(role || "").toUpperCase();

    const features = [
        {
            title: "Student Management",
            description: "Manage student information and academic details.",
            icon: FaUserGraduate,
            path: "/students",
            roles: ["ADMIN"],
        },
        {
            title: "Teacher Management",
            description: "Manage teachers and their assigned responsibilities.",
            icon: FaChalkboardTeacher,
            path: "/teachers",
            roles: ["ADMIN"],
        },
        {
            title: "Subject Management",
            description: "Organize subjects according to departments and semesters.",
            icon: FaBook,
            path: "/subjects",
            roles: ["ADMIN", "TEACHER"],
        },
        {
            title: "Routine & Attendance",
            description: "Access class routines and attendance.",
            icon: FaCalendarAlt,
            path: "/routines",
            roles: ["ADMIN", "TEACHER"],
        },
        {
            title: "Department Management",
            description: "Manage academic departments.",
            icon: FaBook,
            path: "/departments",
            roles: ["ADMIN"],
        },
        {
            title: "Student Allotment",
            description: "Assign students to departments and semesters.",
            icon: FaUserGraduate,
            path: "/allotment",
            roles: ["ADMIN"],
        },
        {
            title: "View Records",
            description: "View available academic records.",
            icon: FaBook,
            path: "/view",
            roles: ["ADMIN", "TEACHER", "STUDENT"],
        },
        {
            title: "My Profile",
            description: "View your account details and change your password.",
            icon: FaUserGraduate,
            path: "/profile",
            roles: ["ADMIN", "TEACHER", "STUDENT"],
        },
    ];

    const visibleFeatures = isLoggedIn
        ? features.filter((feature) => feature.roles.includes(userRole))
        : [];
    return (
        <HomeLayout>

            {/* Hero Section */}
            <section className="min-h-[90vh] bg-gray-900 text-white flex items-center">

                <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">

                    {/* Hero Content */}
                    <div className="max-w-3xl mx-auto text-center">

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            Student
                            <span className="text-yellow-500">
                                {" "}Management
                            </span>
                            <br />
                            System
                        </h1>

                        <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                            A centralized platform to manage students, teachers,
                            subjects, routines and attendance efficiently in one place.
                        </p>

                    </div>

                    {/* Role-Based Feature Cards */}
                    {isLoggedIn ? (
                        <div className="mt-16 flex flex-wrap justify-center gap-5">
                            {visibleFeatures.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <Link
                                        key={feature.path}
                                        to={feature.path}
                                        className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-6 text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-yellow-500"
                                    >
                                        <Icon className="mx-auto mb-4 text-3xl text-yellow-500" />

                                        <h2 className="text-lg font-semibold">
                                            {feature.title}
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-400">
                                            {feature.description}
                                        </p>

                                        <span className="mt-4 inline-block text-sm font-semibold text-yellow-500">
                                            Open Module →
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-12 text-center">
                            <p className="mb-5 text-gray-300">
                                Log in to access your student management dashboard.
                            </p>

                            <Link
                                to="/login"
                                className="inline-block rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
                            >
                                Login to Continue
                            </Link>
                        </div>
                    )}

                </div>

            </section>

        </HomeLayout>
    );
}

export default HomePage;