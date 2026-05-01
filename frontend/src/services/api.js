import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global stale session handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes("/auth/");

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }


);

export default api;