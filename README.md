# RSS Kindle Reader

A Node.js server that serves RSS feeds in a single, Kindle-optimized webpage. All content is fetched and delivered at once, eliminating the need for additional network requests while browsing.

## Features

- **Kindle-Optimized Design**: Clean, serif typography and high-contrast styling perfect for e-ink displays
- **Single Page Load**: All RSS feeds and articles are fetched server-side and embedded in the initial page
- **No Client-Side Requests**: Browse feeds and articles without additional network calls
- **Multiple RSS Feeds**: Predefined collection of popular tech and lifestyle blogs
- **Error Handling**: Graceful handling of failed RSS feeds with user feedback
- **Expandable Content**: Click-to-expand article content for better reading experience

## RSS Feeds Included

- Daring Fireball
- Raptitude  
- The Verge (Articles)
- Arun.is
- Stephango
- Kottke.org
- The Ringer
- Techmeme
- Seth's Blog

## Installation

### Docker (Recommended)

1. Clone this repository
2. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Open your browser to `http://localhost:3000`

To stop the application:
```bash
docker-compose down
```

### Manual Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:3000`

### Docker Build Options

Build the Docker image manually:
```bash
docker build -t rss-kindle-reader .
```

Run the container:
```bash
docker run -p 3000:3000 rss-kindle-reader
```

## Usage

1. The main page displays a list of all RSS feeds
2. Click on any feed to view its articles
3. Click on article titles to expand and read the full content
4. Use the "Back to Feeds" link to return to the main feed list

## Development

### Docker Development

For development with auto-reload:
```bash
npm run docker:dev
```

### Production Deployment

For production deployment:
```bash
npm run docker:prod
```

### Manual Docker Commands

- **Build Image**: `npm run docker:build`
- **Run Container**: `npm run docker:run`
- **Start Services**: `npm run docker:up`
- **Stop Services**: `npm run docker:down`

### Non-Docker Development

- **Start Development Server**: `npm run dev`
- **Production Start**: `npm start`

## Docker Configuration

The application includes three Docker Compose configurations:

- `docker-compose.yml` - Basic production setup
- `docker-compose.prod.yml` - Enhanced production configuration  
- `docker-compose.dev.yml` - Development setup with volume mounting

## Environment Variables

- `NODE_ENV` - Set to 'production' or 'development'
- `PORT` - Server port (default: 3000)

## Technical Details

### Server Architecture
- **Express.js** web server
- **rss-parser** for RSS feed parsing
- **CORS** middleware for cross-origin requests

### Client-Side Features
- Vanilla JavaScript for navigation
- CSS optimized for Kindle e-ink displays
- Responsive design for various screen sizes
- Print-friendly styles

### Performance
- All RSS feeds are fetched server-side on page load
- No client-side AJAX requests needed for browsing
- Optimized for slow network connections

## Configuration

To modify the RSS feeds, edit the `popularFeeds` array in `server.js`:

```javascript
const popularFeeds = [
  { name: 'Feed Name', url: 'https://example.com/feed.xml' },
  // Add more feeds here
];
```

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
