import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../Api";
import "../../style/tutorial.css";
import Markdown from "react-markdown";

const TutorialDetail = () => {
  const { id } = useParams();
  const [tutorial, setTutorial] = useState(null);

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

  const scrollToSection = (index) => {
    document.getElementById(`section-${index}`).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="tutorial-detail-page">
      {tutorial ? (
        <>
          {/* Sidebar for Navigation */}
          <aside className="tutorial-sidebar">
            <h2>{tutorial.title}</h2>
            <ul>
              {tutorial.sections.map((section, index) => (
                <li key={index} onClick={() => scrollToSection(index)}>
                  <Markdown>{section.title}</Markdown>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="tutorial-content">
            <h1>{tutorial.title}</h1>
            {tutorial.sections.map((section, index) => (
              <section className="markdown-body" key={index} id={`section-${index}`}>
                <Markdown>{section.title}</Markdown>
                <Markdown>{section.content}</Markdown>
              </section>
            ))}
          </main>
        </>
      ) : (
        <p>Loading tutorial...</p>
      )}
    </div>
  );
};

export default TutorialDetail;
