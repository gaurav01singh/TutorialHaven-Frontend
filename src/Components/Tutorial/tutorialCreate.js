import React, { useState, useEffect } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import "../../style/createtutorial.css";
import Gallery from "../Layout/Gallery";
import FloatingMessage from "../Layout/FloatingMessage";

const TutorialCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [sections, setSections] = useState([{ title: "", content: "" }]);
  const [toggle, setToggle] = useState(true);
  const [selectedSection, setSelectedSection] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await API.get("/subcategory");
        setSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "" }]);
  };

  const deleteSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tutorial/create", { title, subcategory, sections });
      navigate("/");
    } catch (error) {
      console.error("Error creating tutorial:", error);
    }
  };

  const handleImageClick = (imageUrl) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      setMessage("Image URL copied to clipboard!");
      setMessageType("success");
    }).catch(err => {
      console.error("Failed to copy image URL:", err);
    });
  };

  return (
    <div className="tutorial-create-layout">
      <div className="tutorial-create-container">
        <h1>Create Tutorial</h1>
        <button onClick={() => setToggle(!toggle)}>
          {toggle ? "Preview" : "Edit"}
        </button>

        {toggle ? (
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
                <button type="button" className="delete-btn" onClick={() => deleteSection(index)}>
                  Delete Section
                </button>
              </div>
            ))}

            <button type="button" onClick={addSection}>Add Section</button>
            <button type="submit">Create Tutorial</button>
          </form>
        ) : (
          <div className="preview-container">
            <div className="sidebar">
              <h1>{title}</h1>
              <ul>
                {sections.map((section, index) => (
                  <li
                    key={index}
                    className={selectedSection === index ? "active" : ""}
                    onClick={() => setSelectedSection(index)}
                  >
                    <Markdown>{section.title}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
            <div className="content markdown-body">
              <Markdown>{sections[selectedSection]?.content || "Select a section to preview"}</Markdown>
            </div>
          </div>
        )}
        {message && (
          <FloatingMessage
            message={message}
            type={messageType}
            onClose={() => setMessage("")}
          />
        )}
      </div>

      {/* Gallery Section (Now on the Right Side) */}
      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>
    </div>
  );
};

export default TutorialCreate;
