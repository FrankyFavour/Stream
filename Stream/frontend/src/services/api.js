import axios from "axios";
import { getAccessToken } from "./auth";
import { ANIME_API_URL } from "./config";

const api = axios.create({
    baseURL: ANIME_API_URL,
});

// Attach the current access token to anime API requests.
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
