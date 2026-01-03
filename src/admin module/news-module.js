/**
 * News Module - Backend Connected Version
 * Publishes articles to PHP backend API
 * Articles will automatically appear on headlines page
 */

// API Configuration - Use relative path from admin module folder
// AddNews.html is at: /src/admin module/AddNews.html
// API is at: /src/php/api/articles/
// So we go up one level (../) then to php/api/articles/
const API_BASE = '../php/api/articles/';

// State
let articles = [];
let currentEditId = null;
let currentImageData = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize
  setDefaultDateTime();
  loadArticles();
  setupEventListeners();
  
  console.log('News module initialized with backend connection!');
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Image upload handler
  const imageInput = document.getElementById('image');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }

  // Preview button
  const previewBtn = document.getElementById('previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', previewArticle);
  }

  // Save draft button
  const saveDraftBtn = document.getElementById('saveDraft');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => saveArticle('draft'));
  }

  // Publish button
  const publishBtn = document.getElementById('publish');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => saveArticle('published'));
  }

  // Clear button
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
  }
}

/**
 * Load articles from backend API
 */
async function loadArticles() {
  try {
    showLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // First try to get all articles (including drafts)
    const response = await fetch(`${API_BASE}index.php?all=true`, { headers });
    const data = await response.json();
    
    if (data.success && data.data.articles) {
      articles = data.data.articles;
      renderNewsList();
    } else {
      // If unauthorized or error, try public endpoint
      const publicResponse = await fetch(`${API_BASE}index.php`);
      const publicData = await publicResponse.json();
      
      if (publicData.success && publicData.data.articles) {
        articles = publicData.data.articles;
        renderNewsList();
      }
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    showAlert('Failed to load articles. Please refresh the page.', 'danger');
  } finally {
    showLoading(false);
  }
}

/**
 * Save article to backend (create or update)
 */
async function saveArticle(status) {
  const title = document.getElementById('title').value;
  const summary = document.getElementById('summary').value;
  const body = document.getElementById('body').value;
  const date = document.getElementById('pubDate').value;
  const time = document.getElementById('pubTime').value;

  // Validation
  if (!title || !summary || !body || !date || !time) {
    showAlert('Please fill in all required fields', 'danger');
    return;
  }

  if (!currentImageData) {
    showAlert('Please select a feature image', 'danger');
    return;
  }

  const dateObj = new Date(date + 'T' + time);
  
  const articleData = {
    title,
    summary,
    body,
    image: currentImageData,
    date: dateObj.toISOString(),
    status
  };

  try {
    showLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    if (!token) {
      showAlert('You must be logged in to publish articles. Please sign in.', 'danger');
      showLoading(false);
      return;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('Request headers:', headers);
    console.log('API URL:', currentEditId ? `${API_BASE}article.php?id=${currentEditId}` : `${API_BASE}index.php`);
    
    let response;
    if (currentEditId) {
      // Update existing article
      response = await fetch(`${API_BASE}article.php?id=${currentEditId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(articleData)
      });
    } else {
      // Create new article
      response = await fetch(`${API_BASE}index.php`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(articleData)
      });
    }

    // Log response for debugging
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      const action = currentEditId ? 'updated' : (status === 'published' ? 'published' : 'saved as draft');
      showAlert(`Article ${action} successfully! Headlines will now show this article.`, 'success');
      clearForm();
      await loadArticles(); // Reload the list
    } else {
      console.error('Server error:', data.message);
      showAlert(data.message || 'Failed to save article', 'danger');
    }
  } catch (error) {
    console.error('Error saving article:', error);
    console.error('Error details:', error.message);
    showAlert('Network error: ' + error.message, 'danger');
  } finally {
    showLoading(false);
  }
}

/**
 * Delete article from backend
 */
window.deleteArticle = async function(id) {
  if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return;

  try {
    showLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('You must be logged in to delete articles. Please sign in.', 'danger');
      showLoading(false);
      return;
    }
    
    const response = await fetch(`${API_BASE}article.php?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Article deleted successfully', 'success');
      await loadArticles();
    } else {
      showAlert(data.message || 'Failed to delete article', 'danger');
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    showAlert('Network error. Please try again.', 'danger');
  } finally {
    showLoading(false);
  }
};

/**
 * Edit article - load into form
 */
window.editArticle = function(id) {
  const article = articles.find(a => a.id === id);
  if (!article) {
    showAlert('Article not found', 'danger');
    return;
  }

  currentEditId = id;
  currentImageData = article.image;

  document.getElementById('title').value = article.title;
  document.getElementById('summary').value = article.summary;
  document.getElementById('body').value = article.body;
  
  const dateObj = new Date(article.date);
  document.getElementById('pubDate').value = dateObj.toISOString().split('T')[0];
  document.getElementById('pubTime').value = dateObj.toTimeString().slice(0, 5);

  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  if (imagePreviewContainer) {
    imagePreviewContainer.innerHTML = `<img src="${getImagePath(article.image)}" alt="Preview">`;
  }

  showAlert('Article loaded for editing. Make changes and click Save/Publish.', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Handle image upload
 */
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    // Check file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      showAlert('Image too large. Please use an image under 2MB.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      currentImageData = event.target.result;
      const previewContainer = document.getElementById('imagePreviewContainer');
      if (previewContainer) {
        previewContainer.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Preview article
 */
function previewArticle() {
  const title = document.getElementById('title').value;
  const summary = document.getElementById('summary').value;
  const body = document.getElementById('body').value;
  const date = document.getElementById('pubDate').value;
  const time = document.getElementById('pubTime').value;

  if (!title || !summary || !body) {
    showAlert('Please fill in all required fields to preview', 'danger');
    return;
  }

  const dateObj = new Date(date + 'T' + time);
  const dateStr = dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) + ' • ' + dateObj.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const preview = document.getElementById('preview');
  if (preview) {
    preview.innerHTML = `
      ${currentImageData ? `<img src="${currentImageData}" alt="${title}">` : ''}
      <div class="preview-date">${dateStr}</div>
      <h3>${title}</h3>
      <p><strong>${summary}</strong></p>
      <div>${body}</div>
    `;
  }
}

/**
 * Clear form
 */
function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('summary').value = '';
  document.getElementById('body').value = '';
  document.getElementById('image').value = '';
  
  const imagePreview = document.getElementById('imagePreviewContainer');
  const preview = document.getElementById('preview');
  
  if (imagePreview) imagePreview.innerHTML = '';
  if (preview) preview.innerHTML = '<div class="muted">Fill the form above and click "Preview" to see how your article will look.</div>';
  
  currentImageData = null;
  currentEditId = null;
  setDefaultDateTime();
}

/**
 * Set default date and time to now
 */
function setDefaultDateTime() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  
  const pubDateEl = document.getElementById('pubDate');
  const pubTimeEl = document.getElementById('pubTime');
  
  if (pubDateEl) pubDateEl.value = date;
  if (pubTimeEl) pubTimeEl.value = time;
}

/**
 * Render the news list
 */
function renderNewsList() {
  const newsList = document.getElementById('newsList');
  if (!newsList) return;
  
  if (articles.length === 0) {
    newsList.innerHTML = '<div class="muted">No articles yet. Create your first one!</div>';
    return;
  }

  // Sort by date, newest first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  newsList.innerHTML = sortedArticles.map(article => {
    const dateObj = new Date(article.date);
    const dateDisplay = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' • ' + dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    return `
      <div class="news-item ${article.status}">
        <div class="news-item-title">${article.title}</div>
        <div class="news-item-date">${dateDisplay}</div>
        <span class="badge badge-${article.status}">${article.status}</span>
        <div class="news-item-actions">
          <button class="btn btn-primary btn-sm" onclick="editArticle('${article.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteArticle('${article.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;margin-left:10px;">&times;</button>
  `;
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  const newsList = document.getElementById('newsList');
  if (!newsList) return;
  
  if (show) {
    newsList.innerHTML = '<div class="muted">Loading articles...</div>';
  }
}

/**
 * Get correct image path for display
 */
function getImagePath(imagePath) {
  if (!imagePath) return '';
  
  // Data URLs and full URLs are returned as-is
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For relative paths, adjust based on current location
  if (imagePath.startsWith('assets/')) {
    return '../../' + imagePath;
  }
  
  return imagePath;
}