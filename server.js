const express = require('express');
const Parser = require('rss-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
async function fetchAllFeeds(includeDebugData = false) {
  const feedPromises = popularFeeds.map(async (feedInfo) => {
    try {
      console.log(`Fetching feed: ${feedInfo.name}`);
      const feed = await parser.parseURL(feedInfo.url);
      
      // Clean and format articles
      const articles = feed.items.map(item => {
        const article = {
          title: item.title || 'No Title',
          link: item.link || '#',
          pubDate: item.pubDate || item.isoDate || 'Unknown Date',
          contentSnippet: item.contentSnippet || item.summary || '',
          content: item.content || '',
          contentEncoded: item['content:encoded'] || '',
          author: item.creator || item.author || feed.title || 'Unknown Author'
        };
        
        // Only include debugData when specifically requested
        if (includeDebugData) {
          article.debugData = item;
        }
        
        return article;
      });

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
  console.log('=== MAIN ROUTE HIT ===');
  try {
    console.log('Fetching all RSS feeds...');
    const feeds = await fetchAllFeeds();
    console.log('Feeds fetched successfully. Rendering template...');
    
    // Escape feeds data for safe embedding in HTML
    const feedsJson = JSON.stringify(feeds).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    
    // Render the EJS template with feeds data
    res.render('index', { feeds: feedsJson, isDebugMode: false });
    console.log('Template rendered successfully');
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

// Debug route
app.get('/debug', async (req, res) => {
  console.log('=== DEBUG ROUTE HIT ===');
  try {
    console.log('Debug route - Fetching all RSS feeds...');
    const feeds = await fetchAllFeeds();
    console.log('Debug route - Feeds fetched successfully, count:', feeds.length);
    
    // Escape feeds data for safe embedding in HTML
    const feedsJson = JSON.stringify(feeds).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    
    // For debug, render index template with debug mode enabled
    res.render('index', { feeds: feedsJson, isDebugMode: true });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).send(`Debug Error: ${error.message}`);
  }
});

// Debug data route - shows full RSS item data including debugData
app.get('/debugData', async (req, res) => {
  console.log('=== DEBUG DATA ROUTE HIT ===');
  try {
    console.log('Debug data route - Fetching all RSS feeds with debug data...');
    const feeds = await fetchAllFeeds(true); // Include debug data
    console.log('Debug data route - Feeds fetched successfully, count:', feeds.length);
    
    // Escape feeds data for safe embedding in HTML
    const feedsJson = JSON.stringify(feeds).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    
    // For debug data, render index template with debug mode enabled
    res.render('index', { feeds: feedsJson, isDebugMode: true });
  } catch (error) {
    console.error('Debug data route error:', error);
    res.status(500).send(`Debug Data Error: ${error.message}`);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('=== TEST ROUTE HIT ===');
  res.send('<h1>Test Route Works!</h1>');
});

// Start server
app.listen(PORT, () => {
  console.log(`RSS Kindle Reader server running on http://localhost:${PORT}`);
  console.log('Fetching RSS feeds on startup...');
});

module.exports = app;
