import React, { useState, useEffect } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import "../../style/createtutorial.css";
import Gallery from "../Layout/Gallery";
import FloatingMessage from "../Layout/FloatingMessage";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

const TutorialCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [sections, setSections] = useState([{ title: "", content: "", subSections: [] }]);
  const [toggle, setToggle] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedSubSection, setSelectedSubSection] = useState(null);
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

  const handleSubSectionChange = (sectionIndex, subSectionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].subSections[subSectionIndex][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "", subSections: [] }]);
  };

  const deleteSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const addSubSection = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].subSections.push({ title: "", content: "" });
    setSections(newSections);
  };

  const deleteSubSection = (sectionIndex, subSectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].subSections.splice(subSectionIndex, 1);
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
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="section-group">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => handleSectionChange(sectionIndex, "title", e.target.value)}
                  required
                />
                <textarea
                  placeholder="Content"
                  value={section.content}
                  onChange={(e) => handleSectionChange(sectionIndex, "content", e.target.value)}
                  required
                />
                <button type="button" className="delete-btn" onClick={() => deleteSection(sectionIndex)}>
                  Delete Section
                </button>
                <button type="button" onClick={() => addSubSection(sectionIndex)}>Add Sub-section</button>

                {section.subSections.map((subSection, subSectionIndex) => (
                  <div key={subSectionIndex} className="subsection-group">
                    <input
                      type="text"
                      placeholder="Sub-section Title"
                      value={subSection.title}
                      onChange={(e) => handleSubSectionChange(sectionIndex, subSectionIndex, "title", e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Sub-section Content"
                      value={subSection.content}
                      onChange={(e) => handleSubSectionChange(sectionIndex, subSectionIndex, "content", e.target.value)}
                      required
                    />
                    <button type="button" className="delete-btn" onClick={() => deleteSubSection(sectionIndex, subSectionIndex)}>
                      Delete Sub-section
                    </button>
                  </div>
                ))}
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
                  <li key={index}>
                    <div className="section-title" onClick={() => setExpandedSection(expandedSection === index ? null : index)}>
                      {section.title} {section.subSections.length > 0 && (expandedSection === index ? "▲" : "▼")}
                    </div>

                    {/* Dropdown for Subsections */}
                    {expandedSection === index && section.subSections.length > 0 && (
                      <ul className="subsection-dropdown">
                        {section.subSections.map((subSection, subIndex) => (
                          <li
                            key={subIndex}
                            className={selectedSubSection === subIndex ? "active" : ""}
                            onClick={() => setSelectedSubSection(subIndex)}
                          >
                            {subSection.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="content markdown-body">
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {selectedSubSection !== null
                  ? sections[expandedSection]?.subSections[selectedSubSection]?.content || "Select a sub-section"
                  : sections[expandedSection]?.content || "Select a section"}
              </Markdown>
            </div>
          </div>
        )}
      </div>
      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>
    </div>
  );
};

export default TutorialCreate;
