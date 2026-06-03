import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      console.error("Network error. Is the backend server running on port 5000?");
    } else if (error.response?.status === 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
