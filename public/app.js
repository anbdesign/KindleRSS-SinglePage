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
                    </div>
                    <div class="article-content">
                        ${generateArticleContent(article)}
                    </div>
                    ${debugSection}
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
    const feedArea = document.getElementById(`feed-${feedIndex}`);
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
    const articleView = document.getElementById(`article-${feedIndex}-${articleIndex}`);
    if (articleView) {
        articleView.classList.add('active');
    }
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
