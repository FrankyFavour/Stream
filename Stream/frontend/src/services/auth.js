import axios from "axios";
import { AUTH_API_URL } from "./config";

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const authApi = axios.create({
    baseURL: AUTH_API_URL,
    withCredentials: true,
});

// Read a cookie that JavaScript is allowed to access.
function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();

        if (trimmedCookie.startsWith(`${name}=`)) {
            return decodeURIComponent(
                trimmedCookie.substring(name.length + 1)
            );
        }
    }

    return null;
}

// Get the CSRF cookie from Django when necessary.
async function ensureCsrfToken() {
    let csrfToken = getCookie("csrftoken");

    if (!csrfToken) {
        await axios.get(`${AUTH_API_URL}csrf/`, {
            withCredentials: true,
        });

        csrfToken = getCookie("csrftoken");
    }

    if (!csrfToken) {
        throw new Error(
            "CSRF token is missing. Check your Django CSRF settings."
        );
    }

    return csrfToken;
}

// Attach the access token and CSRF token when needed.
authApi.interceptors.request.use(async (config) => {
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    const needsCsrf =
        method === "post" &&
        (url.includes("token/refresh/") ||
            url.includes("logout/"));

    if (needsCsrf) {
        const csrfToken = await ensureCsrfToken();

        config.headers = config.headers || {};
        config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
});

// Refresh an expired access token and retry the original request.
authApi.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("login/") ||
            originalRequest.url?.includes("token/refresh/") ||
            originalRequest.url?.includes("register/") ||
            originalRequest.url?.includes("logout/")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = authApi
                    .post("token/refresh/", {})
                    .then((response) => {
                        const newAccessToken = response.data.access;

                        setAccessToken(newAccessToken);

                        return newAccessToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return authApi(originalRequest);
        } catch (refreshError) {
            setAccessToken(null);

            return Promise.reject(refreshError);
        }
    }
);

export default authApi;
