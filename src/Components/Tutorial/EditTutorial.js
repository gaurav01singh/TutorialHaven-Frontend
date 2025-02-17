import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Api";
import Markdown from "react-markdown";

const EditTutorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [sections, setSections] = useState([{ title: "", content: "" }]);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await API.get(`/tutorial/${id}`);
        const { title, subcategory, sections } = response.data;
        setTitle(title);
        setSubcategory(subcategory);
        setSections(sections);
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const response = await API.get("/subcategory");
        setSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchTutorial();
    fetchSubcategories();
  }, [id]);

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/tutorial/update/${id}`, { title, subcategory, sections });
      navigate(`/tutorial/${id}`);
    } catch (error) {
      console.error("Error updating tutorial:", error);
    }
  };

  return (
    <div className="tutorial-edit-container">
      <h1>Edit Tutorial</h1>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Subcategory:</label>
        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required>
          <option value="">Select Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        <h3>Sections:</h3>
        {sections.map((section, index) => (
          <div key={index} className="section-group">
            <input
              type="text"
              placeholder="Section Title"
              value={section.title}
              onChange={(e) => handleSectionChange(index, "title", e.target.value)}
              required
            />
            <textarea
              placeholder="Content"
              value={section.content}
              onChange={(e) => handleSectionChange(index, "content", e.target.value)}
              required
            />
            <Markdown>{section.content}</Markdown>
          </div>
        ))}

        <button type="button" onClick={addSection}>Add Section</button>
        <button type="submit">Update Tutorial</button>
      </form>
    </div>
  );
};

export default EditTutorial;
