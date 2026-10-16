import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

function ChangePasswordPage() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must differ from the current password.");
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

        navigate("/profile");
      } else {
        toast.error(response.data?.message || "Unable to change password.");
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

  const passwordField = (
    id,
    label,
    value,
    setValue,
    visible,
    setVisible,
    autoComplete
  ) => (
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

  return (
    <HomeLayout>
      <section className="flex min-h-[80vh] items-center justify-center bg-gray-900 px-4 py-12 text-white sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-2xl text-gray-900">
              <FaLock />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Change <span className="text-yellow-500">Password</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Enter your current password and choose a new secure password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {passwordField(
              "oldPassword",
              "Current Password",
              oldPassword,
              setOldPassword,
              showOldPassword,
              setShowOldPassword,
              "current-password"
            )}

            {passwordField(
              "newPassword",
              "New Password",
              newPassword,
              setNewPassword,
              showNewPassword,
              setShowNewPassword,
              "new-password"
            )}

            {passwordField(
              "confirmPassword",
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              showConfirmPassword,
              setShowConfirmPassword,
              "new-password"
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Want to go back?{" "}
            <Link
              to="/"
              className="font-semibold text-yellow-500 transition-colors hover:text-yellow-400"
            >
              Home
            </Link>
          </p>
        </div>
      </section>
    </HomeLayout>
  );
}

export default ChangePasswordPage;
