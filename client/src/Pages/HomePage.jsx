import { Link } from "react-router-dom";
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaCalendarAlt,
} from "react-icons/fa";

import HomeLayout from "../Layouts/HomeLayout";

function HomePage() {
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

                    {/* Feature Cards */}
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* Students */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500 hover:-translate-y-1 transition-all ease-in-out duration-300">

                            <FaUserGraduate
                                className="text-yellow-500 text-3xl mx-auto mb-4"
                            />

                            <h2 className="text-lg font-semibold">
                                Student Management
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                Manage student information and academic details.
                            </p>

                        </div>

                        {/* Teachers */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500 hover:-translate-y-1 transition-all ease-in-out duration-300">

                            <FaChalkboardTeacher
                                className="text-yellow-500 text-3xl mx-auto mb-4"
                            />

                            <h2 className="text-lg font-semibold">
                                Teacher Management
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                Manage teachers and their assigned responsibilities.
                            </p>

                        </div>

                        {/* Subjects */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500 hover:-translate-y-1 transition-all ease-in-out duration-300">

                            <FaBook
                                className="text-yellow-500 text-3xl mx-auto mb-4"
                            />

                            <h2 className="text-lg font-semibold">
                                Subject Management
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                Organize subjects according to departments and semesters.
                            </p>

                        </div>

                        {/* Routine */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500 hover:-translate-y-1 transition-all ease-in-out duration-300">

                            <FaCalendarAlt
                                className="text-yellow-500 text-3xl mx-auto mb-4"
                            />

                            <h2 className="text-lg font-semibold">
                                Routine & Attendance
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                Manage class routines and track student attendance.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </HomeLayout>
    );
}

export default HomePage;