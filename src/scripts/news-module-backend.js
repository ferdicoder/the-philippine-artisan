// news-module-backend.js
// Replace your existing news-module.js with this version

const API_URL = 'http://localhost:5000/api';

// Initialize storage
let articles = [];
let currentEditId = null;
let currentImageData = null;
let token = localStorage.getItem('token');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setDefaultDateTime();
});

// Check if user is authenticated
async function checkAuth() {
  if (!token) {
    window.location.href = '../SignIn.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../SignIn.html';
      return;
    }

    // Display user info if you have a user display element
    const user = data.user;
    console.log('Logged in as:', user.name);
    
    // Load articles after authentication
    loadArticles();
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '../SignIn.html';
  }
}

// Load articles from backend
async function loadArticles() {
  try {
    const response = await fetch(`${API_URL}/articles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      articles = data.articles;
      renderNewsList();
    } else {
      showAlert('Failed to load articles', 'danger');
    }
  } catch (error) {
    console.error('Load articles error:', error);
    showAlert('Error loading articles. Please refresh the page.', 'danger');
  }
}

// Show alert
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Handle image upload
document.getElementById('image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      currentImageData = event.target.result;
      const previewContainer = document.getElementById('imagePreviewContainer');
      previewContainer.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
});

// Set default date and time
function setDefaultDateTime() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  
  document.getElementById('pubDate').value = date;
  document.getElementById('pubTime').value = time;
}

// Preview article
document.getElementById('previewBtn').addEventListener('click', function() {
  const title = document.getElementById('title').value;
  const summary = document.getElementById('summary').value;
  const body = document.getElementById('body').value;
  const date = document.getElementById('pubDate').value;
  const time = document.getElementById('pubTime').value;

  if (!title || !summary || !body) {
    showAlert('Please fill in all required fields', 'danger');
    return;
  }

  const dateObj = new Date(date + ' ' + time);
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
  preview.innerHTML = `
    ${currentImageData ? `<img src="${currentImageData}" alt="${title}">` : ''}
    <div class="preview-date">${dateStr}</div>
    <h3>${title}</h3>
    <p><strong>${summary}</strong></p>
    <div>${body}</div>
  `;
});

// Save draft
document.getElementById('saveDraft').addEventListener('click', function() {
  saveArticle('draft');
});

// Publish article
document.getElementById('publish').addEventListener('click', function() {
  saveArticle('published');
});

// Save article function
async function saveArticle(status) {
  const title = document.getElementById('title').value;
  const summary = document.getElementById('summary').value;
  const body = document.getElementById('body').value;
  const date = document.getElementById('pubDate').value;
  const time = document.getElementById('pubTime').value;

  if (!title || !summary || !body || !date || !time) {
    showAlert('Please fill in all required fields', 'danger');
    return;
  }

  if (!currentImageData) {
    showAlert('Please select a feature image', 'danger');
    return;
  }

  const dateObj = new Date(date + ' ' + time);
  const articleData = {
    title,
    summary,
    body,
    image: currentImageData,
    date: dateObj.toISOString(),
    status
  };

  try {
    const url = currentEditId 
      ? `${API_URL}/articles/${currentEditId}` 
      : `${API_URL}/articles`;
    
    const method = currentEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });

    const data = await response.json();

    if (data.success) {
      showAlert(data.message, 'success');
      loadArticles();
      clearForm();
    } else {
      showAlert(data.message || 'Failed to save article', 'danger');
    }
  } catch (error) {
    console.error('Save article error:', error);
    showAlert('Network error. Please try again.', 'danger');
  }
}

// Clear form
document.getElementById('clearBtn').addEventListener('click', clearForm);

function clearForm() {
  document.getElementById('newsForm').reset();
  document.getElementById('imagePreviewContainer').innerHTML = '';
  document.getElementById('preview').innerHTML = '<div class="muted">Fill the form above and click "Preview" to see how your article will look.</div>';
  currentImageData = null;
  currentEditId = null;
  setDefaultDateTime();
}

// Render news list
function renderNewsList() {
  const newsList = document.getElementById('newsList');
  
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
          <button class="btn btn-primary btn-sm" onclick="editArticle('${article._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteArticle('${article._id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Edit article
window.editArticle = function(id) {
  const article = articles.find(a => a._id === id);
  if (!article) return;

  currentEditId = id;
  currentImageData = article.image;

  document.getElementById('title').value = article.title;
  document.getElementById('summary').value = article.summary;
  document.getElementById('body').value = article.body;
  
  const dateObj = new Date(article.date);
  document.getElementById('pubDate').value = dateObj.toISOString().split('T')[0];
  document.getElementById('pubTime').value = dateObj.toTimeString().slice(0, 5);

  document.getElementById('imagePreviewContainer').innerHTML = 
    `<img src="${article.image}" alt="Preview">`;

  showAlert('Article loaded for editing', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete article
window.deleteArticle = async function(id) {
  if (!confirm('Are you sure you want to delete this article?')) return;

  try {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Article deleted successfully', 'success');
      loadArticles();
    } else {
      showAlert(data.message || 'Failed to delete article', 'danger');
    }
  } catch (error) {
    console.error('Delete article error:', error);
    showAlert('Network error. Please try again.', 'danger');
  }
};

// Logout function (add a logout button in your HTML if needed)
window.logout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../SignIn.html';
};