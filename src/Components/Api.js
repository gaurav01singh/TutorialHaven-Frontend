import axios from "axios";

const API = axios.create({
  baseURL: "https://tutorial-haven-backend.vercel.app/api",
  // baseURL:"http://localhost:5000/api"
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `${token}`;
  return req;
});

export default API;
