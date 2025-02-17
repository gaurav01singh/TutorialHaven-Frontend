import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../../style/home.css"
import API from '../Api';

const ByCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [categoryRes, blogsRes] = await Promise.all([
          API.get(`/category/${id}`),
          API.get(`/category/blog/${id}`)
        ]);

        setCategoryName(categoryRes.data?.name || "Unknown Category");
        setBlogs(blogsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [id, navigate]);

  return (
    <div className="blog-container">
      <h1>Blogs in Category: {categoryName}</h1>
      {blogs.length > 0 ? (
        <ul>
          {blogs.map((blog) => (
            <li className="blog-item" key={blog._id}>
              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-small-description">{blog.description}</p>
              <button onClick={() => navigate(`/blog/${blog._id}`)}>Read More</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No blogs available in this category.</p>
      )}
    </div>
  );
};

export default ByCategory;
