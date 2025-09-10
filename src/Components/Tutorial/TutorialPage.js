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

// Skeleton Loading Component
const TutorialSkeleton = () => {
  return (
    <div className="tutorial-detail-page">
      {/* Skeleton Toggle Button - Only visible on mobile */}
      <button className="sidebar-toggle skeleton-shimmer"></button>

      {/* Skeleton Sidebar */}
      <aside className="tutorial-sidebar">
        {/* Skeleton Title */}
        <div 
          className="skeleton-shimmer" 
          style={{ 
            height: '2.4rem', // Match h1 font-size: 1.5rem 
            width: '80%', 
            marginBottom: '1rem', 
            borderRadius: '5px' 
          }}
        ></div>
        
        {/* Skeleton Navigation Items */}
        <ul>
          {[...Array(6)].map((_, index) => (
            <li key={index} style={{ marginBottom: '0' }}>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '2.5rem', // Match li padding: 0.625rem * 2 + font-size
                  width: `${Math.random() * 40 + 60}%`, 
                  borderRadius: '5px',
                  marginBottom: '0.25rem'
                }}
              ></div>
              {/* Some items have subsections */}
              {index % 3 === 0 && (
                <ul className="subsection-list" style={{ marginTop: '0.5rem' }}>
                  {[...Array(3)].map((_, subIndex) => (
                    <li key={subIndex} style={{ marginBottom: '0' }}>
                      <div 
                        className="skeleton-shimmer" 
                        style={{ 
                          height: '2rem', // Match subsection li height
                          width: `${Math.random() * 30 + 50}%`, 
                          borderRadius: '5px',
                          marginBottom: '0.25rem'
                        }}
                      ></div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Skeleton Main Content */}
      <main className="tutorial-content">
        <section className="markdown-body">
          {/* Skeleton Heading - h2 size */}
          <div 
            className="skeleton-shimmer" 
            style={{ 
              height: '3.2rem', // Match h2 font-size: 2rem
              width: '70%', 
              marginTop: '1.25rem',
              marginBottom: '1rem', 
              borderRadius: '5px' 
            }}
          ></div>
          
          {/* Skeleton Paragraphs */}
          {[...Array(4)].map((_, index) => (
            <div key={index} style={{ marginBottom: '0.625rem' }}>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', // Match line-height
                  width: '100%', 
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', 
                  width: '95%', 
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', 
                  width: `${Math.random() * 30 + 70}%`, 
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
            </div>
          ))}

          {/* Skeleton Code Block */}
          <div 
            className="skeleton-shimmer" 
            style={{ 
              height: '150px', 
              width: '100%', 
              marginTop: '1rem',
              marginBottom: '1rem', 
              borderRadius: '5px' // Match pre border-radius
            }}
          ></div>

          {/* Skeleton h3 Subheading */}
          <div 
            className="skeleton-shimmer" 
            style={{ 
              height: '2.8rem', // Match h3 font-size: 1.75rem
              width: '60%', 
              marginTop: '1rem',
              marginBottom: '0.75rem', 
              borderRadius: '5px' 
            }}
          ></div>

          {/* More Skeleton Paragraphs */}
          {[...Array(3)].map((_, index) => (
            <div key={index} style={{ marginBottom: '0.625rem' }}>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', 
                  width: '100%', 
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
              <div 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', 
                  width: `${88 + Math.random() * 10}%`, // 88-98%
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
            </div>
          ))}

          {/* Skeleton List Items */}
          <div style={{ paddingLeft: '1.25rem', margin: '0.625rem 0' }}>
            {[...Array(4)].map((_, index) => (
              <div 
                key={index}
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.6rem', 
                  width: `${Math.random() * 25 + 70}%`, 
                  marginBottom: '0.625rem', 
                  borderRadius: '4px' 
                }}
              ></div>
            ))}
          </div>

          {/* Final Skeleton Paragraph */}
          <div style={{ marginTop: '1rem' }}>
            <div 
              className="skeleton-shimmer" 
              style={{ 
                height: '1.6rem', 
                width: '100%', 
                marginBottom: '0.625rem', 
                borderRadius: '4px' 
              }}
            ></div>
            <div 
              className="skeleton-shimmer" 
              style={{ 
                height: '1.6rem', 
                width: '75%', 
                borderRadius: '4px' 
              }}
            ></div>
          </div>
        </section>
      </main>
    </div>
  );
};

const TutorialDetail = () => {
  const { slug } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubSectionIndex, setCurrentSubSectionIndex] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/tutorial/${slug}`);
        setTutorial(response.data);
        document.title = `Tutorial Haven | ${response.data.title}`;
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      } finally {
        setLoading(false);
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

  // Show skeleton while loading
  if (loading) {
    return <TutorialSkeleton />;
  }

  return (
    <div className="tutorial-detail-page">
      <Helmet>
        <title>{tutorial ? `Tutorial Haven | ${tutorial.title}` : "Tutorial Haven"}</title>
        <meta 
          name="description" 
          content={tutorial ? tutorial.sections?.[0]?.content?.slice(0, 150) : "Explore tutorials on Tutorial Haven"} 
        />
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
                    <Markdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]} 
                      components={markdownComponents}
                    >
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
                    <Markdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]} 
                      components={markdownComponents}
                    >
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
        <p>Failed to load tutorial.</p>
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