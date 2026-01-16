import axios from "axios";

const isProd = false;

const API_BASE_URL = isProd
  ? "https://latik-be.vercel.app"   // PROD
  : "http://localhost:3001";       // LOCAL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
