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
import { moodService } from "../services/moodService";

const MoodPage = () => {
  const moodOptions = [
    { name: "Happy", note: "C4", color: "bg-yellow-400" },
    { name: "Calm", note: "E4", color: "bg-blue-300" },
    { name: "Energetic", note: "G4", color: "bg-red-500" },
    { name: "Sad", note: "A3", color: "bg-indigo-400" },
    { name: "Anxious", note: "D4", color: "bg-purple-500" },
    { name: "Focused", note: "F4", color: "bg-green-400" },
    { name: "Tired", note: "B3", color: "bg-gray-400" },
  ];

  const [currentMood, setCurrentMood] = useState(null);
  const [todayMoods, setTodayMoods] = useState([]);
  const [weeklyMoods, setWeeklyMoods] = useState({});
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("today");
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());

  function getWeekDates() {
    const date = new Date();
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday

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

  // useEffect(() => {
  //   localStorage.setItem("todayMoods", JSON.stringify(todayMoods));
  // }, [todayMoods]);

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
  //   console.log(todayMoods);

  const playTodayMelody = async () => {
    if (!synth || todayMoods.length == 0) {
      toast.error("No moods recorded yet to play!");
      return;
    }
    setIsPlaying(true);
    const notes = todayMoods.map((mood) => mood.note);
    const sequence = new Tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, "8n", time);
    }, notes).start(0);
    await Tone.start();
    Tone.Transport.start();

    // Stop after playing the sequence
    setTimeout(() => {
      Tone.Transport.stop();
      sequence.dispose();
      setIsPlaying(false);
    }, notes.length * 500 + 500);
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

  // const resetToday = async () => {
  //   if (todayMoods.length === 0) return;
  //   try {
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     await moodService.deleteTodayMoods(today);
  //     setTodayMoods([]);
  //     toast.success("Reset today's moods");
  //   } catch (error) {
  //     console.error("Error resetting moods:", error);
  //     toast.error("Failed to reset your moods. Please try again.");
  //   }
  // };

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
  // console.log(weeklyMoods);
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
                  todayMoods.map((val, idx) => (
                    <div
                      key={idx}
                      className={`${val.color} p-3 rounded-full w-10 h-10 flex items-center justify-center transition-transform hover:scale-110`}
                      onClick={() =>
                        synth?.triggerAttackRelease(val.note, "8n")
                      }
                      title={val.mood}
                    />
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
                // onClick={downloadMelody}
                disabled={todayMoods.length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  todayMoods.length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Download className="mr-1 w-4 h-4" /> Download Melody
              </button>

              {/* <button
            onClick={resetToday}
            disabled={todayMoods.length === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              todayMoods.length === 0
                ? "bg-gray-300 text-gray-500"
                : "bg-red-100 hover:bg-red-200 text-red-800"
            }`}
          >
            <LogOut className="mr-1 w-4 h-4" /> Reset
          </button> */}
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
                            className={`${mood.color} rounded-full w-6 h-6 flex items-center justify-center transition-transform hover:scale-110`}
                            onClick={() =>
                              synth?.triggerAttackRelease(mood.note, "8n")
                            }
                            title={mood.name}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-3">Weekly Mood Pattern</h3>
              <div className="h-32 flex items-end">
                {currentWeek.map((day) => {
                  const dayKey = formatDateKey(day.date);
                  const dayMoods = weeklyMoods[dayKey] || [];
                  const height = dayMoods.length
                    ? Math.min(100, dayMoods.length * 15 + 10)
                    : 10;

                  return (
                    <div
                      key={dayKey}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-400 rounded-t-md transition-all duration-500"
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
                // onClick={playWeeklyMelody}
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
                disabled={Object.values(weeklyMoods).flat().length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  Object.values(weeklyMoods).flat().length === 0
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Download className="mr-1 w-4 h-4" /> Download Weekly Melody
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodPage;
