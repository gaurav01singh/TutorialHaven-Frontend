import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../style/gallery.css";
import API from "../Api";

const Gallery = ({ onImageClick }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files);
    setError("");
  };

  useEffect(() => {
    document.title = "Tutorial Haven | Gallery";
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = jwtDecode(token);
        const response = await API.get(
          `/user/${decodedToken.username}`,
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
    if (!file.length) {
      setError("Please select at least one image");
      return;
    }
  
    setUploading(true);
    setError("");
  
    try {
      const imageBase64Array = await Promise.all(
        [...file].map((image) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
          });
        })
      );
  
      const uploadResponse = await API.post("/user/upload-image", {
        images: imageBase64Array, // Sending an array
      });
  
      if (onImageClick) {
        uploadResponse.data.images.forEach((imgUrl) => onImageClick(imgUrl));
      }
  
      setUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload images");
      setUploading(false);
    }
  };
  

  const handleDelete = async (imageUrl) => {
    try {
      // Send request to delete image
      const deleteResponse = await API.delete(
        `/user/delete-image/${encodeURIComponent(imageUrl)}`,
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
        <input type="file" accept="image/*" multiple onChange={handleFileChange} id="file-upload" className="file-input" />
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
