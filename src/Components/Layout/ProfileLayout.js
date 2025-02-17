import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../style/profllelayout.css"
import API from "../Api";
const ProfileLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = jwtDecode(token);
        const username = decodedToken.username;

        const response = await API.get(
          `/user/${username}`,
        );

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);




  return (
    <div className="profile-layout-container">
      {/* Left Section: Profile Data */}
      <div className="left-section">
        <h1>Profile</h1>
        <div className="profile-photo-upload">
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="profile-image"
          />
          </div>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

      </div>

      {/* Right Section: Dynamic Content */}
      <div className="right-section">{children}</div>
    </div>
  );
};

export default ProfileLayout;