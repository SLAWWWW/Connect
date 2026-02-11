import axios from "axios";

// Create an axios instance with default config
export const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

import { DEMO_USER_ID } from "@/lib/constants";

// Add a request interceptor to inject the user ID
api.interceptors.request.use((config) => {
    config.headers["x-user-id"] = DEMO_USER_ID;
    return config;
});

// Add a response interceptor to handle errors globally if needed
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);
