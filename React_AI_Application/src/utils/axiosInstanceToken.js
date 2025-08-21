import axios from "axios";

const axiosInstanceToken = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Optional: only needed if you use cookies
});

// ✅ Add interceptor to attach access_token from localStorage
axiosInstanceToken.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstanceToken;
