import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../Api";
import "../../style/tutorial.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import { Helmet } from "react-helmet-async";

const TutorialDetail = () => {
  const { slug } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubSectionIndex, setCurrentSubSectionIndex] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await API.get(`/tutorial/${slug}`);
        setTutorial(response.data);
        document.title = `Tutorial Haven | ${response.data.title}`;
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };
    fetchTutorial();
  }, [slug]);
  

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="tutorial-detail-page">
      <Helmet>
        <title>{tutorial ? `Tutorial Haven | ${tutorial.title}` : "Tutorial Haven"}</title>
        <meta name="description" content={tutorial ? tutorial.sections?.[0]?.content?.slice(0, 150) : "Explore tutorials on Tutorial Haven"} />
      </Helmet>
      {tutorial ? (
        <>
          {/* Toggle Button for Sidebar (Visible on Mobile) */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "✖" : "☰"}
          </button>

          {/* Sidebar for Navigation */}
          <aside className={`tutorial-sidebar ${sidebarOpen ? "open" : ""}`}>
            <h1>{tutorial.title}</h1>
            <ul>
              {tutorial.sections?.map((section, index) => (
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
                      setSidebarOpen(false);
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
                            setSidebarOpen(false);
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
                tutorial.sections?.[currentSectionIndex] ? (
                  <>
                    <h2>{tutorial.sections[currentSectionIndex].title}</h2>
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                      {tutorial.sections[currentSectionIndex].content}
                    </Markdown>
                  </>
                ) : (
                  <p>No content available.</p>
                )
              ) : (
                tutorial.sections?.[currentSectionIndex]?.subSections?.[currentSubSectionIndex] ? (
                  <>
                    <h2>{tutorial.sections[currentSectionIndex].subSections[currentSubSectionIndex].title}</h2>
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                      {tutorial.sections[currentSectionIndex].subSections[currentSubSectionIndex].content}
                    </Markdown>
                  </>
                ) : (
                  <p>No content available.</p>
                )
              )}
            </section>
          </main>

          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": tutorial?.title,
                "description": tutorial?.sections?.[0]?.content?.slice(0, 150),
                "author": "Your Site Name",
                "datePublished": tutorial?.createdAt,
                "image": tutorial?.templateImg,
              })}
            </script>
          </Helmet>
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
