import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  // Sends the httpOnly sb-access-token & sb-refresh-token cookies automatically.
  // JS never has access to these values — fully XSS-hardened.
  withCredentials: true,
});

// No request interceptor needed: the browser attaches httpOnly cookies by itself.

// Response interceptor — propagate errors so callers handle them.
// AuthGuard is responsible for redirecting on session expiry.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default apiClient;
