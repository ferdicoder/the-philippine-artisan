/**
 * Headlines Dynamic Content Loader
 * Fetches articles from backend API and renders them on headlines and home pages
 */

const ARTICLES_API = 'src/php/api/articles/index.php';

// Store fetched articles globally
let headlineArticles = [];

/**
 * Initialize headlines on page load
 */
document.addEventListener('DOMContentLoaded', function() {
  loadHeadlines();
});

/**
 * Fetch articles from the backend API
 */
async function loadHeadlines() {
  try {
    const response = await fetch(ARTICLES_API);
    const data = await response.json();
    
    if (data.success && data.data.articles) {
      headlineArticles = data.data.articles;
      renderHeadlines(headlineArticles);
    } else {
      console.error('Failed to load articles:', data.message);
      // Keep the static content as fallback
    }
  } catch (error) {
    console.error('Error fetching headlines:', error);
    // Keep the static content as fallback
  }
}

/**
 * Render headlines into the page
 */
function renderHeadlines(articles) {
  if (articles.length === 0) return;
  
  // Check which page we're on
  const isHomePage = document.querySelector('.main-headline-section');
  const isHeadlinesPage = document.querySelector('.headlines-grid');
  
  if (isHeadlinesPage) {
    renderHeadlinesPage(articles);
  } else if (isHomePage) {
    renderHomePage(articles);
  }
}

/**
 * Render headlines for the headlines.html page
 */
function renderHeadlinesPage(articles) {
  const mainHeadlineLink = document.querySelector('.main-headline-link');
  const sideHeadlines = document.querySelector('.side-headlines');
  
  if (!mainHeadlineLink || !sideHeadlines) return;
  
  // Get the first (newest) article for main headline
  const mainArticle = articles[0];
  
  if (mainArticle) {
    const mainDateStr = formatDate(mainArticle.date);
    mainHeadlineLink.href = `src/article.html?id=${mainArticle.id}`;
    mainHeadlineLink.innerHTML = `
      <div class="main-headline">
        <img src="${getImagePath(mainArticle.image)}" alt="${mainArticle.title}">
        <div class="main-info">
          <p class="main-date">${mainDateStr}</p>
          <h2 class="main-title">${mainArticle.title}</h2>
          <p class="main-desc">${mainArticle.summary}</p>
        </div>
      </div>
    `;
  }
  
  // Get remaining articles for side headlines
  const sideArticles = articles.slice(1, 4);
  
  if (sideArticles.length > 0) {
    sideHeadlines.innerHTML = sideArticles.map(article => {
      const dateStr = formatDate(article.date);
      return `
        <a href="src/article.html?id=${article.id}" class="side-row-link">
          <div class="side-row">
            <img src="${getImagePath(article.image)}" alt="${article.title}">
            <div class="side-info">
              <p class="side-date">${dateStr}</p>
              <h3 class="side-title">${article.title}</h3>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }
}

/**
 * Render headlines for the index.html (home) page
 */
function renderHomePage(articles) {
  const mainHeadline = document.querySelector('.main-headline');
  const sideNews = document.querySelector('.left-news');
  
  if (!mainHeadline) return;
  
  // Get the first (newest) article for main headline
  const mainArticle = articles[0];
  
  if (mainArticle) {
    const mainDateStr = formatDate(mainArticle.date);
    mainHeadline.innerHTML = `
      <a href="src/article.html?id=${mainArticle.id}" style="text-decoration: none; color: inherit;">
        <img src="${getImagePath(mainArticle.image)}" alt="${mainArticle.title}">
        <div class="main-info">
          <p class="date">${mainDateStr}</p>
          <h2>${truncateText(mainArticle.title, 60)}</h2>
          <p>${truncateText(mainArticle.summary, 100)}</p>
        </div>
      </a>
    `;
  }
  
  // Get remaining articles for side news
  if (sideNews) {
    const sideArticles = articles.slice(1, 4);
    const sideTitle = sideNews.querySelector('.side-title');
    
    // Clear existing cards but keep the title
    const existingCards = sideNews.querySelectorAll('.side-card');
    existingCards.forEach(card => card.remove());
    
    // Add new cards after the title
    sideArticles.forEach(article => {
      const dateStr = formatDate(article.date);
      const cardHTML = `
        <a href="src/article.html?id=${article.id}" class="side-card">
          <img src="${getImagePath(article.image)}" alt="${article.title}">
          <div>
            <p class="date">${dateStr}</p>
            <h3>${truncateText(article.title, 50)}</h3>
          </div>
        </a>
      `;
      sideNews.insertAdjacentHTML('beforeend', cardHTML);
    });
  }
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
  
  return date.toLocaleDateString('en-US', options) + ' • ' + 
         date.toLocaleTimeString('en-US', timeOptions);
}

/**
 * Get correct image path based on current page location
 */
function getImagePath(imagePath) {
  if (!imagePath) return 'assets/placeholder.jpg';
  
  // If it's already a full URL or data URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Check if we're in a subdirectory
  const isSubdirectory = window.location.pathname.includes('/src/');
  
  // If the path already starts with assets/ and we're on the root
  if (imagePath.startsWith('assets/') && !isSubdirectory) {
    return imagePath;
  }
  
  // If we're in a subdirectory, prepend ../
  if (isSubdirectory && !imagePath.startsWith('../')) {
    return '../' + imagePath;
  }
  
  return imagePath;
}

/**
 * Truncate text to a maximum length
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Export for use in other modules
 */
window.HeadlinesModule = {
  loadHeadlines,
  getArticles: () => headlineArticles
};
