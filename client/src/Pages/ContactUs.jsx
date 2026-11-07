import React, { useState } from "react";
import { FaEnvelope, FaUser, FaPaperPlane, FaCode } from "react-icons/fa";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";
import HomeLayout from "../Layouts/HomeLayout.jsx";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.message.trim().length < 10) {
      return toast.error("Message must contain at least 10 characters");
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/contact/send", formData);

      toast.success(response.data.message || "Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to send your message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
    <div className="min-h-screen bg-gray-950 px-5 py-16 text-gray-200 sm:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 font-semibold uppercase tracking-[3px] text-yellow-500">
            Get In Touch
          </p>

          <h1 className="mb-5 text-4xl font-bold text-white sm:text-5xl">
            Contact <span className="text-yellow-500">Us</span>
          </h1>

          <p className="mx-auto max-w-2xl leading-8 text-gray-400">
            Have a question, suggestion, or feedback about our Student
            Management System? Send us a message. We would be happy to hear
            from you.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-10 lg:grid-cols-3">

          {/* Contact Information */}
          <div className="space-y-6 lg:col-span-1">

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-xl text-gray-950">
                <FaEnvelope />
              </div>

              <h2 className="mb-3 text-2xl font-bold text-white">
                Let's Connect
              </h2>

              <p className="leading-7 text-gray-400">
                Use the contact form to share your queries, feedback,
                or suggestions regarding the project.
              </p>
            </div>

            {/* Developer Card */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-xl text-gray-950">
                <FaCode />
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                Developed By
              </p>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Jeet Hore
              </h2>

              <p className="text-gray-400">
                Student Management System
              </p>

              <div className="mt-5 border-t border-gray-800 pt-5">
                <p className="text-sm leading-7 text-gray-400">
                  Designed and developed to simplify academic
                  administration and improve information management
                  within educational institutions.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-9 lg:col-span-2">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Send Us a Message
            </h2>

            <p className="mb-8 text-sm text-gray-400">
              Fill in the details below and submit your message.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    minLength={2}
                    maxLength={60}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    maxLength={254}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter message subject"
                  required
                  minLength={3}
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="6"
                  required
                  minLength={10}
                  maxLength={3000}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-yellow-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && <FaPaperPlane />}
              </button>

            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-14 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">
            Thank you for visiting our Student Management System.
          </p>
        </div>

      </div>
    </div>
    </HomeLayout>
  );
};

export default ContactUs;
