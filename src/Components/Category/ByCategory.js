import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../../style/home.css"

const ByCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the category ID from the URL
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogs([]); 
        const token = localStorage.getItem("token");
        const response = await axios.get(`https://tutorial-haven-backend.vercel.app/api/category/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        if (response.data.length === 0) {
            setBlogs([]); // Set blogs to empty array if no blogs are returned
          } else {
            setBlogs(response.data);
          }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    if (id) {
      fetchBlogs();
    }
  }, [id, navigate]); 

  return (
    <div className="blog-container ">
      <h1>Blogs in Category: {id}</h1>
      <div>
      <ul>
        {blogs.map((blog) => (
          <li className="blog-item" key={blog._id}>
            <h3 className="blog-title">{blog.title}</h3>
            <p className="blog-small-description">{blog.description}</p>
            <button onClick={() => navigate(`/blog/${blog._id}`)}>Read More</button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default ByCategory;
