import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // Change if your backend runs on a different port
});

// Automatically attach token from localStorage to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API calls
export const getProfile = (userId) => API.get(`/profile/${userId}`);

// Now with optional limit param, default 5
export const getUserSubmissions = (userId, limit = 5) =>
  API.get("/submissions", { params: { userId, limit } });

export const submitCode = (submissionData) => API.post("/run", submissionData);

export default API;
