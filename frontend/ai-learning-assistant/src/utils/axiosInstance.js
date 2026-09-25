import axios from "axios";
import { BASE_URL } from "./apiPaths.js";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Auth endpoints that should NOT trigger auto-logout on 401
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

// Request Interceptor
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
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const requestUrl = error.config?.url || '';
            const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => requestUrl.includes(ep));

            if (error.response.status === 401 && !isAuthEndpoint) {
                // Token expired/invalid on a protected route — auto-logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Rewrite error.message to be user-friendly before it reaches components
            const serverError = error.response.data?.error;
            if (serverError) {
                error.message = serverError;
            }

        } else if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. Please check your connection and try again.';
        } else if (!error.response) {
            error.message = 'Unable to connect to the server. Please check your internet connection.';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;