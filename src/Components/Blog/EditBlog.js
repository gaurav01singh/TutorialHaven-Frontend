import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import "../../style/editblog.css";
import FloatingMessage from "../Layout/FloatingMessage";
import Gallery from "../Layout/Gallery";
import Markdown from "react-markdown";
import API from "../Api";
import remarkGfm from "remark-gfm";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toggle, setToggle] = useState(true); // Fixed typo here

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await API.get(
          `/blog/${id}`,
        );
        setTitle(response.data.title);
        setDescription(response.data.description);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(
        `/blog/update/${id}`,
        { title, description },
      );
      setMessage("Blog updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating blog:", error);
      setMessage("Failed to update blog.");
      setMessageType("error");
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
    <div className="edit-blog-layout">
      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>
      <div className="edit-blog-container">
      <button onClick={() => setToggle(!toggle)}>{toggle?("View Markdown"):("edit")}</button>
        {toggle ? (
          <div>
            <h1>Edit Blog</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Blog Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <button type="submit">Update Dossier</button>
            </form>
            
          </div>
        ) : (
          <div className="markdown-content">
            <Markdown remarkPlugins={[remarkGfm]}>{description}</Markdown>
          </div>
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

export default EditBlog;
