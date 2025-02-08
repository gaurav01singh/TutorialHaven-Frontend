import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import
import "../../style/profile.css";
import FloatingMessage from "../Layout/FloatingMessage";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");
  const [newProfilePhoto, setNewProfilePhoto] = useState("");
  const [editData, setEditData] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    instagram: "",
    github: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch user data on component mount
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

        const response = await axios.get(
          `https://tutorial-haven-backend.vercel.app/api/user/${username}`,
          { headers: { Authorization: token } }
        );

        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setBio(userData.bio)
          setSocialLinks(userData.socialLinks)
          fetchUserBlogs(userData.id);
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUserBlogs = async (userId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://tutorial-haven-backend.vercel.app/api/blog/user/${userId}`,
          { headers: { Authorization: token } }
        );

        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching user blogs:", error);
        setBlogs([]);
      }
    };

    fetchUserData();
  }, [editData]);

  const handleEdit = async (blogId) => {
    navigate(`/blog/edit/${blogId}`);
  };

  const handleDelete = async (blogId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://tutorial-haven-backend.vercel.app/api/blog/delete/${blogId}`, {
          headers: { Authorization: token },
        });
        setMessage("Blog deleted successfully!");
        setMessageType("success");
        setBlogs(blogs.filter((blog) => blog._id !== blogId));
      } catch (error) {
        console.error("Error deleting blog:", error);
        setMessage("Failed to delete blog.");
        setMessageType("error");
      }
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const username = decodedToken.username;

      // Prepare the update data
      const updateData = {};
      if (newEmail) updateData.email = newEmail;
      if (bio) updateData.bio = bio;
      if (newPassword === conformPassword) {
        updateData.password = newPassword;
      } else {
        setMessage("New Password and conform password must be same");
        setMessageType("error");
        return;
      }
      if (newProfilePhoto) updateData.profilePhoto = newProfilePhoto;
      // Only update social links if they're provided
      if (socialLinks.linkedin || socialLinks.instagram || socialLinks.github) {
        updateData.socialLinks = socialLinks;
      }
      console.log(Object.keys(updateData).length !== 0);
      if (Object.keys(updateData).length !== 0) {
        const response = await axios.put(
          `https://tutorial-haven-backend.vercel.app/api/user/update/${username}`,
          updateData,
          { headers: { Authorization: token } }
        );

        setMessage("Profile updated successfully!");
        setMessageType("success");
        
        setNewPassword("");
        setConformPassword(""); 
        

        // Update user state directly
        setUser((prevUser) => ({
          ...prevUser,
          email: newEmail || prevUser.email,
          bio: bio || prevUser.bio,
          profilePhoto: newProfilePhoto || prevUser.profilePhoto,
          socialLinks: {
            ...prevUser.socialLinks,
            ...socialLinks,
          },
        }));
      } else {
        setMessage("No changes to update.");
        setMessageType("warning");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
      setMessageType("error");
    }
  };

  // Handle image upload and conversion to base64
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("token");

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Update profile with the new image
        try {
          const response = await axios.put(
            `https://tutorial-haven-backend.vercel.app/api/user/update/${user.username}`,
            { profilePhoto: base64Image },
            { headers: { Authorization: token } }
          );

          setUser((prev) => ({
            ...prev,
            profilePhoto: response.data.user.profilePhoto,
          }));
          setMessage("Profile photo updated!");
          setMessageType("success");
        } catch (error) {
          console.error("Upload error:", error);
          setMessage("Failed to update profile photo");
          setMessageType("error");
        }
      };
    } catch (error) {
      console.error("File reading error:", error);
      setMessage("Failed to read file");
      setMessageType("error");
    }
  };

  return (
    <div className="profile-container">
      {/* Left Section: User Data */}
      <div className="user-section">
        <h1>{user.username}</h1>
        <div className="profile-photo-upload">
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="profile-image"
          />
          <label htmlFor="file-upload" className="upload-button">
            Change Photo
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <button onClick={() => setEditData(!editData)}>Edit Data</button>

        {editData ? (
          <>
            <h2>Update Profile</h2>
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Conform Password"
              value={conformPassword}
              onChange={(e) => setConformPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              type="text"
              placeholder="LinkedIn Link"
              value={socialLinks.linkedin}
              onChange={(e) =>
                setSocialLinks((prev) => ({
                  ...prev,
                  linkedin: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Instagram Link"
              value={socialLinks.instagram}
              onChange={(e) =>
                setSocialLinks((prev) => ({
                  ...prev,
                  instagram: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="GitHub Link"
              value={socialLinks.github}
              onChange={(e) =>
                setSocialLinks((prev) => ({
                  ...prev,
                  github: e.target.value,
                }))
              }
            />
            <button onClick={handleUpdate}>Update</button>
          </>
        ) : (
          <>
            <p>
              <strong>bio:</strong> {user.bio}
            </p>
            {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
              <>
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/?size=100&id=13930&format=png&color=000000"
                      alt="LinkedIn"
                      style={{ width: "50px", marginRight: "10px" }}
                    />
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/?size=100&id=32323&format=png&color=000000"
                      alt="Instagram"
                      style={{ width: "50px", marginRight: "10px" }}
                    />
                  </a>
                )}
                {user.socialLinks.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/?size=100&id=AZOZNnY73haj&format=png&color=000000"
                      alt="GitHub"
                      style={{ width: "50px", marginRight: "10px" }}
                    />
                  </a>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Right Section: Blog Functions */}
      <div className="blog-section">
        <button
          className="create-button"
          onClick={() => navigate("/blog/create")}
        >
          + Create Dossier
        </button>
        <button
          className="create-button"
          onClick={() => navigate("/category")}
        >
          + Create Category
        </button>

        <h2>Your Dossier</h2>
        {blogs.length > 0 ? (
          <ul className="blog-items">
            {blogs.map((blog) => (
              <li className="blog-item" key={blog._id}>
                <div className="blog-handle">
                  <h3 onClick={() => navigate(`/blog/${blog._id}`)}>
                    {blog.title}
                  </h3>
                  <div className="btns">
                    <button
                      className="edit"
                      onClick={() => handleEdit(blog._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(blog._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p>{blog.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No blogs found for this user.</p>
        )}
      </div>

      {message && (
        <FloatingMessage
          message={message}
          type={messageType}
          onClose={() => setMessage("")} // Close the message after 5 seconds
        />
      )}
    </div>
  );
};

export default Profile;
