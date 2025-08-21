// src/helper/axiosInstance.js (or adjust path as needed)

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enables cookies if needed
});

export default axiosInstance;



