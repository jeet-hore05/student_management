import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMenu } from "react-icons/fi";
import { AiFillCloseCircle } from "react-icons/ai";

import Footer from "../Components/Footer.jsx";
import { logout } from "../redux/slices/authSlice.js";

function HomeLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, role } = useSelector((state) => state.auth);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeDrawer();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-700 bg-gray-800 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeDrawer}
            className="text-lg font-bold sm:text-xl"
          >
            Student{" "}
            <span className="text-yellow-500">Management</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="transition-colors duration-300 hover:text-yellow-500"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="transition-colors duration-300 hover:text-yellow-500"
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className="transition-colors duration-300 hover:text-yellow-500"
            >
              Contact Us
            </Link>
          </nav>

          {/* Desktop Authentication */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-lg border border-yellow-500 px-4 py-2 text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-900 transition-all duration-300 hover:bg-yellow-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="rounded-lg border border-yellow-500 px-4 py-2 text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900"
                >
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-900 transition-all duration-300 hover:bg-yellow-400"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-lg p-2 text-2xl text-yellow-500 transition-colors duration-300 hover:bg-gray-700 md:hidden"
            aria-label="Open navigation drawer"
            aria-expanded={isDrawerOpen}
          >
            <FiMenu />
          </button>
        </div>
      </header>

      {/* Mobile Drawer and Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full bg-black/60"
            aria-label="Close navigation drawer"
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-gray-700 bg-gray-800 shadow-xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-700 p-5">
              <Link
                to="/"
                onClick={closeDrawer}
                className="text-lg font-bold"
              >
                Student{" "}
                <span className="text-yellow-500">Management</span>
              </Link>

              <button
                onClick={closeDrawer}
                className="text-2xl text-yellow-500 transition-colors duration-300 hover:text-yellow-400"
                aria-label="Close navigation drawer"
              >
                <AiFillCloseCircle />
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-2 p-5">
              <Link
                to="/"
                onClick={closeDrawer}
                className="rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:text-yellow-500"
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={closeDrawer}
                className="rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:text-yellow-500"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                onClick={closeDrawer}
                className="rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:text-yellow-500"
              >
                Contact Us
              </Link>

              {isLoggedIn && (
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:text-yellow-500"
                >
                  Profile
                </Link>
              )}
            </nav>

            {/* Authentication Actions Pushed to Bottom */}
            <div className="mt-auto border-t border-gray-700 p-5">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-gray-900 transition-all duration-300 hover:bg-yellow-400"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/signup"
                    onClick={closeDrawer}
                    className="rounded-lg border border-yellow-500 px-4 py-3 text-center font-semibold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900"
                  >
                    Sign Up
                  </Link>

                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="rounded-lg bg-yellow-500 px-4 py-3 text-center font-semibold text-gray-900 transition-all duration-300 hover:bg-yellow-400"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomeLayout;
