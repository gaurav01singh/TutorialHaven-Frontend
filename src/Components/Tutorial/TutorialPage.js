import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../Api";
import "../../style/tutorial.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

const TutorialDetail = () => {
  const { id } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubSectionIndex, setCurrentSubSectionIndex] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await API.get(`/tutorial/${id}`);
        setTutorial(response.data);
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };
    fetchTutorial();
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="tutorial-detail-page">
      {tutorial ? (
        <>
          {/* Sidebar for Navigation */}
          <aside className="tutorial-sidebar">
            <h1>{tutorial.title}</h1>
            <ul>
              {tutorial.sections.map((section, index) => (
                <li key={index}>
                  {/* Section Title */}
                  <div
                    className={`section-title ${currentSectionIndex === index ? "active" : ""}`}
                    onClick={() => {
                      setCurrentSectionIndex(index);
                      setCurrentSubSectionIndex(null);
                      if (section.subSections?.length > 0) {
                        toggleSection(index);
                      }
                    }}
                  >
                    {section.title} {section.subSections?.length > 0 && (expandedSections[index] ? "▲" : "▼")}
                  </div>

                  {/* Subsections Dropdown */}
                  {expandedSections[index] && section.subSections?.length > 0 && (
                    <ul className="subsection-list">
                      {section.subSections.map((subSection, subIndex) => (
                        <li
                          key={subIndex}
                          className={currentSubSectionIndex === subIndex ? "active" : ""}
                          onClick={() => {
                            setCurrentSectionIndex(index);
                            setCurrentSubSectionIndex(subIndex);
                          }}
                        >
                          {subSection.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="tutorial-content">
            <section className="markdown-body">
              {currentSubSectionIndex === null ? (
                <>
                  <h2>{tutorial.sections[currentSectionIndex].title}</h2>
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                    {tutorial.sections[currentSectionIndex].content}
                  </Markdown>
                </>
              ) : (
                <>
                  <h2>{tutorial.sections[currentSectionIndex].subSections[currentSubSectionIndex].title}</h2>
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                    {tutorial.sections[currentSectionIndex].subSections[currentSubSectionIndex].content}
                  </Markdown>
                </>
              )}
            </section>
          </main>
        </>
      ) : (
        <p>Loading tutorial...</p>
      )}
    </div>
  );
};

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default TutorialDetail;
