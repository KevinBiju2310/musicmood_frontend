import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import {
  Play,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import MoodShape from "../Components/MoodShape";
import { moodService } from "../services/moodService";
import { audioService } from "../services/audioService";

const MoodPage = () => {
  const moodOptions = [
    { name: "Happy", note: "C4", color: "bg-yellow-400", shape: "circle" },
    { name: "Calm", note: "E4", color: "bg-blue-300", shape: "square" },
    { name: "Energetic", note: "G4", color: "bg-red-500", shape: "triangle" },
    { name: "Sad", note: "A3", color: "bg-indigo-400", shape: "tear" },
    { name: "Anxious", note: "D4", color: "bg-purple-500", shape: "diamond" },
    { name: "Focused", note: "F4", color: "bg-green-400", shape: "hexagon" },
    { name: "Tired", note: "B3", color: "bg-gray-400", shape: "cloud" },
  ];

  const [currentMood, setCurrentMood] = useState(null);
  const [todayMoods, setTodayMoods] = useState([]);
  const [weeklyMoods, setWeeklyMoods] = useState({});
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [view, setView] = useState("today");
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);

  function getWeekDates(inputDate = new Date()) {
    const date = new Date(inputDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const weekDates = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      weekDates.push({
        date: currentDate,
        dayName: dayNames[i],
        formattedDate: currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }

    return weekDates;
  }
  function formatDateKey(date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate.toISOString().split("T")[0];
  }

  useEffect(() => {
    const newSynth = new Tone.Synth().toDestination();
    setSynth(newSynth);
    fetchTodayMoods();
    return () => {
      newSynth.dispose();
    };
  }, []);

  useEffect(() => {
    if (view === "weekly") {
      fetchWeeklyMoods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentWeek]);

  const fetchWeeklyMoods = async () => {
    setIsDataLoading(true);
    try {
      const weekData = {};
      for (const dayInfo of currentWeek) {
        const startofDay = new Date(dayInfo.date);
        const endofDay = new Date(dayInfo.date);
        endofDay.setHours(23, 59, 59, 999);

        const moodsForDay = await moodService.getMoodsByDateRange(
          startofDay,
          endofDay
        );
        weekData[formatDateKey(dayInfo.date)] = moodsForDay.map(
          (item) => item.mood
        );
      }
      setWeeklyMoods(weekData);
    } catch (error) {
      console.error("Error fetching weekly moods:", error);
      toast.error("Failed to load your weekly moods. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchTodayMoods = async () => {
    try {
      const data = await moodService.getTodayMoods();
      const moods = data.map((item) => item.mood);
      setTodayMoods(moods);
    } catch (error) {
      console.error("Error fetching today's moods:", error);
      toast.error("Failed to load your moods. Please try again.");
      setTodayMoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    if (todayMoods.length >= 3) {
      toast.error("You can only record up to 3 moods per day.");
      return;
    }
    setCurrentMood(mood);
    if (synth) {
      synth.triggerAttackRelease(mood.note, "8n");
    }
    try {
      await moodService.addMood(mood);
      const updatedMoods = [...todayMoods, mood];
      setTodayMoods(updatedMoods);
      toast.success(`Added ${mood.name} mood to your day!`);
    } catch (error) {
      console.log("Error adding mood", error);
      toast.error("Could not save mood. Try again!");
    }
  };

  const playTodayMelody = async () => {
    if (!synth || todayMoods.length === 0) {
      toast.error("No moods recorded yet to play!");
      return;
    }
    setIsPlaying(true);
    setShowAnimation(true);
    const notes = todayMoods.map((mood) => mood.note);
    try {
      await Tone.start();
      const now = Tone.now();
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
        setTimeout(() => {
          setActiveNoteIndex(index);
        }, index * 500);
      });
      Tone.Transport.stop();
      setTimeout(() => {
        setIsPlaying(false);
        setShowAnimation(false);
        setActiveNoteIndex(-1);
      }, notes.length * 500 + 500);
    } catch (error) {
      console.error("Error playing today's melody:", error);
      toast.error("Error playing melody. Please try again.");
      setIsPlaying(false);
      setShowAnimation(false);
      setActiveNoteIndex(-1);
    }
  };

  const playWeeklyMelody = async () => {
    const weeklyMoodsList = Object.values(weeklyMoods).flat();
    if (!synth || weeklyMoodsList.length === 0) {
      toast.error("No moods recorded this week to play!");
      return;
    }

    setIsPlaying(true);
    setShowAnimation(true);
    const notes = weeklyMoodsList.map((mood) => mood.note);
    try {
      await Tone.start();
      const now = Tone.now();
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
        setTimeout(() => {
          setActiveNoteIndex(index);
        }, index * 500);
      });
      Tone.Transport.stop();
      setTimeout(() => {
        setIsPlaying(false);
        setShowAnimation(false);
        setActiveNoteIndex(-1);
      }, notes.length * 500 + 500);
    } catch (error) {
      console.error("Error playing today's melody:", error);
      toast.error("Error playing melody. Please try again.");
      setIsPlaying(false);
      setShowAnimation(false);
      setActiveNoteIndex(-1);
    }
  };

  const downloadMelody = async () => {
    const weeklyMoodsList = Object.values(weeklyMoods).flat();
    if (weeklyMoodsList.length === 0) {
      alert("No moods recorded this week to download!");
      return;
    }

    const notes = weeklyMoodsList.map((mood) => mood.note);
    const fileName = `WeeklyMoodMelody_${currentWeek[0].formattedDate.replace(
      /\s/g,
      ""
    )}_${currentWeek[6].formattedDate.replace(/\s/g, "")}.wav`;

    try {
      setIsDownloading(true);
      await audioService.generateAudio(notes, fileName);
      toast.success("Audio file generated");
    } catch (error) {
      console.error("Error downloading melody:", error);
      alert("There was an error generating your melody. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const navigateWeek = (direction) => {
    const firstDayofCurrentWeek = new Date(currentWeek[0].date);
    const newDate = new Date(firstDayofCurrentWeek);
    if (direction === "prev") {
      newDate.setDate(firstDayofCurrentWeek.getDate() - 7);
    } else {
      newDate.setDate(firstDayofCurrentWeek.getDate() + 7);
    }
    setCurrentWeek(getWeekDates(newDate));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar />
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6 sm:mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">
                Your Mood Melody
              </h1>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center transition-all text-sm sm:text-base ${
                    view === "today"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500 text-white bg-opacity-30 hover:bg-opacity-40"
                  }`}
                  onClick={() => setView("today")}
                >
                  Today
                </button>
                <button
                  className={`flex items-center px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all text-sm sm:text-base ${
                    view === "weekly"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-500 text-white bg-opacity-30 hover:bg-opacity-40"
                  }`}
                  onClick={() => setView("weekly")}
                >
                  <Calendar className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />{" "}
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence>
              {showAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-inner"
                >
                  <div className="flex justify-center items-center h-24 sm:h-32">
                    <div className="flex items-end space-x-2 sm:space-x-3">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: [20, 60, 20],
                          }}
                          transition={{
                            duration: 0.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.1,
                          }}
                          className="w-2 sm:w-4 bg-blue-500 rounded-t-md"
                          style={{ height: 20 }}
                        />
                      ))}
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      >
                        <Music className="w-10 h-10 sm:w-14 sm:h-14 text-purple-600" />
                      </motion.div>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i + 5}
                          animate={{
                            height: [20, 60, 20],
                          }}
                          transition={{
                            duration: 0.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: (i + 5) * 0.1,
                          }}
                          className="w-2 sm:w-4 bg-blue-500 rounded-t-md"
                          style={{ height: 20 }}
                        />
                      ))}
                    </div>
                  </div>

                  {view === "today" &&
                    activeNoteIndex >= 0 &&
                    activeNoteIndex < todayMoods.length && (
                      <div className="text-center mt-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="inline-block"
                        >
                          <span className="font-medium text-sm sm:text-lg">
                            Playing:{" "}
                          </span>
                          <span
                            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full ${todayMoods[activeNoteIndex].color} text-white font-semibold text-sm sm:text-base`}
                          >
                            {todayMoods[activeNoteIndex].name}
                          </span>
                        </motion.div>
                      </div>
                    )}

                  {view === "weekly" && activeNoteIndex >= 0 && (
                    <div className="text-center mt-4">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="inline-block"
                      >
                        <span className="font-medium text-sm sm:text-lg">
                          Playing Weekly Melody
                        </span>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mood Legend */}
            <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-700">
                Mood Legend
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {moodOptions.map((mood) => (
                  <div
                    key={mood.name}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <MoodShape mood={mood} size="small" />
                    <span className="text-xs sm:text-sm font-medium">
                      {mood.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {view === "today" ? (
              <>
                <div className="mb-6 sm:mb-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                    How are you feeling today?
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.name}
                        className={`p-3 sm:p-4 rounded-lg transition-all shadow-sm hover:shadow text-sm sm:text-base ${
                          currentMood?.name === mood.name
                            ? `${mood.color} text-white font-medium`
                            : "bg-white hover:bg-gray-50 border border-gray-100"
                        }`}
                        onClick={() => handleMoodSelect(mood)}
                      >
                        {mood.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 sm:mt-10 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Today's Moods
                    </h3>
                    <div className="flex items-center">
                      <span className="text-xs sm:text-sm text-gray-500 mr-2 sm:mr-4">
                        {todayMoods.length}/3 moods recorded
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-5 justify-center sm:justify-start">
                    {todayMoods.length === 0 ? (
                      <p className="text-sm sm:text-base text-gray-500 py-3 sm:py-4 w-full text-center">
                        No moods recorded yet. Select a mood above to begin.
                      </p>
                    ) : (
                      todayMoods.map((mood, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            synth?.triggerAttackRelease(mood.note, "8n")
                          }
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <MoodShape mood={mood} size="full" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                  <button
                    onClick={playTodayMelody}
                    disabled={isPlaying || todayMoods.length === 0}
                    className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium shadow-sm transition-all text-sm sm:text-base ${
                      isPlaying || todayMoods.length === 0
                        ? "bg-gray-300 text-gray-500"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <Play className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                    {isPlaying ? "Playing..." : "Play Melody"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {isDataLoading && (
                  <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {/* Weekly View Navigation */}
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <button
                    onClick={() => navigateWeek("prev")}
                    className="p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-100 flex items-center text-sm sm:text-base"
                    disabled={isDataLoading}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="ml-1 text-gray-700 hidden sm:inline">
                      Previous
                    </span>
                  </button>

                  <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800 text-center">
                    <span className="hidden sm:inline">Week of </span>
                    {currentWeek[0].formattedDate} -{" "}
                    {currentWeek[6].formattedDate}
                  </h2>

                  <button
                    onClick={() => navigateWeek("next")}
                    className="p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-100 flex items-center text-sm sm:text-base"
                    disabled={isDataLoading}
                  >
                    <span className="mr-1 text-gray-700 hidden sm:inline">
                      Next
                    </span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>

                {/* Weekly Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-6 sm:mb-8">
                  {currentWeek.map((day) => {
                    const dayKey = formatDateKey(day.date);
                    const dayMoods = weeklyMoods[dayKey] || [];
                    const isToday =
                      new Date().toDateString() === day.date.toDateString();

                    return (
                      <div
                        key={dayKey}
                        className={`p-2 sm:p-4 rounded-lg shadow-sm ${
                          isToday
                            ? "bg-blue-50 border-2 border-blue-200"
                            : "bg-white border border-gray-100"
                        }`}
                      >
                        <div className="text-center mb-1 sm:mb-3">
                          <div
                            className={`text-xs sm:text-base font-semibold ${
                              isToday ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            {day.dayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.formattedDate}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center min-h-12 sm:min-h-16">
                          {dayMoods.length === 0 ? (
                            <div className="w-full text-center text-xs text-gray-400 mt-1 sm:mt-3">
                              No moods
                            </div>
                          ) : (
                            dayMoods.map((mood, idx) => (
                              <div
                                key={idx}
                                onClick={() =>
                                  synth?.triggerAttackRelease(mood.note, "8n")
                                }
                                className="cursor-pointer transition-transform hover:scale-110"
                              >
                                <MoodShape mood={mood} size="small" />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Weekly Controls */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                  <button
                    onClick={playWeeklyMelody}
                    disabled={
                      isPlaying ||
                      Object.values(weeklyMoods).flat().length === 0
                    }
                    className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium shadow-sm transition-all text-sm sm:text-base ${
                      isPlaying ||
                      Object.values(weeklyMoods).flat().length === 0
                        ? "bg-gray-300 text-gray-500"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <Play className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                    {isPlaying ? "Playing..." : "Play Weekly"}
                  </button>
                  <button
                    onClick={() => downloadMelody()}
                    disabled={Object.values(weeklyMoods).flat().length === 0}
                    className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium shadow-sm transition-all text-sm sm:text-base ${
                      Object.values(weeklyMoods).flat().length === 0
                        ? "bg-gray-300 text-gray-500"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <Download className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                    {isDownloading ? "Downloading..." : "Download Melody"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;
