import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/home.css";
import ProfileLayout from "./Layout/ProfileLayout";

const Home = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkToken();
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://tutorial-haven-backend.vercel.app/api/blog/all", {
        headers: {
          Authorization: token,
        },
      });
      setBlogs(response.data);
      console.log(blogs)
    } catch (error) {
      console.error("Error fetching blogs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Handle search term input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date input
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Filter blogs based on search term and date
  const filteredBlogs = blogs.filter((blog) => {
    const isDateMatch = selectedDate
      ? new Date(blog.createdAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
      : true; // Only filter by date if a date is selected
    const isSearchMatch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase());

    return isSearchMatch && isDateMatch;
  });

  return (
    <ProfileLayout>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Blogs..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-input"
        />
      </div>

      <div className="blog-container">
        {filteredBlogs.length > 0 ? (
          <ul>
            {filteredBlogs.map((blog) => (
              <li className="blog-item" key={blog._id}>
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-small-description">{blog.description}</p>
                <button onClick={() => navigate(`/blog/${blog._id}`)}>Read More</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No blogs found for your search.</p>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Home;
