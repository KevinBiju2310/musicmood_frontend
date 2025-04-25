import axiosInstance from "../api/axiosInstance";

export const googleLogin = async (token) => {
  try {
    const response = await axiosInstance.post("/signin", { token });
    return response.data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.post("/logout");
    return res.data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};
