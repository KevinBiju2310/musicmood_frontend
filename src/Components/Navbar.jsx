import React, { useState } from "react";
import { Headphones, UserPlus, X, LogOut } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../services/authService";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../Redux/userSlice";
import { logout } from "../services/authService";
import moodImg from "../assets/moodmusic_login.jpg";
import moodbgd from "../assets/moodmusic_background.jpg";

const Navbar = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const openSignInModal = () => {
    setShowSignInModal(true);
  };

  const closeSignInModal = () => {
    setShowSignInModal(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const userData = await googleLogin(credential);
      dispatch(setUser(userData));
      console.log("user logged in: ", userData);
      toast.success(`Welcome, ${userData.user?.name || "User"}!`, {
        style: {
          backgroundColor: "#4CAF50",
          color: "white",
        },
      });
      closeSignInModal();
    } catch (err) {
      console.error("Error occured: ", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setUser(null));
      toast("Logged out successfully", {
        icon: "👋",
        style: {
          backgroundColor: "#ef4444",
          color: "white",
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Something went wrong during logout.");
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center p-6 lg:px-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg text-white rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <Headphones size={32} className="text-pink-400" />
          <span className="text-2xl font-bold text-white tracking-wide">
            MusicMood
          </span>
        </div>
        {/* <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-pink-300 transition-colors">
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-pink-300 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="hover:text-pink-300 transition-colors"
          >
            Testimonials
          </a>
        </div> */}
        <div className="flex space-x-4">
          {user ? (
            <button
              className="px-5 py-2 rounded-full bg-white text-purple-600 font-semibold hover:bg-purple-100 transition-all flex items-center shadow-md"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          ) : (
            <button
              className="px-5 py-2 rounded-full bg-white text-purple-600 font-semibold hover:bg-purple-100 transition-all flex items-center shadow-md"
              onClick={openSignInModal}
            >
              <UserPlus size={16} className="mr-2" />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            {/* Close button */}
            <button
              onClick={closeSignInModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={24} />
            </button>

            {/* Modal header with gradient and background image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-90"></div>
              <img
                src={moodbgd}
                alt="Music background"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold drop-shadow-md">
                  Welcome to MusicMood
                </h3>
                <p className="mt-2 opacity-90 drop-shadow-md">
                  Sign in to discover music tailored to your mood
                </p>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <img
                    src={moodImg}
                    alt="Music mood illustration"
                    className="w-24 h-24 rounded-full mb-4"
                  />
                </div>

                <p className="text-center text-gray-600">
                  Continue with your Google account for the best experience
                </p>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log("Login Failed")}
                  />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    By signing in, you agree to our{" "}
                    <a href="#" className="text-pink-500 hover:text-pink-600">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-pink-500 hover:text-pink-600">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
