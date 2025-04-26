import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import {
  Play,
  Download,
  LogOut,
  Edit,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
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
  const [view, setView] = useState("today");
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [isDownloading, setIsDownloading] = useState(false);

  function getWeekDates() {
    const date = new Date();
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
    return date.toISOString().split("T")[0];
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
  }, [view, currentWeek]);

  const fetchWeeklyMoods = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const fetchTodayMoods = async () => {
    setIsLoading(true);
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
    const notes = todayMoods.map((mood) => mood.note);
    try {
      await Tone.start();
      const now = Tone.now();
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
      });
      Tone.Transport.stop();
      setTimeout(() => {
        setIsPlaying(false);
      }, notes.length * 500 + 500);
    } catch (error) {
      console.error("Error playing today's melody:", error);
      toast.error("Error playing melody. Please try again.");
      setIsPlaying(false);
    }
  };

  const playWeeklyMelody = async () => {
    const weeklyMoodsList = Object.values(weeklyMoods).flat();
    if (!synth || weeklyMoodsList.length === 0) {
      toast.error("No moods recorded this week to play!");
      return;
    }

    setIsPlaying(true);
    const notes = weeklyMoodsList.map((mood) => mood.note);
    try {
      await Tone.start();
      const now = Tone.now();
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
      });
      Tone.Transport.stop();
      setTimeout(() => {
        setIsPlaying(false);
      }, notes.length * 500 + 500);
    } catch (error) {
      console.error("Error playing today's melody:", error);
      toast.error("Error playing melody. Please try again.");
      setIsPlaying(false);
    }
  };

  const downloadMelody = async (type) => {
    let notes = [];
    let fileName = "";
    if (type === "today") {
      if (todayMoods.length === 0) {
        alert("No moods recorded today to download!");
        return;
      }
      notes = todayMoods.map((mood) => mood.note);
      fileName = `MoodMelody_${new Date()
        .toLocaleDateString()
        .replace(/\//g, "-")}.wav`;
    } else if (type === "weekly") {
      const weeklyMoodsList = Object.values(weeklyMoods).flat();
      if (weeklyMoodsList.length === 0) {
        alert("No moods recorded this week to download!");
        return;
      }
      notes = weeklyMoodsList.map((mood) => mood.note);
      fileName = `WeeklyMoodMelody_${currentWeek[0].formattedDate.replace(
        /\s/g,
        ""
      )}_${currentWeek[6].formattedDate.replace(/\s/g, "")}.wav`;
    } else {
      alert("Invalid melody type selected.");
      return;
    }

    try {
      setIsDownloading(true);
      await audioService.generateAudio(notes, fileName);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Mood Melody</h1>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                view === "today"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setView("today")}
            >
              Today
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-md ${
                view === "weekly"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setView("weekly")}
            >
              <Calendar className="mr-1 w-4 h-4" /> Weekly
            </button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Mood Legend</h3>
          <div className="flex flex-wrap gap-3">
            {moodOptions.map((mood) => (
              <div key={mood.name} className="flex items-center gap-2">
                <MoodShape mood={mood} size="small" />
                <span className="text-xs">{mood.name}</span>
              </div>
            ))}
          </div>
        </div>

        {view === "today" ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">
                How are you feeling today?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.name}
                    className={`p-3 rounded-md transition-all ${
                      currentMood?.name === mood.name
                        ? `${mood.color} text-white`
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => handleMoodSelect(mood)}
                  >
                    {mood.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Today's Moods</h3>
                {todayMoods.length > 0 && (
                  <button
                    // onClick={openRemixModal}
                    className="flex items-center text-sm px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-md text-purple-800"
                  >
                    <Edit className="mr-1 w-4 h-4" /> Remix
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {todayMoods.length === 0 ? (
                  <p className="text-gray-500">
                    No moods recorded yet. Select a mood above to begin.
                  </p>
                ) : (
                  todayMoods.map((mood, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        synth?.triggerAttackRelease(mood.note, "8n")
                      }
                    >
                      <MoodShape mood={mood} size="full" />
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={playTodayMelody}
                disabled={isPlaying || todayMoods.length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPlaying || todayMoods.length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Play className="mr-1 w-4 h-4" />{" "}
                {isPlaying ? "Playing..." : "Play Melody"}
              </button>

              <button
                onClick={() => downloadMelody("today")}
                disabled={todayMoods.length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  todayMoods.length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Download className="mr-1 w-4 h-4" />{" "}
                {isDownloading ? "Downloading..." : "Download Melody"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateWeek("prev")}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-medium">
                Week of {currentWeek[0].formattedDate} -{" "}
                {currentWeek[6].formattedDate}
              </h2>

              <button
                onClick={() => navigateWeek("next")}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {currentWeek.map((day) => {
                const dayKey = formatDateKey(day.date);
                const dayMoods = weeklyMoods[dayKey] || [];
                const isToday =
                  new Date().toDateString() === day.date.toDateString();

                return (
                  <div
                    key={dayKey}
                    className={`p-3 rounded-md ${
                      isToday
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium">{day.dayName}</div>
                      <div className="text-xs text-gray-500">
                        {day.formattedDate}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center">
                      {dayMoods.length === 0 ? (
                        <div className="w-full text-center text-xs text-gray-400 mt-2">
                          No moods
                        </div>
                      ) : (
                        dayMoods.map((mood, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              synth?.triggerAttackRelease(mood.note, "8n")
                            }
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
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-3">Weekly Mood Pattern</h3>

              {/* Debug information */}
              <div className="text-xs text-gray-500 mb-2">
                Data loaded:{" "}
                {Object.keys(weeklyMoods).length > 0 ? "Yes" : "No"} | Total
                moods: {Object.values(weeklyMoods).flat().length}
              </div>

              <div className="h-32 flex items-end space-x-1 border-b border-gray-200">
                {currentWeek.map((day) => {
                  const dayKey = formatDateKey(day.date);
                  const dayMoods = weeklyMoods[dayKey] || [];
                  // Make bars more visible - minimum height of 20% and larger multiplier
                  const height =
                    dayMoods.length > 0
                      ? Math.min(100, 30 + dayMoods.length * 15)
                      : 10;

                  return (
                    <div
                      key={dayKey}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="text-xs mb-1">{dayMoods.length || 0}</div>
                      <div
                        className="w-4/5 bg-blue-500 rounded-t-md transition-all duration-700 ease-out transform hover:scale-105"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs mt-1">{day.dayName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={playWeeklyMelody}
                disabled={
                  isPlaying || Object.values(weeklyMoods).flat().length === 0
                }
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPlaying || Object.values(weeklyMoods).flat().length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Play className="mr-1 w-4 h-4" />{" "}
                {isPlaying ? "Playing..." : "Play Weekly Melody"}
              </button>
              <button
                onClick={() => downloadMelody("weekly")}
                disabled={Object.values(weeklyMoods).flat().length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  Object.values(weeklyMoods).flat().length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Download className="mr-1 w-4 h-4" />{" "}
                {isDownloading ? "Downloading..." : "Download Weekly Melody"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodPage;
