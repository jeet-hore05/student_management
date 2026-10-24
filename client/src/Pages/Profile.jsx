import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSyncAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

function Profile() {
  const dispatch = useDispatch();
  const { isLoggedIn, data, role } = useSelector((state) => state.auth);

  const [user, setUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    setFetchError("");

    try {
      const response = await axiosInstance.get("/user/me");

      if (response.data?.success) {
        const profileData =
          response.data.user ||
          response.data.data?.user ||
          response.data.data;

        if (!profileData || typeof profileData !== "object") {
          throw new Error("The server returned an invalid profile response.");
        }

        setUser(profileData);
      } else {
        throw new Error(
          response.data?.message || "Unable to load profile."
        );
      }
    } catch (error) {
      setFetchError(
        error.response?.data?.message ||
        error.message ||
        "Unable to load your profile."
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    } else {
      setIsFetching(false);
    }
  }, [isLoggedIn, fetchProfile]);

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

    if (oldPassword === newPassword) {
      toast.error("New password must differ from your current password.");
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
        { oldPassword, newPassword }
      );

      if (response.data?.success) {
        toast.success(
          response.data.message || "Password changed successfully."
        );

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

            <h1 className="mt-4 text-2xl font-bold">Login Required</h1>

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

  const displayUser = user || (typeof data === "object" ? data : null);

  const fullName =
    displayUser?.fullName ||
    displayUser?.name ||
    displayUser?.username ||
    "User";


  const avatarUrl =
    typeof displayUser?.avatar === "string"
      ? displayUser.avatar
      : displayUser?.avatar?.secure_url ||
      displayUser?.avatar?.url ||
      "";

  const email = displayUser?.email || "Email not available";
  const userRole = displayUser?.role || role || "USER";

  return (
    <HomeLayout>
      <section className="min-h-screen bg-gray-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                My <span className="text-yellow-500">Profile</span>
              </h1>

              <p className="mt-2 text-gray-400">
                Manage your account details and security settings.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchProfile}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900 disabled:opacity-60"
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {isFetching ? (
            <div className="flex min-h-60 items-center justify-center rounded-2xl border border-gray-700 bg-gray-800">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-warning" />
                <p className="mt-4 text-gray-400">Loading your profile...</p>
              </div>
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">{fetchError}</p>
                  <button
                    type="button"
                    onClick={fetchProfile}
                    className="mt-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Profile Details */}
                <div className="h-fit rounded-2xl border border-gray-700 bg-gray-800 p-6 sm:p-8 lg:col-span-2">
                  <div className="flex flex-col items-center text-center">

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-yellow-500 bg-gray-900 text-5xl text-yellow-500">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${fullName}'s profile`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>


                    <h2 className="mt-5 wrap-break-word text-xl font-bold sm:text-2xl">
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
                        <p className="mt-1 wrap-break-word font-medium">
                          {fullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg bg-gray-900 p-4">
                      <FaEnvelope className="mt-1 shrink-0 text-xl text-yellow-500" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-400">Email Address</p>
                        <p className="mt-1 break-all font-medium">{email}</p>
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
            </>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}

export default Profile;
