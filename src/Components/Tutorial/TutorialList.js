import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";
import "../../style/tutoriallist.css";
import Markdown from "react-markdown";

const TutorialList = () => {
  const [tutorials, setTutorials] = useState([]);
  const [isAdmin, setIsAdmin] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await API.get("/tutorial/all");
        setTutorials(response.data);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      }
    };

    const checkAdmin = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log(payload) // Decode JWT payload
          setIsAdmin(payload.role);
        } catch (error) {
          console.error("Invalid token:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAdmin();
    fetchTutorials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tutorial?")) {
      try {
        await API.delete(`/tutorial/delete/${id}`);
        setTutorials(tutorials.filter((tutorial) => tutorial._id !== id));
      } catch (error) {
        console.error("Error deleting tutorial:", error);
      }
    }
  };

  return (
    <div className="tutorial-list-container">
      <h1>All Tutorials</h1>
      {isAdmin==="Admin" && (
              <div className="admin-actions">
                <button onClick={() => navigate("/tutorial/create")} className="create-btn">
                  Create Tutorial
                </button>
              </div>
            )}
      <ul>
        {tutorials.map((tutorial) => (
          <li key={tutorial._id} className="tutorial-item">
            
            <div onClick={() => navigate(`/tutorial/${tutorial._id}`)}>
            <img src={tutorial.templateImg}/>
              <Markdown>{tutorial.title}</Markdown>
            </div>
            {isAdmin==="Admin" && (
              <div className="admin-actions">
                <button onClick={() => navigate(`/tutorial/edit/${tutorial._id}`)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(tutorial._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutorialList;
