import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../../style/home.css"
import API from '../Api';

const ByCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tutorials, setTutorials] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // const response = await API.get(`/tutorial/subcategory/${id}`)
        const [categoryRes, tutorialRes] = await Promise.all([
          API.get(`/subcategory/${id}`),
          API.get(`/tutorial/subcategory/${id}`)
        ]);
        setCategoryName(categoryRes.data.name)
        setTutorials(tutorialRes.data)
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
      <h1>{categoryName}</h1>
      {tutorials.length > 0 ? (
        <ul>
          {tutorials.map((tut) => (
            <li className="blog-item" key={tut._id}>
              <h3 className="blog-title">{tut.title}</h3>
              <p className="blog-small-description">{tut.description}</p>
              <button onClick={() => navigate(`/tutorial/${tut._id}`)}>Read More</button>
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
