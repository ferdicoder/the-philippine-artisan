/**
 * Article Viewer Script
 * Dynamically loads and displays article content based on URL parameter
 */

const ARTICLES_API = '../src/php/api/articles/';

document.addEventListener('DOMContentLoaded', function() {
  loadArticle();
});

/**
 * Get article ID from URL query parameter
 */
function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * Load article from backend
 */
async function loadArticle() {
  const articleId = getArticleId();
  
  if (!articleId) {
    showError('No article specified');
    return;
  }
  
  try {
    const response = await fetch(`${ARTICLES_API}article.php?id=${articleId}`);
    const data = await response.json();
    
    if (data.success && data.data.article) {
      renderArticle(data.data.article);
      loadRelatedArticles(articleId);
    } else {
      showError(data.message || 'Article not found');
    }
  } catch (error) {
    console.error('Error loading article:', error);
    showError('Failed to load article. Please try again later.');
  }
}

/**
 * Render the article content
 */
function renderArticle(article) {
  const container = document.getElementById('articleContent');
  const dateStr = formatDate(article.date);
  
  // Update page title
  document.title = `${article.title} | The Philippine Artisan`;
  
  // Get the correct image path
  const imagePath = getImagePath(article.image);
  
  container.innerHTML = `
    <h1 class="news-title">${article.title}</h1>
    <p class="news-meta">${article.author || 'The Philippine Artisan'} • ${dateStr}</p>
    
    ${imagePath ? `
    <div class="news-image">
      <img src="${imagePath}" alt="${article.title}">
    </div>
    ` : ''}
    
    <div class="news-body">
      ${article.body}
      <p class="hashtag">#ThePhilippineArtisan</p>
    </div>
  `;
}

/**
 * Load related articles
 */
async function loadRelatedArticles(currentArticleId) {
  try {
    const response = await fetch(`${ARTICLES_API}index.php?limit=4`);
    const data = await response.json();
    
    if (data.success && data.data.articles) {
      // Filter out the current article and take up to 3
      const related = data.data.articles
        .filter(article => article.id !== currentArticleId)
        .slice(0, 3);
      
      if (related.length > 0) {
        renderRelatedArticles(related);
      }
    }
  } catch (error) {
    console.error('Error loading related articles:', error);
  }
}

/**
 * Render related articles
 */
function renderRelatedArticles(articles) {
  const section = document.getElementById('relatedSection');
  const container = document.getElementById('relatedArticles');
  
  container.innerHTML = articles.map(article => {
    const dateStr = formatDate(article.date);
    const imagePath = getImagePath(article.image);
    
    return `
      <a href="article.html?id=${article.id}" class="related-item">
        <div class="related-inner">
          <img src="${imagePath}" alt="${article.title}">
          <div class="related-info">
            <p class="related-date">${dateStr}</p>
            <h3 class="related-title">${truncateText(article.title, 80)}</h3>
          </div>
        </div>
      </a>
    `;
  }).join('');
  
  section.style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('articleContent');
  container.innerHTML = `
    <div class="error-message">
      <h2>Oops!</h2>
      <p>${message}</p>
      <p><a href="../headlines.html">← Back to Headlines</a></p>
    </div>
  `;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString('en-US', options) + ' at ' + 
         date.toLocaleTimeString('en-US', timeOptions);
}

/**
 * Get correct image path
 */
function getImagePath(imagePath) {
  if (!imagePath) return '../assets/placeholder.jpg';
  
  // If it's already a full URL or data URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Add ../ prefix for relative paths from src folder
  if (imagePath.startsWith('assets/')) {
    return '../' + imagePath;
  }
  
  return imagePath;
}

/**
 * Truncate text
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
