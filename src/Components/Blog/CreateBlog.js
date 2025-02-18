import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import Gallery from "../Layout/Gallery";
import "../../style/createblog.css";
import "../../style/gallery.css";
import FloatingMessage from "../Layout/FloatingMessage";
import API from "../Api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CreateBlog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [toggle, setToggle] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("/category/get-category");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, options } = e.target;
    if (name === "category") {
      const selectedCategories = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedCategories,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!formData.category.length) {
        throw new Error("Please select at least one category");
      }

      await API.post("/blog/create", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });

      setMessage("Blog created successfully!");
      setMessageType("success");
      navigate("/");
    } catch (error) {
      console.error("Blog creation error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create blog"
      );
      setMessage(error.response?.data?.message || "Failed to create blog");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    navigator.clipboard
      .writeText(imageUrl)
      .then(() => {
        setMessage("Image URL copied to clipboard!");
        setMessageType("success");
      })
      .catch((err) => {
        console.error("Failed to copy image URL:", err);
      });
  };

  return (
    <div className="create-blog-layout">
      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>
      <div className="create-blog-container">
        <button onClick={() => setToggle(!toggle)}>{toggle?("View Markdown"):("edit")}</button>
        {toggle ? (
          <div>
            <h1>Create a New Dossier</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreateBlog}>
              <input
                type="text"
                name="title"
                placeholder="Blog Title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <textarea
                name="description"
                placeholder="Blog Description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                multiple={true}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Blog"}
              </button>
            </form>
          </div>
        ) : (
          <div className="markdown-content">
            <Markdown remarkPlugins={[remarkGfm]}>
              {formData.description}
            </Markdown>
          </div>
        )}
        {message && (
          <FloatingMessage
            message={message}
            type={messageType}
            onClose={() => setMessage("")} // Close the message after 5 seconds
          />
        )}
      </div>
    </div>
  );
};

export default CreateBlog;
