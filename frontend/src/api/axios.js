import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only force logout on a 401 from the login endpoint itself.
    // Never auto-logout on other 401s — that destroys the session
    // when a downstream service has transient issues.
    const url = err.config?.url || "";
    const isLoginCall = url.endsWith("/auth/login");
    
    if (err.response?.status === 401 && isLoginCall) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default api;