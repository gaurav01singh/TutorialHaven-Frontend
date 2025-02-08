import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../style/gallery.css";

const Gallery = ({ onImageClick }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = jwtDecode(token);
        const response = await axios.get(
          `https://tutorial-haven-backend.vercel.app/api/user/${decodedToken.username}`,
          { headers: { Authorization: token } }
        );

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
    };

    fetchUserData();
  }, [handleFileChange]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64Image = reader.result;
        const token = localStorage.getItem("token");

        const uploadResponse = await axios.post(
          "https://tutorial-haven-backend.vercel.app/api/user/upload-image",
          { image: base64Image },
          { headers: { Authorization: token } }
        );

        if (onImageClick) onImageClick(uploadResponse.data.imageUrl);
        setUploading(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload image");
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl) => {
    try {
      const token = localStorage.getItem("token");
      // Send request to delete image
      const deleteResponse = await axios.delete(
        `https://tutorial-haven-backend.vercel.app/api/user/delete-image/${encodeURIComponent(imageUrl)}`,
        { headers: { Authorization: token } }
      );

      if (deleteResponse.data.success) {
        // Remove the deleted image from the state
        setUser((prevUser) => ({
          ...prevUser,
          images: prevUser.images.filter((image) => image !== imageUrl),
        }));
      } else {
        setError("Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.response?.data?.message || "Failed to delete image");
    }
  };

  return (
    <div className="gallery-container">
      <h3>Your Uploaded Images</h3>
      {error && <div className="error-message">{error}</div>}

      <div className="image-grid">
        {user?.images?.map((image, index) => (
          <div key={index} className="image-item" onClick={() => onImageClick(image)}>
            <img src={image} alt={`Uploaded ${index + 1}`} className="gallery-image" />
            <button className="delete-img" onClick={() => handleDelete(image)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" className="file-input" />
        <label htmlFor="file-upload" className="upload-label">Choose File</label>
        <button onClick={handleUpload} disabled={uploading || !file} className="upload-button">
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {!user?.images?.length && <p className="empty-state">No images uploaded yet</p>}
    </div>
  );
};

export default Gallery;
