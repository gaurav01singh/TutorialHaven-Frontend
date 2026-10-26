const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tutorial-haven-theta.vercel.app';
const API_BASE = 'https://tutorial-haven-backend.vercel.app/api';

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] Failed to fetch ${url}:`, err.message);
    return null;
  }
}

function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('[sitemap] Generating sitemap.xml...');

  const urls = [];

  // 1. Static Core Pages
  urls.push({
    loc: `${BASE_URL}/`,
    changefreq: 'daily',
    priority: '1.0',
    lastmod: formatDate(new Date())
  });

  urls.push({
    loc: `${BASE_URL}/tutorial`,
    changefreq: 'daily',
    priority: '0.9',
    lastmod: formatDate(new Date())
  });

  urls.push({
    loc: `${BASE_URL}/compiler`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: formatDate(new Date())
  });

  // 2. Fetch Categories & Subcategories
  const categories = await fetchJSON(`${API_BASE}/category/get-category`);
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat.slug) {
        urls.push({
          loc: `${BASE_URL}/tutorial/category/${escapeXml(cat.slug)}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: formatDate(cat.updatedAt || cat.createdAt)
        });
      }

      if (Array.isArray(cat.subcategories)) {
        for (const sub of cat.subcategories) {
          if (sub.slug) {
            urls.push({
              loc: `${BASE_URL}/tutorial/subcategory/${escapeXml(sub.slug)}`,
              changefreq: 'weekly',
              priority: '0.7',
              lastmod: formatDate(sub.updatedAt || sub.createdAt)
            });
          }
        }
      }
    }
  }

  // 3. Fetch Tutorials
  const tutorialRes = await fetchJSON(`${API_BASE}/tutorial/all?limit=1000`);
  const tutorials = tutorialRes
    ? tutorialRes.tutorials || tutorialRes.data || (Array.isArray(tutorialRes) ? tutorialRes : [])
    : [];

  if (Array.isArray(tutorials)) {
    for (const tut of tutorials) {
      if (tut.slug) {
        urls.push({
          loc: `${BASE_URL}/tutorial/${escapeXml(tut.slug)}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: formatDate(tut.updatedAt || tut.createdAt)
        });
      }
    }
  }

  // Deduplicate by URL
  const uniqueUrls = [];
  const seen = new Set();
  for (const item of urls) {
    if (!seen.has(item.loc)) {
      seen.add(item.loc);
      uniqueUrls.push(item);
    }
  }

  // Generate XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const targetPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(targetPath, sitemapXml, 'utf8');
  console.log(`[sitemap] Successfully generated ${targetPath} with ${uniqueUrls.length} URLs!`);
}

generateSitemap().catch((err) => {
  console.error('[sitemap] Error generating sitemap:', err);
  process.exit(1);
});
