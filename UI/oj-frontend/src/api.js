// OJ/UI/oj-frontend/src/api.js
import axios from "axios";

const API = axios.create({
  // Read from environment at build time
  baseURL: import.meta.env.VITE_API_URL || "https://your-backend-service.onrender.com",
});

// Attach token automatically for authenticated requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const signupUser = (data) => API.post("/signup", data);
export const loginUser = (credentials) => API.post("/login", credentials);

// Profile & Submission endpoints
export const getProfile = (userId) => API.get(`/profile/${userId}`);
export const getUserSubmissions = (userId, limit = 5) =>
  API.get("/submissions", { params: { userId, limit } });
export const submitCode = (submissionData) => API.post("/run", submissionData);

export default API;
