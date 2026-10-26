import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_SITE_URL = "https://tutorial-haven-theta.vercel.app";
const DEFAULT_TITLE = "Tutorial Haven - Learn Programming, Web Development & AI/ML";
const DEFAULT_DESCRIPTION =
  "Explore free programming tutorials, web development guides, AI/ML lessons, interview preparation, and an interactive online code compiler on Tutorial Haven.";
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dyl5ibyvg/image/upload/v1740232286/vkx1pz1zozq37tlauoue.png";
const DEFAULT_KEYWORDS =
  "programming tutorials, web development, learn coding, react, nodejs, python, ai and ml, data science, interview preparation, online code compiler, developer guides";

const SEO = ({
  title,
  titleTemplate = true,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  image = DEFAULT_IMAGE,
  imageAlt,
  type = "website",
  author = "Tutorial Haven",
  publishedTime,
  modifiedTime,
  noindex = false,
  schema = null,
}) => {
  // Format page title
  const fullTitle = title
    ? titleTemplate
      ? `${title} | Tutorial Haven`
      : title
    : DEFAULT_TITLE;

  // Clean canonical URL
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${DEFAULT_SITE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`
    : DEFAULT_SITE_URL;

  // Ensure clean description without raw markdown/HTML, truncated to recommended 160 characters
  const cleanDescription = description
    ? description
        .replace(/#+\s+/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[`*_\\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160)
    : DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={cleanDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Crawling directives */}
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta
        name="googlebot"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Tutorial Haven" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt || fullTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Article Specific Open Graph */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt || fullTitle} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
