import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout.jsx";
import axiosInstance from "../Helper/axiosInstance.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/user/reset", {
        email: email.trim(),
      });

      if (response.data?.success) {
        toast.success(
          response.data.message || "Check your email for reset instructions."
        );
      } else {
        toast.error(response.data?.message || "Unable to request password reset.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Password reset request failed."
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
            Forgot <span className="text-yellow-500">Password?</span>
          </h1>

          <p className="mt-3 text-center text-sm leading-relaxed text-gray-400">
            Enter your registered email address to request a password reset.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 outline-none transition-all duration-300 focus:border-yellow-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Request Password Reset"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Remember your password?{" "}
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

export default ForgotPasswordPage;