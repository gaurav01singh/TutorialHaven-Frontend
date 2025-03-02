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
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [templateImg, setTemplateImg] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([
    { title: "", content: "", subSections: [] },
  ]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedSubSection, setExpandedSubSection] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and subcategories first
        const [categoryRes, subcategoryRes] = await Promise.all([
          API.get("/category/get-category"),
          API.get("/subcategory"),
        ]);
        setCategories(categoryRes.data);
        setSubcategories(subcategoryRes.data);

        // Now fetch the tutorial
        const tutorialRes = await API.get(`/tutorial/${id}`);
        const { title, category, subcategory, sections, templateImg } =
          tutorialRes.data;
        setTitle(title);
        setCategory(category?._id || "");
        setSubcategory(subcategory?._id || "");
        setTemplateImg(templateImg || "");
        setSections(sections);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to fetch tutorial data. Please try again.");
        setMessageType("error");
      }
    };

    fetchData();
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
    setIsSubmitting(true);
    try {
      await API.put(`/tutorial/update/${id}`, {
        title,
        category,
        subcategory,
        templateImg,
        sections,
      });
      setMessage("Tutorial updated successfully!");
      setMessageType("success");
      
    } catch (error) {
      console.error("Error updating tutorial:", error);
      setMessage("Failed to update tutorial. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setTemplateImg(imageUrl);
    navigator.clipboard
      .writeText(imageUrl)
      .then(() => {
        setMessage("Image URL copied to clipboard!");
        setMessageType("success");
      })
      .catch((err) => {
        console.error("Failed to copy image URL:", err);
        setMessage("Failed to copy URL");
        setMessageType("error");
      });
  };

  // Markdown components configuration
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          children={String(children).replace(/\n$/, "")}
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="tutorial-edit-layout">
      <div className="tutorial-edit-container">
        <h1>Edit Tutorial</h1>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label>Subcategory:</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
          >
            <option value="">Select Subcategory</option>
            {subcategories
  .filter((sub) => sub.category && sub.category._id === category)
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
              <div
                className="section-header"
                onClick={() =>
                  setExpandedSection(expandedSection === index ? null : index)
                }
              >
                <span>{section.title || "Untitled Section"}</span>
                <span>{expandedSection === index ? "▲" : "▼"}</span>
              </div>

              {expandedSection === index && (
                <>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={section.title}
                    onChange={(e) =>
                      handleSectionChange(index, "title", e.target.value)
                    }
                    required
                  />
                  <textarea
                    placeholder="Section Content"
                    value={section.content}
                    onChange={(e) =>
                      handleSectionChange(index, "content", e.target.value)
                    }
                    required
                  />
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    className="markdown-body"
                    components={markdownComponents}
                  >
                    {section.content}
                  </Markdown>

                  <button type="button" onClick={() => addSubSection(index)}>
                    ➕ Add Sub-section
                  </button>

                  {section.subSections.map((subSection, subIndex) => (
                    <div key={`${index}-${subIndex}`} className="subsection-group">
                      <div
                        className="section-header"
                        onClick={() =>
                          setExpandedSubSection(
                            expandedSubSection === `${index}-${subIndex}`
                              ? null
                              : `${index}-${subIndex}`
                          )
                        }
                      >
                        <span>{subSection.title || "Untitled Sub-section"}</span>
                        <span>
                          {expandedSubSection === `${index}-${subIndex}` ? "▲" : "▼"}
                        </span>
                      </div>
                      {expandedSubSection === `${index}-${subIndex}` && (
                        <>
                          <input
                            type="text"
                            placeholder="Sub-section Title"
                            value={subSection.title}
                            onChange={(e) =>
                              handleSubSectionChange(
                                index,
                                subIndex,
                                "title",
                                e.target.value
                              )
                            }
                            required
                          />
                          <textarea
                            placeholder="Sub-section Content"
                            value={subSection.content}
                            onChange={(e) =>
                              handleSubSectionChange(
                                index,
                                subIndex,
                                "content",
                                e.target.value
                              )
                            }
                            required
                          />
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            className="markdown-body"
                            components={markdownComponents}
                          >
                            {subSection.content}
                          </Markdown>
                        </>
                      )}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteSubSection(index, subIndex)}
                      >
                        ❌ Delete Sub-section
                      </button>
                    </div>
                  ))}

                  {sections.length > 1 && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteSection(index)}
                    >
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Tutorial"}
          </button>
        </form>
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

export default EditTutorial;