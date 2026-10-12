import axios from "axios";

const API = axios.create({
  baseURL: "https://tutorial-haven-backend.vercel.app/api/"
  // baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api"
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `${token}`;
  return req;
});

export default API;
