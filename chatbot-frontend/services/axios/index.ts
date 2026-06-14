// src/services/axios.ts

import axios from "axios";

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Public/Auth API instance
export const authApi = axios.create({
  baseURL: `${BASE_API_URL}/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Protected/App API instance
export const appApi = axios.create({
  baseURL: `${BASE_API_URL}`,
  withCredentials: true, // sends cookies/session automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Attach token automatically
appApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Optional: Handle unauthorized responses
appApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized");
      // logout logic / refresh token logic here
    }

    return Promise.reject(error);
  },
);
