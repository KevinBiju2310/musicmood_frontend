import axiosInstance from "../api/axiosInstance";

export const moodService = {
  addMood: async (moodData) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await axiosInstance.post("/add", {
        mood: moodData,
        date: today.toISOString(),
      });
      return response.data.mood;
    } catch (error) {
      console.error("Error adding mood:", error);
      throw error;
    }
  },
  getMoodsByDateRange: async (startDate, endDate) => {
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const response = await axiosInstance.get(
        `/range?start=${start}&end=${end}`
      );
      return response.data.moods;
    } catch (error) {
      console.error("Error adding mood:", error);
      throw error;
    }
  },
  updateDayMoods: async (date, moods) => {
    try {
      const response = await axiosInstance.put("/day", { date, moods });
      return response.data.savedMoods;
    } catch (error) {
      console.error("Error adding mood:", error);
      throw error;
    }
  },
  getTodayMoods: async () => {
    try {
      const response = await axiosInstance.get("/today");
      return response.data.moods;
    } catch (error) {
      console.error("Error fetching today's moods:", error);
      throw error;
    }
  },
  getWeeklyMoods: async () => {
    try {
      const response = await axiosInstance.get("/weekly");
      return response.data.moods;
    } catch (error) {
      console.error("Error fetching weekly moods:", error);
      throw error;
    }
  },
  deleteMoods: async (moodIds) => {
    try {
      const response = await axiosInstance.delete("/delete", {
        data: { moodIds },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting moods:", error);
      throw error;
    }
  },
};
