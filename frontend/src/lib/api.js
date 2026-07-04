import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Always send cookies for auth
export const api = axios.create({ baseURL: API, withCredentials: true });

// Attach Bearer token if present (backup to cookies)
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("auth_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Clear stale auth on 401 responses (except login/register endpoints)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/auth/login") &&
      !err.config?.url?.includes("/auth/register")
    ) {
      localStorage.removeItem("auth_token");
    }
    return Promise.reject(err);
  }
);
