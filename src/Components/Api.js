import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://tutorial-haven-backend.vercel.app/api"
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `${token}`;
  return req;
});

export default API;
