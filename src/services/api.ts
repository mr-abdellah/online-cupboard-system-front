import { getToken } from "@/utils/token";
import axios from "axios";

const api = axios.create({
  // baseURL: "https://ged-back.mr-abdellah.com/api",
  // baseURL: "http://ged.local/api",
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  responseType: "json",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
