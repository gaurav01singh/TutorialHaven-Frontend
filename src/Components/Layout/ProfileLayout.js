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

<<<<<<< HEAD
=======
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://tutorial-haven-backend.vercel.app/api/user/update",
        { username: newUsername, password: newPassword },
        { headers: { Authorization: token } }
      );
      alert("Profile Updated Successfully!");
      setNewUsername("");
      setNewPassword("");
    } catch (error) {
      console.error("Error Updating Profile:", error);
    }
  };

>>>>>>> bfe50c5b31611e820b95bb8d2c38f02267fb67ab
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