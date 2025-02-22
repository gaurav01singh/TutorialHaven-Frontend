import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Api";
import Markdown from "react-markdown";
import "../../style/tutorialedit.css";
import Gallery from "../Layout/Gallery";
import FloatingMessage from "../Layout/FloatingMessage";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

const EditTutorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(""); // Added category state
  const [subcategory, setSubcategory] = useState("");
  const [templateImg, setTemplateImg] = useState(""); // Added templateImg state
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]); // Added categories state
  const [sections, setSections] = useState([{ title: "", content: "", subSections: [] }]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await API.get(`/tutorial/${id}`);
        const { title, category, subcategory, sections, templateImg } = response.data;
        setTitle(title);
        setCategory(category?._id || ""); // Populate category if it exists
        setSubcategory(subcategory?._id || "");
        setTemplateImg(templateImg || ""); // Populate templateImg if it exists
        setSections(sections);
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };

    const fetchCategoriesAndSubcategories = async () => {
      try {
        const [categoryRes, subcategoryRes] = await Promise.all([
          API.get("/category/get-category"),
          API.get("/subcategory"),
        ]);
        setCategories(categoryRes.data);
        setSubcategories(subcategoryRes.data);
      } catch (error) {
        console.error("Error fetching categories/subcategories:", error);
      }
    };

    fetchTutorial();
    fetchCategoriesAndSubcategories();
  }, [id]);

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
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
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
      await API.put(`/tutorial/update/${id}`, { title, category, subcategory, templateImg, sections });
      
    } catch (error) {
      console.error("Error updating tutorial:", error);
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
    <div className="tutorial-edit-layout">
      <div className="tutorial-edit-container">
        <h1>Edit Tutorial</h1>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label>Subcategory:</label>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required>
            <option value="">Select Subcategory</option>
            {subcategories
              .filter((sub) => sub.category._id === category)
              .map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
          </select>

          <label>Template Image URL:</label>
          <input
            value={templateImg}
            onChange={(e) => setTemplateImg(e.target.value)}
            placeholder="Enter image URL"
          />

          <h3>Sections:</h3>
          {sections.map((section, index) => (
            <div key={index} className="section-group">
              <div className="section-header" onClick={() => setExpandedSection(expandedSection === index ? null : index)}>
                <span>{section.title || "Untitled Section"}</span>
                <span>{expandedSection === index ? "▲" : "▼"}</span>
              </div>

              {expandedSection === index && (
                <>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Section Content"
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                    required
                  />
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className="markdown-body">
                    {section.content}
                  </Markdown>

                  <button type="button" onClick={() => addSubSection(index)}>➕ Add Sub-section</button>

                  {section.subSections.map((subSection, subIndex) => (
                    <div key={subIndex} className="subsection-group">
                      <input
                        type="text"
                        placeholder="Sub-section Title"
                        value={subSection.title}
                        onChange={(e) => handleSubSectionChange(index, subIndex, "title", e.target.value)}
                        required
                      />
                      <textarea
                        placeholder="Sub-section Content"
                        value={subSection.content}
                        onChange={(e) => handleSubSectionChange(index, subIndex, "content", e.target.value)}
                        required
                      />
                      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className="markdown-body">
                        {subSection.content}
                      </Markdown>

                      <button type="button" className="delete-btn" onClick={() => deleteSubSection(index, subIndex)}>
                        ❌ Delete Sub-section
                      </button>
                    </div>
                  ))}

                  {sections.length > 1 && (
                    <button type="button" className="delete-btn" onClick={() => deleteSection(index)}>
                      ❌ Delete Section
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          <button type="button" className="add-section" onClick={addSection}>
            ➕ Add Section
          </button>

          <button type="submit">Update Tutorial</button>
        </form>
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <Gallery onImageClick={handleImageClick} />
      </div>

      {/* Floating Message */}
      {message && (
        <FloatingMessage message={message} type={messageType} onClose={() => setMessage("")} />
      )}
    </div>
  );
};

export default EditTutorial;