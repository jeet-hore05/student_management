import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FaUserCircle,
    FaEnvelope,
    FaShieldAlt,
    FaEye,
    FaEyeSlash,
    FaLock,
} from "react-icons/fa";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

function Profile() {
    const { data, role, isLoggedIn } = useSelector(
        (state) => state.auth
    );

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Support either an object or a JSON string in Redux.
    let user = data;

    if (typeof data === "string") {
        try {
            user = JSON.parse(data);
        } catch {
            user = null;
        }
    }

    const fullName =
        user?.fullName || user?.name || user?.username || "User";

    const email = user?.email || "Email not available";
    const userRole = role || user?.role || "USER";

    const handleChangePassword = async (event) => {
        event.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }

        if (newPassword === oldPassword) {
            toast.error("Your new password must differ from the old password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/change-password",
                {
                    oldPassword,
                    newPassword,
                }
            );

            if (response.data?.success) {
                toast.success(
                    response.data.message || "Password changed successfully."
                );

                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(
                    response.data?.message || "Unable to change password."
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Password change failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderPasswordField = ({
        id,
        label,
        value,
        setValue,
        visible,
        setVisible,
        autoComplete,
    }) => (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-medium text-gray-200"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    autoComplete={autoComplete}
                    required
                    minLength={id === "newPassword" ? 8 : undefined}
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 text-white outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-yellow-500"
                />

                <button
                    type="button"
                    onClick={() => setVisible((previous) => !previous)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-yellow-500"
                >
                    {visible ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
    );

    if (!isLoggedIn) {
        return (
            <HomeLayout>
                <section className="flex min-h-[70vh] items-center justify-center bg-gray-900 px-4 py-12 text-white">
                    <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center">
                        <FaUserCircle className="mx-auto text-5xl text-yellow-500" />

                        <h1 className="mt-4 text-2xl font-bold">
                            Login Required
                        </h1>

                        <p className="mt-3 text-gray-400">
                            Please log in to view your profile and change your password.
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-lg bg-yellow-500 px-6 py-3 font-bold text-gray-900 transition-colors hover:bg-yellow-400"
                        >
                            Go to Login
                        </Link>
                    </div>
                </section>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <section className="min-h-screen bg-gray-900 px-4 py-10 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    {/* Page Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold sm:text-4xl">
                            My <span className="text-yellow-500">Profile</span>
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Manage your account details and security settings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        {/* Profile Details */}
                        <div className="h-fit rounded-2xl border border-gray-700 bg-gray-800 p-6 sm:p-8 lg:col-span-2">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-500 bg-gray-900 text-5xl text-yellow-500">
                                    <FaUserCircle />
                                </div>

                                <h2 className="mt-5 text-xl font-bold sm:text-2xl">
                                    {fullName}
                                </h2>

                                <span className="mt-3 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1 text-sm font-semibold uppercase text-yellow-500">
                                    {userRole}
                                </span>
                            </div>

                            <div className="mt-8 space-y-5">
                                <div className="flex items-start gap-4 rounded-lg bg-gray-900 p-4">
                                    <FaUserCircle className="mt-1 shrink-0 text-xl text-yellow-500" />

                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400">Full Name</p>
                                        <p className="mt-1 font-medium">
                                            {fullName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-lg bg-gray-900 p-4">
                                    <FaEnvelope className="mt-1 shrink-0 text-xl text-yellow-500" />

                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400">Email Address</p>
                                        <p className="mt-1 break-all font-medium">
                                            {email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-lg bg-gray-900 p-4">
                                    <FaShieldAlt className="mt-1 shrink-0 text-xl text-yellow-500" />

                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400">Account Role</p>
                                        <p className="mt-1 font-medium">{userRole}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 sm:p-8 lg:col-span-3">
                            <div className="mb-7 flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-xl text-gray-900">
                                    <FaLock />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold sm:text-2xl">
                                        Change Password
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-400">
                                        Keep your account secure with a strong password.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleChangePassword}
                                className="space-y-5"
                            >
                                {renderPasswordField({
                                    id: "oldPassword",
                                    label: "Current Password",
                                    value: oldPassword,
                                    setValue: setOldPassword,
                                    visible: showOldPassword,
                                    setVisible: setShowOldPassword,
                                    autoComplete: "current-password",
                                })}

                                {renderPasswordField({
                                    id: "newPassword",
                                    label: "New Password",
                                    value: newPassword,
                                    setValue: setNewPassword,
                                    visible: showNewPassword,
                                    setVisible: setShowNewPassword,
                                    autoComplete: "new-password",
                                })}

                                {renderPasswordField({
                                    id: "confirmPassword",
                                    label: "Confirm New Password",
                                    value: confirmPassword,
                                    setValue: setConfirmPassword,
                                    visible: showConfirmPassword,
                                    setVisible: setShowConfirmPassword,
                                    autoComplete: "new-password",
                                })}

                                <p className="text-xs leading-relaxed text-gray-400">
                                    Your new password must contain at least 8 characters.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {isLoading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}

export default Profile;
