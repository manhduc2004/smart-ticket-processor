import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ── axios instance chính ────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // gửi HttpOnly cookie
});

// ── in-memory access token ──────────────────────────────────────────
let _accessToken: string | null = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

// ── Request Interceptor ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor (auto-refresh) ─────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: AxiosError | null, token: string | null = null) {
  pendingQueue.forEach((item) => {
        if (error) {
            item.reject(error);
        } else if (token) {
            item.resolve(token);
        }
    });
  pendingQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        
        if (originalRequest.url?.includes('/auth/refresh')) {
            setAccessToken(null);
            window.location.href = '/login';
            return Promise.reject(error);
        }
        if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
            );

            const newToken = data.access_token;
            setAccessToken(newToken);
            flushQueue(null, newToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            flushQueue(refreshError as AxiosError, null);
            setAccessToken(null);
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
  }
);

export default api;