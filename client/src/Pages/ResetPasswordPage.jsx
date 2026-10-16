import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

function ResetPasswordPage() {
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post(
                `/user/reset/${resetToken}`,
                { password }
            );

            if (response.data?.success) {
                toast.success(response.data.message || "Password reset successful.");
                navigate("/login");
            } else {
                toast.error(response.data?.message || "Unable to reset password.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Password reset failed. Your token may be invalid or expired."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <HomeLayout>
            <section className="flex min-h-[80vh] items-center justify-center bg-gray-900 px-4 py-12 text-white">
                <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl sm:p-8">
                    <h1 className="text-center text-2xl font-bold sm:text-3xl">
                        Reset <span className="text-yellow-500">Password</span>
                    </h1>

                    <p className="mt-3 text-center text-sm text-gray-400">
                        Enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                New Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 outline-none transition-all duration-300 focus:border-yellow-500"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 outline-none transition-all duration-300 focus:border-yellow-500"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((value) => !value)}
                                    aria-label={
                                        showConfirmPassword ? "Hide password" : "Show password"
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Back to{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-yellow-500 hover:text-yellow-400"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </section>
        </HomeLayout>
    );
}

export default ResetPasswordPage;