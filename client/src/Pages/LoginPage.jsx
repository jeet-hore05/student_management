import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserGraduate } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import axiosInstance from "../Helper/axiosInstance.js";
import { login } from "../redux/slices/authSlice.js";
import HomeLayout from "../Layouts/HomeLayout.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    if (isSignup && !formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        // Public signup is not enabled by the current backend.
        toast.error(
          "Registration is managed by the administrator. Please contact your admin."
        );
        return;
      }

      const response = await axiosInstance.post("/user/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const userData =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data;

      if (response.data?.success && userData) {
        dispatch(
          login({
            role: userData.role,
            data: userData,
          })
        );

        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(response.data?.message || "Unable to log in.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((previous) => !previous);
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
  };

  return (
    <HomeLayout>
      <section className="flex min-h-[80vh] items-center justify-center bg-gray-900 px-4 py-12 text-white sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-3xl text-gray-900">
              <FaUserGraduate />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {isSignup
                ? "Create your student management account"
                : "Log in to your Student Management System"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition-all duration-300 focus:border-yellow-500"
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition-all duration-300 focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 outline-none transition-all duration-300 focus:border-yellow-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-yellow-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-yellow-500 transition-colors hover:text-yellow-400"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Please wait..."
                : isSignup
                  ? "Sign Up"
                  : "Login"}
            </button>
          </form>

          {/* Switch between Login and Signup */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-yellow-500 hover:text-yellow-400"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-yellow-500 hover:text-yellow-400"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {isSignup && (
            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              Student and teacher accounts must be created by an authorized
              administrator.
            </p>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}

export default LoginPage;
