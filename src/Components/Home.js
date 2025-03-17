import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/home.css";
import API from "./Api";
import Markdown from "react-markdown";

const Home = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, [navigate]); 

  const fetchBlogs = async () => {
    try {
      const response = await API.get("/tutorial/all");
      setTutorials(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // navigate("/login");
      }
    }
  };

  // Debounce search input to prevent excessive filtering
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Filter blogs based on search term and date
  const filteredTutorials = tutorials.filter((tutorial) => {
    const isDateMatch = selectedDate
      ? new Date(tutorial.createdAt).toLocaleDateString() ===
        new Date(selectedDate).toLocaleDateString()
      : true;
    const isSearchMatch =
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())

    return isSearchMatch && isDateMatch;
  });

  return (
    <>
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

      <div className="tutorial-container">
        {filteredTutorials.length > 0 ? (
          <ul className="tutorial-items">
                  {filteredTutorials.map((tutorial) => (
                    <li key={tutorial._id} className="tutorial-item">
                      
                      <div className="tutorial-card" onClick={() => navigate(`/tutorial/${tutorial.title}`)}>
                      <img className="tamplateImg" src={tutorial.templateImg}/>
                        <Markdown>{tutorial.title}</Markdown>
                      </div>
                      {/* {isAdmin==="Admin" && (
                        <div className="admin-actions">
                          <button onClick={() => navigate(`/tutorial/edit/${tutorial.title}`)} className="edit-btn">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(tutorial._id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      )} */}
                    </li>
                  ))}
                </ul>
        ) : (
          <p>No Tutorials found for your search.</p>
        )}
      </div>
    
        </>
  );
};

export default Home;