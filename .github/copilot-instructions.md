<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# RSS Kindle Reader Project Instructions

This is a Node.js RSS feed reader application optimized for Kindle devices. The project serves a single webpage that fetches and displays multiple RSS feeds in a clean, readable format.

## Key Features
- Single-page application that loads all RSS feed data at once
- Kindle-optimized styling with serif fonts and clean layout
- Navigation between feeds and articles without additional server requests
- Error handling for failed RSS feed fetches
- Expandable article content

## Technical Stack
- Node.js with Express server
- rss-parser for RSS feed parsing
- Vanilla JavaScript for client-side navigation
- CSS optimized for e-ink displays

## Code Style Guidelines
- Use clear, readable variable names
- Handle errors gracefully with user-friendly messages
- Optimize for minimal network requests
- Keep styling simple and high-contrast for Kindle compatibility
- Use semantic HTML structure

## RSS Feeds
The application fetches from these predefined feeds:
- Daring Fireball
- Raptitude
- The Verge
- Arun.is
- Stephango
- Kottke.org
- The Ringer
- Techmeme
- Seth's Blog

## Development Notes
- Server fetches all RSS feeds on each page load
- All content is embedded in the initial HTML response
- Client-side JavaScript handles navigation between feeds and articles
- No additional API endpoints needed for browsing content
