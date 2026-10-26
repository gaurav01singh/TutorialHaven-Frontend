import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";
import "../../style/blogpage.css";
import API from "../Api";
import remarkGfm from "remark-gfm";
import SEO from "../SEO/SEO";

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await API.get(`/blog/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) return <div className="loading">Loading...</div>;

  const blogDescription = blog.description
    ? blog.description.slice(0, 160)
    : `Read ${blog.title} on Tutorial Haven.`;

  return (
    <div className="github-editor">
      <SEO
        title={blog.title}
        description={blogDescription}
        canonical={`/blog/${id}`}
        type="article"
        publishedTime={blog.createdAt}
        modifiedTime={blog.updatedAt || blog.createdAt}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": blogDescription,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://tutorial-haven-theta.vercel.app/blog/${id}`
          },
          "datePublished": blog.createdAt,
          "dateModified": blog.updatedAt || blog.createdAt,
          "publisher": {
            "@type": "Organization",
            "name": "Tutorial Haven",
            "logo": {
              "@type": "ImageObject",
              "url": "https://res.cloudinary.com/dyl5ibyvg/image/upload/v1740232286/vkx1pz1zozq37tlauoue.png"
            }
          }
        }}
      />
      <h1>{blog.title}</h1>
      <div className="markdown-content">
        <Markdown remarkPlugins={[remarkGfm]}>{blog.description}</Markdown>
      </div>
    </div>
  );
};

export default BlogPage;