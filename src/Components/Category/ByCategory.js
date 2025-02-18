import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../../style/home.css";
import API from '../Api';

const ByCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [categoryRes, tutorialRes] = await Promise.all([
          API.get(`/subcategory/${id}`),
          API.get(`/tutorial/subcategory/${id}`)
        ]);
        setCategoryName(categoryRes.data.name);
        setTutorials(tutorialRes.data);
        setFilteredTutorials(tutorialRes.data);
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

  // Search function to filter tutorials
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTutorials(tutorials);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = tutorials
        .map(tut => ({
          ...tut,
          matchScore: ((tut.title && tut.title.toLowerCase().includes(lowerQuery)) ? 2 : 0) +
                      ((tut.description && tut.description.toLowerCase().includes(lowerQuery)) ? 1 : 0)
        }))
        .filter(tut => tut.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
  
      setFilteredTutorials(filtered);
    }
  }, [searchQuery, tutorials]);
  

  return (
    <div className="blog-container">
      <h1>{categoryName}</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search tutorials..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {filteredTutorials.length > 0 ? (
        <ul>
          {filteredTutorials.map((tut) => (
            <li className="blog-item" key={tut._id}>
              <h3 className="blog-title">{tut.title}</h3>
              <p className="blog-small-description">{tut.description}</p>
              <button onClick={() => navigate(`/tutorial/${tut._id}`)}>Read More</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tutorials found.</p>
      )}
    </div>
  );
};

export default ByCategory;
