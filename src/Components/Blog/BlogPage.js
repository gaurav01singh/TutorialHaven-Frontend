import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Markdown from "react-markdown";
import "../../style/blogpage.css"; // Import the CSS fil

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`https://tutorial-haven-backend.vercel.app/api/blog/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) return <div className="loading">Loading...</div>;

  return (
    <div className="github-editor">
      <h1>{blog.title}</h1>
      <div className="markdown-content">
        <Markdown>{blog.description}</Markdown>
      </div>
    </div>
  );
};

export default BlogPage;