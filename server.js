const express = require('express');
const Parser = require('rss-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// RSS Feed URLs
const popularFeeds = [
  { name: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main' },
  { name: 'Raptitude', url: 'https://www.raptitude.com/feed/' },
  { name: 'The Verge (Articles)', url: 'https://www.theverge.com/rss/partner/subscriber-only-full-feed/rss.xml' },
  { name: 'Arun.is', url: 'https://arun.is/rss.xml' },
  { name: 'Stephango', url: 'https://stephango.com/feed.xml' },
  { name: 'Kottke.org', url: 'https://feeds.kottke.org/main' },
  { name: 'The Ringer', url: 'https://wp.theringer.com/feed/' },
  { name: 'Techmeme', url: 'https://www.techmeme.com/feed.xml' },
  { name: "Seth's Blog", url: 'https://feeds.feedblitz.com/sethsblog' }
];

// Function to fetch and parse RSS feeds
async function fetchAllFeeds() {
  const feedPromises = popularFeeds.map(async (feedInfo) => {
    try {
      console.log(`Fetching feed: ${feedInfo.name}`);
      const feed = await parser.parseURL(feedInfo.url);
      
      // Clean and format articles
      const articles = feed.items.map(item => ({
        title: item.title || 'No Title',
        link: item.link || '#',
        pubDate: item.pubDate || item.isoDate || 'Unknown Date',
        contentSnippet: item.contentSnippet || item.summary || '',
        content: item.content || '',
        contentEncoded: item['content:encoded'] || '',
        author: item.creator || item.author || feed.title || 'Unknown Author',
        // Debug: Include all available RSS item properties
        debugData: item
      }));

      return {
        name: feedInfo.name,
        title: feed.title || feedInfo.name,
        description: feed.description || '',
        link: feed.link || feedInfo.url,
        articles: articles,
        lastBuildDate: feed.lastBuildDate || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching ${feedInfo.name}:`, error.message);
      return {
        name: feedInfo.name,
        title: feedInfo.name,
        description: 'Error loading feed',
        link: feedInfo.url,
        articles: [],
        error: error.message,
        lastBuildDate: new Date().toISOString()
      };
    }
  });

  return Promise.all(feedPromises);
}

// Main route - serves the complete webpage with all RSS data
app.get('/', async (req, res) => {
  try {
    console.log('Fetching all RSS feeds...');
    const feeds = await fetchAllFeeds();
    
    const html = generateKindleOptimizedHTML(feeds);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating page:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>RSS Reader - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1>Error Loading Feeds</h1>
        <p>There was an error loading the RSS feeds. Please try again later.</p>
        <p>Error: ${error.message}</p>
      </body>
      </html>
    `);
  }
});

// Function to generate Kindle-optimized HTML
function generateKindleOptimizedHTML(feeds) {
  // Safely stringify the feeds data and escape for HTML
  const feedsJson = JSON.stringify(feeds).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSS Kindle Reader</title>
    <style>
        body {
            font-family: "Times New Roman", serif;
            font-size: 18px;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #000000;
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1, h2, h3 {
            color: #000000;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        h1 {
            font-size: 24px;
            border-bottom: 2px solid #000000;
            padding-bottom: 10px;
        }
        
        h2 {
            font-size: 20px;
        }
        
        h3 {
            font-size: 18px;
        }
        
        a {
            color: #000000;
            text-decoration: underline;
            cursor: pointer;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
        }
        
        .nav {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ccc;
        }
        
        .nav a {
            margin-right: 20px;
            font-weight: bold;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input[type="url"] {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 2px solid #000000;
            background-color: #ffffff;
            color: #000000;
        }
        
        button {
            background-color: #000000;
            color: #ffffff;
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            cursor: pointer;
        }
        
        .error {
            color: #000000;
            background-color: #f0f0f0;
            padding: 20px;
            border: 2px solid #000000;
            margin: 20px 0;
        }
        
        .loading {
            text-align: center;
            font-style: italic;
            margin: 20px 0;
        }
        
        .article-list {
            list-style: none;
            padding: 0;
        }
        
        .article-item {
            margin-bottom: 20px;
            padding: 15px;
            border-bottom: 2px solid #eee;
            background-color: #fafafa;
        }
        
        .article-title {
            margin-bottom: 10px;
        }
        
        .article-title a {
            font-size: 20px;
            font-weight: bold;
            text-decoration: none;
            color: #000;
            border-bottom: 1px solid transparent;
        }
        
        .article-title a::after {
            content: " →";
            color: #666;
            font-size: 16px;
        }
        
        .article-meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .article-summary {
            margin-bottom: 10px;
        }
        
        .article-content {
            line-height: 1.8;
            margin-bottom: 20px;
        }
        
        .article-content p {
            margin-bottom: 15px;
        }
        
        .article-content img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px 0;
        }

        .content-section {
            margin-bottom: 30px;
            padding: 20px;
            border-left: 3px solid #000;
            background-color: #f9f9f9;
        }

        .content-section h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        
        .back-link {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
        }
        
        .article-tags, .article-categories {
            margin-top: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-left: 3px solid #000;
            font-size: 16px;
        }
        
        .hidden {
            display: none;
        }
        
        .feed-list {
            list-style: none;
            padding: 0;
        }
        
        .feed-item {
            margin-bottom: 15px;
            padding: 15px;
            border: 2px solid #ccc;
            background-color: #fafafa;
            transition: background-color 0.2s;
        }
        
        .feed-item.error {
            background-color: #fff5f5;
            border-color: #ccc;
        }
        
        .feed-title {
            margin-bottom: 5px;
        }
        
        .feed-title a {
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
            color: #000;
            border-bottom: 2px solid transparent;
        }
        
        .feed-title a::after {
            content: " →";
            color: #666;
        }
        
        .feed-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .feed-stats {
            font-size: 12px;
            color: #999;
        }

        /* Application-specific styles */
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 28px;
            margin: 0;
            font-weight: normal;
        }

        .subtitle {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }

        .navigation {
            margin-bottom: 30px;
        }

        .nav-item {
            display: block;
            padding: 15px;
            border: 2px solid #ccc;
            background-color: #fafafa;
            text-decoration: none;
            color: #000;
            font-size: 18px;
            cursor: pointer;
            margin-bottom: 15px;
            transition: background-color 0.2s;
        }

        .feed-count {
            color: #666;
            font-size: 14px;
            float: right;
        }

        .content-area {
            display: none;
        }

        .content-area.active {
            display: block;
        }

        .article {
            margin-bottom: 20px;
            padding: 15px;
            border-bottom: 2px solid #eee;
            background-color: #fafafa;
            cursor: pointer;
        }

        .article .article-title {
            font-size: 20px;
            margin: 0 0 10px 0;
            font-weight: bold;
            color: #000;
        }

        .article .article-title:hover {
            text-decoration: underline;
        }

        .article-view {
            display: none;
        }

        .article-view.active {
            display: block;
        }

        .article-header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }

        .article-header .article-title {
            font-size: 24px;
            margin: 0 0 15px 0;
            font-weight: bold;
            color: #000;
            line-height: 1.3;
        }

        .article-header .article-meta {
            font-size: 14px;
            color: #666;
        }

        .error-message {
            color: #000000;
            background-color: #f0f0f0;
            padding: 20px;
            border: 2px solid #000000;
            margin: 20px 0;
        }

        .debug-section {
            margin-top: 30px;
            padding: 20px;
            background-color: #f5f5f5;
            border: 2px solid #ccc;
            border-radius: 5px;
        }

        .debug-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            cursor: pointer;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }

        .debug-content {
            display: none;
            font-family: "Courier New", monospace;
            font-size: 12px;
            background-color: #fff;
            padding: 15px;
            border: 1px solid #ddd;
            overflow-x: auto;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }

        .debug-content.active {
            display: block;
        }
        
        /* Kindle-specific optimizations */
        @media (max-width: 600px) {
            body {
                font-size: 16px;
                padding: 10px;
            }
            
            h1 {
                font-size: 22px;
            }
            
            h2 {
                font-size: 18px;
            }
            
            .nav a {
                display: block;
                margin: 10px 0;
            }

            .feed-count {
                float: none;
                display: block;
                margin-top: 5px;
            }
        }

        /* Print styles for better Kindle compatibility */
        @media print {
            body {
                font-size: 12pt;
                line-height: 1.5;
            }
            
            .nav-item, .back-link {
                color: #000 !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RSS Kindle Reader</h1>
        <div class="subtitle">Updated: <span id="update-time"></span></div>
    </div>

    <div id="main-navigation" class="navigation">
        <!-- Feed navigation will be populated by JavaScript -->
    </div>

    <!-- Content areas for each feed -->
    <div id="content-container">
        <!-- Feed content will be populated by JavaScript -->
    </div>

    <script>
        // RSS feeds data embedded in the page
        const feedsData = ${feedsJson};
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
        });

        function initializePage() {
            // Set update time
            document.getElementById('update-time').textContent = new Date().toLocaleString();
            
            // Generate navigation
            generateNavigation();
            
            // Generate content areas
            generateContentAreas();
            
            // Show main navigation by default
            showMainNavigation();
        }

        function generateNavigation() {
            const nav = document.getElementById('main-navigation');
            nav.innerHTML = '';
            
            feedsData.forEach((feed, index) => {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item';
                navItem.onclick = () => showFeed(index);
                
                const articleCount = feed.articles ? feed.articles.length : 0;
                const errorText = feed.error ? ' (Error)' : '';
                
                navItem.innerHTML = \`
                    \${feed.title || feed.name}
                    <span class="feed-count">\${articleCount} articles\${errorText}</span>
                \`;
                
                nav.appendChild(navItem);
            });
        }

        function generateContentAreas() {
            const container = document.getElementById('content-container');
            container.innerHTML = '';
            
            feedsData.forEach((feed, index) => {
                // Create feed list view
                const feedListArea = document.createElement('div');
                feedListArea.id = \`feed-\${index}\`;
                feedListArea.className = 'content-area';
                
                let articlesHTML = '';
                
                if (feed.error) {
                    articlesHTML = \`<div class="error-message">Error loading feed: \${feed.error}</div>\`;
                } else if (feed.articles && feed.articles.length > 0) {
                    articlesHTML = feed.articles.map((article, articleIndex) => \`
                        <div class="article" onclick="showArticle(\${index}, \${articleIndex})">
                            <div class="article-title">
                                \${article.title}
                            </div>
                            <div class="article-meta">
                                \${new Date(article.pubDate).toLocaleDateString()} • \${article.author}
                            </div>
                        </div>
                    \`).join('');
                } else {
                    articlesHTML = '<div class="error-message">No articles found in this feed.</div>';
                }
                
                feedListArea.innerHTML = \`
                    <a href="#" class="back-link" onclick="showMainNavigation(); return false;">← Back to Feeds</a>
                    <div class="feed-header">
                        <h2 class="feed-title">\${feed.title || feed.name}</h2>
                        <div class="feed-description">\${feed.description || ''}</div>
                    </div>
                    \${articlesHTML}
                \`;
                
                container.appendChild(feedListArea);

                // Create individual article views
                if (feed.articles && feed.articles.length > 0) {
                    feed.articles.forEach((article, articleIndex) => {
                        const articleView = document.createElement('div');
                        articleView.id = \`article-\${index}-\${articleIndex}\`;
                        articleView.className = 'article-view';
                        
                        articleView.innerHTML = \`
                            <a href="#" class="back-link" onclick="showFeed(\${index}); return false;">← Back to \${feed.title || feed.name}</a>
                            <div class="article-header">
                                <h2 class="article-title">\${article.title}</h2>
                                <div class="article-meta">
                                    \${new Date(article.pubDate).toLocaleDateString()} • \${article.author}
                                </div>
                            </div>
                            <div class="article-content">
                                \${generateArticleContent(article)}
                            </div>
                            <div class="debug-section">
                                <div class="debug-title" onclick="toggleDebug(\${index}, \${articleIndex})">
                                    🔍 Debug: Show RSS Data (Click to toggle)
                                </div>
                                <div id="debug-\${index}-\${articleIndex}" class="debug-content">
                                </div>
                            </div>
                        \`;
                        
                        container.appendChild(articleView);
                    });
                }
            });
        }

        function showMainNavigation() {
            // Hide all content areas and article views
            document.querySelectorAll('.content-area, .article-view').forEach(area => {
                area.classList.remove('active');
            });
            
            // Show navigation
            document.getElementById('main-navigation').style.display = 'block';
        }

        function generateArticleContent(article) {
            let contentHtml = '';
            
            // Show content:encoded if available
            if (article.contentEncoded && article.contentEncoded.trim()) {
                contentHtml += '<div class="content-section">';
                contentHtml += '<h3>Full Content (content:encoded):</h3>';
                contentHtml += article.contentEncoded;
                contentHtml += '</div>';
            }
            
            // Show regular content if available and different from content:encoded
            if (article.content && article.content.trim() && article.content !== article.contentEncoded) {
                contentHtml += '<div class="content-section">';
                contentHtml += '<h3>Content:</h3>';
                contentHtml += article.content;
                contentHtml += '</div>';
            }
            
            // Fallback to content snippet if no other content is available
            if (!contentHtml && article.contentSnippet && article.contentSnippet.trim()) {
                contentHtml += '<div class="content-section">';
                contentHtml += '<h3>Summary:</h3>';
                contentHtml += article.contentSnippet;
                contentHtml += '</div>';
            }
            
            // Final fallback
            if (!contentHtml) {
                contentHtml = '<div class="content-section">No content available</div>';
            }
            
            return contentHtml;
        }

        function showFeed(feedIndex) {
            // Hide navigation
            document.getElementById('main-navigation').style.display = 'none';
            
            // Hide all content areas and article views
            document.querySelectorAll('.content-area, .article-view').forEach(area => {
                area.classList.remove('active');
            });
            
            // Show selected feed
            const feedArea = document.getElementById(\`feed-\${feedIndex}\`);
            if (feedArea) {
                feedArea.classList.add('active');
            }
        }

        function showArticle(feedIndex, articleIndex) {
            // Hide all content areas and article views
            document.querySelectorAll('.content-area, .article-view').forEach(area => {
                area.classList.remove('active');
            });
            
            // Show selected article
            const articleView = document.getElementById(\`article-\${feedIndex}-\${articleIndex}\`);
            if (articleView) {
                articleView.classList.add('active');
            }
        }

        function toggleDebug(feedIndex, articleIndex) {
            const debugContent = document.getElementById(\`debug-\${feedIndex}-\${articleIndex}\`);
            if (debugContent) {
                debugContent.classList.toggle('active');
                
                // Populate debug content if it's empty
                if (debugContent.classList.contains('active') && !debugContent.textContent.trim()) {
                    const article = feedsData[feedIndex].articles[articleIndex];
                    debugContent.textContent = JSON.stringify(article.debugData, null, 2);
                }
            }
        }
    </script>
</body>
</html>`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`RSS Kindle Reader server running on http://localhost:${PORT}`);
  console.log('Fetching RSS feeds on startup...');
});

module.exports = app;
