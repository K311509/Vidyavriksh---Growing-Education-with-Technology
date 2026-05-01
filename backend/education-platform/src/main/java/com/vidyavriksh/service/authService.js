import axios from "axios";

const API = "http://localhost:8080/api/auth";

export const login = async (data) => {
  const res = await axios.post("http://localhost:8080/api/auth/login", data);

  console.log("LOGIN RESPONSE:", res.data); // 👈 THIS is correct debugging

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  localStorage.setItem("userId", res.data.id);

  return res.data;
};

export const register = async (data) => {
  return await axios.post(`${API}/register`, data);
};