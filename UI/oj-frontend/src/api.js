// src/api.js
import axios from "axios";

const API = axios.create({
  // Backend URL from Vite environment variable, fallback to your deployed backend
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://your-backend-service.onrender.com",
  withCredentials: false, // disable if you don't use cookies auth
});

// Automatically attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional — auto logout on Unauthorized from backend
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized, clearing session...");
      localStorage.clear();
      // You can also redirect to /login here if you want:
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- Auth endpoints ---
export const signupUser = (data) => API.post("/signup", data);
export const loginUser = (credentials) => API.post("/login", credentials);

// --- User endpoints ---
export const getProfile = (userId) => API.get(`/profile/${userId}`);
export const getUserSubmissions = (userId, limit = 5) =>
  API.get("/submissions", { params: { userId, limit } });

// --- Code execution ---
export const submitCode = (submissionData) =>
  API.post("/run", submissionData);

export default API;
