import React from "react";
import {
    FaGraduationCap,
    FaBullseye,
    FaEye,
    FaUsers,
    FaChalkboardTeacher,
    FaUserShield,
    FaClipboardCheck,
    FaCalendarAlt,
    FaBookOpen,
} from "react-icons/fa";

import HomeLayout from "../Layouts/HomeLayout.jsx";

const AboutUs = () => {
    const features = [
        {
            icon: <FaUsers />,
            title: "Student Management",
            description:
                "Manage student profiles, academic details, departments, semesters, and other essential information.",
        },
        {
            icon: <FaClipboardCheck />,
            title: "Attendance Management",
            description:
                "Maintain attendance records and make attendance information easily accessible.",
        },
        {
            icon: <FaCalendarAlt />,
            title: "Class Routine",
            description:
                "Organize and manage class schedules with subject, teacher, day, and time information.",
        },
        {
            icon: <FaBookOpen />,
            title: "Subject Management",
            description:
                "Manage subjects according to departments and semesters for better academic organization.",
        },
    ];

    const audiences = [
        {
            icon: <FaUserShield />,
            title: "Administrators",
            description:
                "Manage students, teachers, departments, subjects, routines, and academic activities from one place.",
        },
        {
            icon: <FaChalkboardTeacher />,
            title: "Teachers",
            description:
                "Access assigned class routines and manage student attendance efficiently.",
        },
        {
            icon: <FaGraduationCap />,
            title: "Students",
            description:
                "View personal academic information, class routines, and attendance records.",
        },
    ];

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-950 text-gray-200">

                {/* Hero Section */}
                <section className="px-5 py-20 text-center sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <p className="mb-4 font-semibold uppercase tracking-[3px] text-yellow-500">
                            About Our Project
                        </p>

                        <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                            Student Management{" "}
                            <span className="text-yellow-500">System</span>
                        </h1>

                        <p className="mx-auto max-w-3xl text-base leading-8 text-gray-400 sm:text-lg">
                            A centralized platform designed to simplify academic
                            administration, improve communication, and make student
                            information management more organized and efficient.
                        </p>
                    </div>
                </section>

                {/* Introduction */}
                <section className="mx-auto max-w-6xl px-5 py-12 sm:px-10">
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div>
                            <h2 className="mb-5 text-3xl font-bold text-white">
                                Who <span className="text-yellow-500">We Are</span>
                            </h2>

                            <p className="mb-4 leading-8 text-gray-400">
                                The Student Management System is an academic management
                                platform developed to help educational institutions
                                organize and manage their daily academic activities.
                            </p>

                            <p className="leading-8 text-gray-400">
                                It provides a common platform for administrators,
                                teachers, and students to access relevant academic
                                information. By bringing essential management activities
                                together, the system helps reduce manual work and
                                improves the overall management process.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500 text-2xl text-gray-950">
                                <FaGraduationCap />
                            </div>

                            <h3 className="mb-3 text-2xl font-bold text-white">
                                Our Purpose
                            </h3>

                            <p className="leading-8 text-gray-400">
                                To provide a simple, reliable, and organized digital
                                solution for managing student information and academic
                                activities within an educational institution.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission and Vision */}
                <section className="bg-gray-900 px-5 py-16 sm:px-10">
                    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">

                        <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 transition duration-300 hover:border-yellow-500">
                            <div className="mb-5 text-3xl text-yellow-500">
                                <FaBullseye />
                            </div>

                            <h3 className="mb-4 text-2xl font-bold text-white">
                                Our Mission
                            </h3>

                            <p className="leading-8 text-gray-400">
                                To simplify academic administration by providing
                                efficient tools for student management, attendance
                                tracking, subject organization, and class scheduling.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 transition duration-300 hover:border-yellow-500">
                            <div className="mb-5 text-3xl text-yellow-500">
                                <FaEye />
                            </div>

                            <h3 className="mb-4 text-2xl font-bold text-white">
                                Our Vision
                            </h3>

                            <p className="leading-8 text-gray-400">
                                To create a well-organized digital academic environment
                                where administrators, teachers, and students can
                                access and manage important academic information easily.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                            What We <span className="text-yellow-500">Offer</span>
                        </h2>

                        <p className="text-gray-400">
                            Essential features to make academic management easier.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition duration-300 hover:-translate-y-2 hover:border-yellow-500"
                            >
                                <div className="mb-5 text-3xl text-yellow-500">
                                    {feature.icon}
                                </div>

                                <h3 className="mb-3 text-xl font-semibold text-white">
                                    {feature.title}
                                </h3>

                                <p className="text-sm leading-7 text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Who Can Use It */}
                <section className="bg-gray-900 px-5 py-16 sm:px-10">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                                Designed for <span className="text-yellow-500">Everyone</span>
                            </h2>

                            <p className="text-gray-400">
                                A role-based platform for the entire academic community.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {audiences.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-gray-800 bg-gray-950 p-8 text-center transition duration-300 hover:border-yellow-500"
                                >
                                    <div className="mb-5 flex justify-center text-4xl text-yellow-500">
                                        {item.icon}
                                    </div>

                                    <h3 className="mb-3 text-xl font-bold text-white">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm leading-7 text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Closing Section */}
                <section className="px-5 py-16 text-center sm:px-10">
                    <h2 className="mb-5 text-3xl font-bold text-white">
                        Making Academic Management{" "}
                        <span className="text-yellow-500">Simpler</span>
                    </h2>

                    <p className="mx-auto max-w-2xl leading-8 text-gray-400">
                        Our goal is to bring essential academic activities into
                        one organized platform and make information management
                        easier for everyone.
                    </p>
                </section>

            </div>
        </HomeLayout>
    );
};

export default AboutUs;
