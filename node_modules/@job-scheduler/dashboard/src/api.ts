import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

export function setAuthToken(token: string) {
  localStorage.setItem("job-scheduler-token", token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  localStorage.removeItem("job-scheduler-token");
  delete api.defaults.headers.common.Authorization;
}

export function loadAuthToken() {
  const token = localStorage.getItem("job-scheduler-token");
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
}
