import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Change according to your backend
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `${token}`;
  return req;
});

export default API;
