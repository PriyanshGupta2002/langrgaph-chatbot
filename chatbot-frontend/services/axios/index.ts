/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/axios.ts

import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

appApi.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken");

  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) return config;

  const decoded: any = jwtDecode(accessToken);

  const currentTime = Math.floor(Date.now() / 1000);

  if (decoded.exp <= currentTime) {
    const response = await appApi.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    });

    const newAccessToken = response.data.data.access_token;

    localStorage.setItem("accessToken", newAccessToken);

    config.headers.Authorization = `Bearer ${newAccessToken}`;
  } else {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
