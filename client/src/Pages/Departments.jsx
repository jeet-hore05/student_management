
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import HomeLayout from "../Layouts/HomeLayout";
import axiosInstance from "../Helper/axiosInstance";

const initialForm = {
  name: "",
  code: "",
  description: "",
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchDepartments = useCallback(async (showLoader = true) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axiosInstance.get("/allotment/departments");

      setDepartments(response.data.departments || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load departments.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return departments;

    return departments.filter((department) => {
      const name = department.name || "";
      const code = department.code || "";
      const description = department.description || "";

      return (
        name.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [departments, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim();
    const description = form.description.trim();

    if (!name || !code || !description) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axiosInstance.post(
        "/allotment/department",
        {
          name,
          code,
          description,
        }
      );

      toast.success(
        response.data.message || "Department created successfully."
      );

      setForm(initialForm);
      setShowForm(false);

      await fetchDepartments(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = departments.filter(
    (department) => department.isActive !== false
  ).length;

  const inactiveCount = departments.length - activeCount;

  return (
    <HomeLayout>
      <main className="min-h-screen bg-gray-900 px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-yellow-500">
                <FiLayers size={22} />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Administration
                </span>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Department Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-400 sm:text-base">
                Create departments and manage your institution's department
                directory.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition-all duration-300 hover:bg-yellow-400"
            >
              <FiPlus size={20} />
              Add Department
            </button>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Total Departments</p>
                <FiLayers className="text-yellow-500" size={22} />
              </div>
              <p className="mt-3 text-3xl font-bold">{departments.length}</p>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Active Departments</p>
                <FiCheckCircle className="text-green-400" size={22} />
              </div>
              <p className="mt-3 text-3xl font-bold">{activeCount}</p>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Inactive Departments</p>
                <FiAlertCircle className="text-red-400" size={22} />
              </div>
              <p className="mt-3 text-3xl font-bold">{inactiveCount}</p>
            </div>
          </section>

          {/* Department directory */}
          <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
            <div className="flex flex-col gap-4 border-b border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="text-lg font-semibold">All Departments</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {filteredDepartments.length} department
                  {filteredDepartments.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 focus-within:border-yellow-500">
                  <FiSearch className="shrink-0 text-gray-400" size={18} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search departments..."
                    className="w-full bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-500 sm:w-56"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => fetchDepartments(false)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={refreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <span className="loading loading-spinner loading-lg text-yellow-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <FiAlertCircle size={38} className="text-red-400" />
                <p className="mt-4 font-semibold">Unable to load departments</p>
                <p className="mt-2 text-sm text-gray-400">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchDepartments()}
                  className="mt-5 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-950 transition hover:bg-yellow-400"
                >
                  Try Again
                </button>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <FiLayers size={42} className="text-gray-500" />
                <h3 className="mt-4 text-lg font-semibold">
                  {search ? "No matching departments" : "No departments yet"}
                </h3>
                <p className="mt-2 max-w-md text-sm text-gray-400">
                  {search
                    ? "Try another name, code, or keyword."
                    : "Create your first department to get started."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-950 transition hover:bg-yellow-400"
                  >
                    <FiPlus size={18} />
                    Create Department
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="table">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="bg-gray-800">Department</th>
                        <th className="bg-gray-800">Code</th>
                        <th className="bg-gray-800">Description</th>
                        <th className="bg-gray-800">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDepartments.map((department) => {
                        const isActive = department.isActive !== false;

                        return (
                          <tr
                            key={department._id}
                            className="border-b border-gray-700 transition-colors hover:bg-gray-700/40"
                          >
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                                  <FiLayers size={20} />
                                </div>
                                <span className="font-semibold text-gray-100">
                                  {department.name}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="rounded-md border border-gray-600 bg-gray-900 px-3 py-1 font-mono text-sm text-yellow-400">
                                {department.code}
                              </span>
                            </td>

                            <td className="max-w-sm text-gray-300">
                              <p className="line-clamp-2">
                                {department.description || "No description"}
                              </p>
                            </td>

                            <td>
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                  isActive
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    isActive ? "bg-green-400" : "bg-red-400"
                                  }`}
                                />
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile and tablet cards */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden sm:grid-cols-2">
                  {filteredDepartments.map((department) => {
                    const isActive = department.isActive !== false;

                    return (
                      <article
                        key={department._id}
                        className="rounded-xl border border-gray-700 bg-gray-900 p-4 transition-all duration-300 hover:border-yellow-500/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                              <FiLayers size={21} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="wrap-break-words font-semibold">
                                {department.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-yellow-400">
                                {department.code}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-4 border-t border-gray-700 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Description
                          </p>
                          <p className="mt-2 wrap-break-word text-sm leading-6 text-gray-300">
                            {department.description || "No description provided."}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Create department modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="department-modal-title"
              className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-700 p-5">
                <div>
                  <h2
                    id="department-modal-title"
                    className="text-xl font-bold"
                  >
                    Add Department
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter the department information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  aria-label="Close form"
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <FiX size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <div>
                  <label
                    htmlFor="department-name"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Department Name
                  </label>
                  <input
                    id="department-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department-code"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Department Code
                  </label>
                  <input
                    id="department-code"
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. CSE"
                    maxLength={20}
                    required
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 uppercase text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The code is automatically converted to uppercase.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="department-description"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Description
                  </label>
                  <textarea
                    id="department-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe this department..."
                    rows={4}
                    maxLength={500}
                    required
                    className="w-full resize-y rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-gray-100 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {form.description.length}/500
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-700 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="rounded-lg border border-gray-600 px-5 py-3 font-medium transition hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition-all duration-300 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus size={18} />
                        Create Department
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </HomeLayout>
  );
}

export default Departments;
