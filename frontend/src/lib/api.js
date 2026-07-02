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
