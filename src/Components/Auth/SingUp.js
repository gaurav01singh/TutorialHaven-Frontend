import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../style/signup.css"
import API from "../Api";

const SignUp = ({ toggleAuth }) => {
  const [formData, setFormData] = useState({ username: "",email:"", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/user/register", formData);
      console.log(response)
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="signup-btn" type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <button className="toggle-btn" onClick={()=>{
          navigate("/login")
        }}>Login</button>
      </p>
    </div>
  );
};

export default SignUp;
