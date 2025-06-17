import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Authentication error:", error.response.data);

        return Promise.reject({ ...error.response.data, status: 401 });
      }

      console.error("API Error:", error.response.data);
      return Promise.reject(error.response.data);
    }
    console.error("API Error:", error.message);
    return Promise.reject({ message: error.message || "Network error" });
  }
);

export default api;
