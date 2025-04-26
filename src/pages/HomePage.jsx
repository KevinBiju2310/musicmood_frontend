import React, { useState, useEffect } from "react";
import { Music, Headphones, Heart, Sparkles, Play } from "lucide-react";
import Navbar from "../Components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const HomePage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const features = [
    {
      title: "Personalized Playlists",
      description:
        "Get custom music recommendations based on your current mood and preferences.",
      icon: <Heart className="text-pink-500" size={40} />,
    },
    {
      title: "Mood Detection",
      description:
        "Our smart algorithm detects your mood and suggests the perfect tracks to match.",
      icon: <Sparkles className="text-yellow-500" size={40} />,
    },
    {
      title: "Discover Music",
      description:
        "Explore new artists and genres tailored specifically to your taste.",
      icon: <Music className="text-purple-500" size={40} />,
    },
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  });

  const handleGetStarted = () => {
    if (!user) {
      toast.error("Please SignIn to continue");
    } else {
      navigate("/mood");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="block">Music that matches</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                your mood
              </span>
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Discover the perfect soundtrack for every emotion. MusicMood uses
              advanced algorithms to understand how you feel and deliver
              personalized music experiences.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all text-lg font-medium flex items-center justify-center"
              >
                <Play size={20} className="mr-2" />
                Get Started
              </button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Headphones size={80} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-black bg-opacity-30 rounded-3xl my-12"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience Music Like Never Before
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`md:w-1/3 p-8 rounded-xl flex flex-col items-center transition-all duration-500 ${
                currentFeature === index
                  ? "bg-white bg-opacity-10 scale-105 shadow-lg"
                  : "opacity-70"
              }`}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-center text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How MusicMood Works
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our intelligent platform creates a seamless experience from mood to
            music in just three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-5 p-8 rounded-2xl hover:bg-opacity-10 transition-all">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center mb-6">
              <span className="font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Share Your Mood</h3>
            <p className="text-gray-300">
              Tell us how you're feeling or let our smart analysis detect your
              mood from your activity.
            </p>
          </div>

          <div className="bg-white bg-opacity-5 p-8 rounded-2xl hover:bg-opacity-10 transition-all">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-6">
              <span className="font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Processing</h3>
            <p className="text-gray-300">
              Our algorithm analyzes your mood, preferences, and listening
              history to craft the perfect playlist.
            </p>
          </div>

          <div className="bg-white bg-opacity-5 p-8 rounded-2xl hover:bg-opacity-10 transition-all">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center mb-6">
              <span className="font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Enjoy Your Music</h3>
            <p className="text-gray-300">
              Listen to a curated selection of tracks perfectly matched to how
              you feel right now.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Ready to match your music to your mood?
        </h2>
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all text-lg font-medium flex items-center justify-center mx-auto"
        >
          <Play size={20} className="mr-2" />
          Get Started Now
        </button>
        <p className="mt-6 text-gray-300">
          No credit card required. Free to try.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
