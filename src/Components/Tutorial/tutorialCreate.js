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
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    templateImg: "",
    sections: [{ title: "", content: "", subSections: [] }]
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [toggle, setToggle] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedSubSection, setSelectedSubSection] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoryRes, subcategoryRes] = await Promise.all([
          API.get("/category/get-category"),
          API.get("/subCategory")
        ]);
        setCategories(categoryRes.data);
        setSubcategories(subcategoryRes.data);
        
      } catch (error) {
        setMessage("Error fetching categories");
        setMessageType("error");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubSectionChange = (sectionIndex, subSectionIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].subSections[subSectionIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: "", content: "", subSections: [] }]
    });
    
  };

  const deleteSection = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const addSubSection = (sectionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].subSections.push({ title: "", content: "" });
    setFormData({ ...formData, sections: newSections });
  };

  const deleteSubSection = (sectionIndex, subSectionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].subSections.splice(subSectionIndex, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const handleImageClick = (imageUrl) => {
    navigator.clipboard
      .writeText(imageUrl)
      .then(() => {
        setMessage("Image URL copied to clipboard!");
        setMessageType("success");
      })
      .catch((err) => {
        console.error("Failed to copy image URL:", err);
      });
    setMessage("Image selected as template!");
    setMessageType("success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/tutorial/create", {
        ...formData,
      
      });
      setMessage("Tutorial created successfully!");
      setMessageType("success");
      setTimeout(() => navigate("/tutorial"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating tutorial");
      setMessageType("error");
    }
  };
  
  return (
    <div className="tutorial-create-layout">
      <div className="tutorial-create-container">
        <h1>Create Tutorial</h1>
        <button onClick={() => setToggle(!toggle)} className="toggle-btn">
          {toggle ? "Preview" : "Edit"}
        </button>

        {toggle ? (
          <form onSubmit={handleSubmit} className="tutorial-form">
            <div className="form-group">
              <label>Title:</label>
              <input 
                name="title"
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subcategory:</label>
              <select 
                name="subcategory"
                value={formData.subcategory} 
                onChange={handleChange}
              >
                <option value="">Select Subcategory</option>
                {subcategories
                  .filter(sub => sub.category?._id === formData.category)
                  .map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Template Image URL:</label>
              <input name="templateImg" value={formData.templateImg} onChange={handleChange} placeholder="Enter image URL" />
            </div>

            <div className="sections-container">
              <h3>Sections:</h3>
              {formData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="section-group">
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={section.title}
                    onChange={(e) => handleSectionChange(sectionIndex, "title", e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Content (Markdown supported)"
                    value={section.content}
                    onChange={(e) => handleSectionChange(sectionIndex, "content", e.target.value)}
                    required
                  />
                  <div className="button-group">
                    <button 
                      type="button" 
                      className="delete-btn"
                      onClick={() => deleteSection(sectionIndex)}
                    >
                      Delete Section
                    </button>
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={() => addSubSection(sectionIndex)}
                    >
                      Add Sub-section
                    </button>
                  </div>

                  {section.subSections.map((subSection, subSectionIndex) => (
                    <div key={subSectionIndex} className="subsection-group">
                      <input
                        type="text"
                        placeholder="Sub-section Title"
                        value={subSection.title}
                        onChange={(e) => 
                          handleSubSectionChange(sectionIndex, subSectionIndex, "title", e.target.value)
                        }
                        required
                      />
                      <textarea
                        placeholder="Sub-section Content (Markdown supported)"
                        value={subSection.content}
                        onChange={(e) => 
                          handleSubSectionChange(sectionIndex, subSectionIndex, "content", e.target.value)
                        }
                        required
                      />
                      <button 
                        type="button" 
                        className="delete-btn"
                        onClick={() => deleteSubSection(sectionIndex, subSectionIndex)}
                      >
                        Delete Sub-section
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              <div className="form-actions">
                <button type="button" onClick={addSection} className="add-btn">
                  Add Section
                </button>
                <button type="submit" className="submit-btn">
                  Create Tutorial
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="preview-container">
            <div className="sidebar">
              <h1>{formData.title}</h1>
              <ul>
                {formData.sections.map((section, index) => (
                  <li key={index}>
                    <div 
                      className="section-title" 
                      onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                    >
                      {section.title} 
                      {section.subSections.length > 0 && (
                        <span className="dropdown-arrow">
                          {expandedSection === index ? "▲" : "▼"}
                        </span>
                      )}
                    </div>

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
              <Markdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {selectedSubSection !== null
                  ? formData.sections[expandedSection]?.subSections[selectedSubSection]?.content 
                  : formData.sections[expandedSection]?.content || "Select a section"}
              </Markdown>
            </div>
          </div>
        )}
      </div>

      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>

      {message && (
        <FloatingMessage 
          message={message} 
          type={messageType} 
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default TutorialCreate;