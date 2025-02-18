import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../Api";
import "../../style/tutorial.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
                  <Markdown remarkPlugins={[remarkGfm]}>{section.title}</Markdown>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content - Display only one section at a time */}
          <main className="tutorial-content">
            <section className="markdown-body">
              <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>{tutorial.sections[currentSectionIndex].title}</Markdown>
              <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>{tutorial.sections[currentSectionIndex].content}</Markdown>
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
