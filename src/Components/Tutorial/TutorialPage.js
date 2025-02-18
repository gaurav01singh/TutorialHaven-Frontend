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

  return (
    <div className="tutorial-detail-page">
      {tutorial ? (
        <>
          {/* Sidebar for Navigation */}
          <aside className="tutorial-sidebar">
            <h1>{tutorial.title}</h1>
            <ul>
              {tutorial.sections.map((section, index) => (
                <li 
                  key={index} 
                  className={currentSectionIndex === index ? "active" : ""}
                  onClick={() => setCurrentSectionIndex(index)}
                >
                  {section.title}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content - Display only one section at a time */}
          <main className="tutorial-content">
            <section className="markdown-body">
              <h2>{tutorial.sections[currentSectionIndex].title}</h2>
              <Markdown
                remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} 
                components={{
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
                }}
              >
                {tutorial.sections[currentSectionIndex].content}
              </Markdown>
            </section>
          </main>
        </>
      ) : (
        <p>Loading tutorial...</p>
      )}
    </div>
  );
};

export default TutorialDetail;
