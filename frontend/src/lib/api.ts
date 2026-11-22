import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const token = localStorage.getItem("roomsketch_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.removeItem("roomsketch_token");
        localStorage.removeItem("roomsketch_user");
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register") &&
          !window.location.pathname.startsWith("/shared") &&
          window.location.pathname !== "/"
        ) {
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);
