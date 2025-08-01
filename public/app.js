// RSS Kindle Reader JavaScript
let feedsData = [];
let isDebugMode = false;

// Function to set feeds data (called from EJS template)
function setFeedsData(data) {
    feedsData = data;
}

// Function to set debug mode (called from EJS template)
function setDebugMode(debugMode) {
    isDebugMode = debugMode;
}

function initializePage() {
    // Initialize theme first
    initializeTheme();
    
    // Set update time
    document.getElementById('update-time').textContent = new Date().toLocaleString();
    
    // Generate navigation
    generateNavigation();
    
    // Generate content areas
    generateContentAreas();
    
    // Create floating navigation buttons
    createFloatingNavButtons();
    
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
        
        navItem.innerHTML = `
            ${feed.title || feed.name}
            <span class="feed-count">${articleCount} articles${errorText}</span>
        `;
        
        nav.appendChild(navItem);
    });
}

function generateContentAreas() {
    const container = document.getElementById('content-container');
    container.innerHTML = '';
    
    feedsData.forEach((feed, index) => {
        // Create feed list view
        const feedListArea = document.createElement('div');
        feedListArea.id = `feed-${index}`;
        feedListArea.className = 'content-area';
        
        let articlesHTML = '';
        
        if (feed.error) {
            articlesHTML = `<div class="error-message">Error loading feed: ${feed.error}</div>`;
        } else if (feed.articles && feed.articles.length > 0) {
            articlesHTML = feed.articles.map((article, articleIndex) => `
                <div class="article" onclick="showArticle(${index}, ${articleIndex})">
                    <div class="article-title">
                        ${article.title}
                    </div>
                    <div class="article-meta">
                        ${new Date(article.pubDate).toLocaleDateString()} • ${article.author}
                    </div>
                </div>
            `).join('');
        } else {
            articlesHTML = '<div class="error-message">No articles found in this feed.</div>';
        }
        
        feedListArea.innerHTML = `
            <a href="#" class="back-link" onclick="showMainNavigation(); return false;">← Back to Feeds</a>
            <div class="feed-header">
                <h2 class="feed-title">${feed.title || feed.name}</h2>
                <div class="feed-description">${feed.description || ''}</div>
            </div>
            ${articlesHTML}
            <div class="back-link">
                <a href="#" onclick="showMainNavigation(); return false;">← Back to Feeds</a>
            </div>
        `;
        
        container.appendChild(feedListArea);

        // Create individual article views
        if (feed.articles && feed.articles.length > 0) {
            feed.articles.forEach((article, articleIndex) => {
                const articleView = document.createElement('div');
                articleView.id = `article-${index}-${articleIndex}`;
                articleView.className = 'article-view';
                
                const debugSection = isDebugMode ? `
                    <div class="debug-section">
                        <div class="debug-title" onclick="toggleDebug(${index}, ${articleIndex})">
                            🔍 Debug: Show RSS Data (Click to toggle)
                        </div>
                        <div id="debug-${index}-${articleIndex}" class="debug-content">
                        </div>
                    </div>
                ` : '';
                
                articleView.innerHTML = `
                    <a href="#" class="back-link" onclick="showFeed(${index}); return false;">← Back to ${feed.title || feed.name}</a>
                    <div class="article-header">
                        <h2 class="article-title">${article.title}</h2>
                        <div class="article-meta">
                            ${new Date(article.pubDate).toLocaleDateString()} • ${article.author}
                        </div>
                        <div class="article-controls">
                            <button class="toggle-images-btn" onclick="toggleImages(${index}, ${articleIndex})">
                                Toggle Images
                            </button>
                        </div>
                    </div>
                    <div class="article-content">
                        ${generateArticleContent(article)}
                    </div>
                    ${debugSection}
                    <div class="back-link">
                        <a href="#" onclick="showFeed(${index}); return false;">← Back to ${feed.title || feed.name}</a>
                        <br>
                        <a href="#" onclick="showMainNavigation(); return false;">← Back to Feeds</a>
                    </div>
                `;
                
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
    
    // Update floating nav visibility
    updateFloatingNavVisibility();
}

function generateArticleContent(article) {
    let contentHtml = '';
    
    // Show content:encoded if available
    if (article.contentEncoded && article.contentEncoded.trim()) {
        contentHtml += '<div class="content-section">';
        contentHtml += '<h3>Full Content (content:encoded):</h3>';
        contentHtml += processContentForImages(article.contentEncoded);
        contentHtml += '</div>';
    }
    
    // Show regular content if available and different from content:encoded
    if (article.content && article.content.trim() && article.content !== article.contentEncoded) {
        contentHtml += '<div class="content-section">';
        contentHtml += '<h3>Content:</h3>';
        contentHtml += processContentForImages(article.content);
        contentHtml += '</div>';
    }
    
    // Fallback to content snippet if no other content is available
    if (!contentHtml && article.contentSnippet && article.contentSnippet.trim()) {
        contentHtml += '<div class="content-section">';
        contentHtml += '<h3>Summary:</h3>';
        contentHtml += processContentForImages(article.contentSnippet);
        contentHtml += '</div>';
    }
    
    // Final fallback
    if (!contentHtml) {
        contentHtml = '<div class="content-section">No content available</div>';
    }
    
    return contentHtml;
}

function processContentForImages(content) {
    // Replace all img tags with placeholders to prevent automatic image loading
    return content.replace(/<img([^>]*)>/g, function(match, attributes) {
        // Extract src attribute
        const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/);
        const altMatch = attributes.match(/alt\s*=\s*["']([^"']+)["']/);
        
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : 'Image';
        
        return `<div class="image-placeholder" data-src="${src}" data-original-attributes="${attributes}">
            <div class="image-placeholder-content">
                <div class="image-placeholder-icon">🖼️</div>
                <div class="image-placeholder-text">${alt}</div>
                <div class="image-placeholder-note">Image not loaded - click "Toggle Images" to view</div>
            </div>
        </div>`;
    });
}

function showFeed(feedIndex) {
    // Hide navigation
    document.getElementById('main-navigation').style.display = 'none';
    
    // Hide all content areas and article views
    document.querySelectorAll('.content-area, .article-view').forEach(area => {
        area.classList.remove('active');
    });
    
    // Show selected feed
    const feedArea = document.getElementById(`feed-${feedIndex}`);
    if (feedArea) {
        feedArea.classList.add('active');
    }
    
    // Update floating nav visibility
    updateFloatingNavVisibility();
}

function showArticle(feedIndex, articleIndex) {
    // Hide all content areas and article views
    document.querySelectorAll('.content-area, .article-view').forEach(area => {
        area.classList.remove('active');
    });
    
    // Show selected article
    const articleView = document.getElementById(`article-${feedIndex}-${articleIndex}`);
    if (articleView) {
        articleView.classList.add('active');
    }
    
    // Update floating nav visibility
    updateFloatingNavVisibility();
    
    // Scroll to top of article
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDebug(feedIndex, articleIndex) {
    const debugContent = document.getElementById(`debug-${feedIndex}-${articleIndex}`);
    if (debugContent) {
        debugContent.classList.toggle('active');
        
        // Populate debug content if it's empty
        if (debugContent.classList.contains('active') && !debugContent.textContent.trim()) {
            const article = feedsData[feedIndex].articles[articleIndex];
            debugContent.textContent = JSON.stringify(article.debugData, null, 2);
        }
    }
}

function toggleImages(feedIndex, articleIndex) {
    const articleView = document.getElementById(`article-${feedIndex}-${articleIndex}`);
    if (!articleView) return;
    
    const imagesToggled = articleView.dataset.imagesToggled === 'true';
    const button = articleView.querySelector('.toggle-images-btn');
    
    if (imagesToggled) {
        // Hide images - replace img tags with placeholders
        const images = articleView.querySelectorAll('.article-content img[data-placeholder-src]');
        images.forEach(img => {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.dataset.src = img.dataset.placeholderSrc;
            placeholder.dataset.originalAttributes = img.dataset.originalAttributes || '';
            
            const alt = img.alt || 'Image';
            placeholder.innerHTML = `
                <div class="image-placeholder-content">
                    <div class="image-placeholder-icon">🖼️</div>
                    <div class="image-placeholder-text">${alt}</div>
                    <div class="image-placeholder-note">Image not loaded - click "Toggle Images" to view</div>
                </div>
            `;
            
            img.parentNode.replaceChild(placeholder, img);
        });
        
        articleView.dataset.imagesToggled = 'false';
        button.textContent = 'Toggle Images';
        button.classList.remove('images-visible');
    } else {
        // Show images - replace placeholders with actual img tags
        const placeholders = articleView.querySelectorAll('.article-content .image-placeholder[data-src]');
        placeholders.forEach(placeholder => {
            if (placeholder.dataset.src) {
                const img = document.createElement('img');
                img.src = placeholder.dataset.src;
                img.dataset.placeholderSrc = placeholder.dataset.src;
                img.dataset.originalAttributes = placeholder.dataset.originalAttributes;
                
                // Apply original attributes if available
                if (placeholder.dataset.originalAttributes) {
                    const attributes = placeholder.dataset.originalAttributes;
                    const altMatch = attributes.match(/alt\s*=\s*["']([^"']+)["']/);
                    if (altMatch) {
                        img.alt = altMatch[1];
                    }
                }
                
                // Add loading indicator
                img.onload = function() {
                    this.classList.add('loaded');
                };
                
                img.onerror = function() {
                    this.alt = 'Image failed to load';
                    this.classList.add('error');
                };
                
                placeholder.parentNode.replaceChild(img, placeholder);
            }
        });
        
        articleView.dataset.imagesToggled = 'true';
        button.textContent = 'Hide Images';
        button.classList.add('images-visible');
    }
}

function createFloatingNavButtons() {
    // Remove existing buttons if they exist
    const existingButtons = document.querySelectorAll('.floating-nav-btn');
    existingButtons.forEach(btn => btn.remove());
    
    // Create page up button
    const pageUpBtn = document.createElement('button');
    pageUpBtn.className = 'floating-nav-btn page-up-btn';
    pageUpBtn.innerHTML = '↑';
    pageUpBtn.onclick = () => pageUp();
    
    // Create page down button
    const pageDownBtn = document.createElement('button');
    pageDownBtn.className = 'floating-nav-btn page-down-btn';
    pageDownBtn.innerHTML = '↓';
    pageDownBtn.onclick = () => pageDown();
    
    // Add buttons to body
    document.body.appendChild(pageUpBtn);
    document.body.appendChild(pageDownBtn);
    
    // Show/hide buttons based on current view
    updateFloatingNavVisibility();
}

function updateFloatingNavVisibility() {
    const pageUpBtn = document.querySelector('.page-up-btn');
    const pageDownBtn = document.querySelector('.page-down-btn');
    
    if (!pageUpBtn || !pageDownBtn) return;
    
    // Show buttons only when viewing an article
    const isArticleView = document.querySelector('.article-view.active');
    
    if (isArticleView) {
        pageUpBtn.style.display = 'block';
        pageDownBtn.style.display = 'block';
    } else {
        pageUpBtn.style.display = 'none';
        pageDownBtn.style.display = 'none';
    }
}

function pageUp() {
    window.scrollBy({
        top: -window.innerHeight * 0.8, // Scroll up by 80% of viewport height
        behavior: 'smooth'
    });
}

function pageDown() {
    window.scrollBy({
        top: window.innerHeight * 0.8, // Scroll down by 80% of viewport height
        behavior: 'smooth'
    });
}

// Theme toggle functionality
function initializeTheme() {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode, but respect saved preference
    const isDarkMode = savedTheme ? savedTheme === 'dark' : true;
    
    if (isDarkMode) {
        document.documentElement.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
    }
    
    updateThemeToggleButton();
}

function toggleTheme() {
    const isLightMode = document.documentElement.classList.contains('light-mode');
    
    if (isLightMode) {
        // Switch to dark mode
        document.documentElement.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light mode
        document.documentElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
    
    updateThemeToggleButton();
}

function updateThemeToggleButton() {
    const themeToggle = document.querySelector('.theme-toggle');
    const isLightMode = document.documentElement.classList.contains('light-mode');
    
    if (themeToggle) {
        themeToggle.textContent = isLightMode ? '🌙' : '🌞';
        themeToggle.setAttribute('aria-label', isLightMode ? 'Switch to dark mode' : 'Switch to light mode');
    }
}
