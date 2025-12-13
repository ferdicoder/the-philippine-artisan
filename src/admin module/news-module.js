// Initialize storage
let articles = [];
let currentEditId = null;
let currentImageData = null;

// Load articles from localStorage
function loadArticles() {
  const stored = localStorage.getItem('newsArticles');
  articles = stored ? JSON.parse(stored) : [];
  renderNewsList();
}

// Save articles to localStorage
function saveArticles() {
  localStorage.setItem('newsArticles', JSON.stringify(articles));
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
-0

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
function saveArticle(status) {
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
  const article = {
    id: currentEditId || Date.now().toString(),
    title,
    summary,
    body,
    image: currentImageData,
    date: dateObj.toISOString(),
    dateDisplay: dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' • ' + dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    status,
    timestamp: Date.now()
  };

  if (currentEditId) {
    const index = articles.findIndex(a => a.id === currentEditId);
    articles[index] = article;
    showAlert('Article updated successfully!', 'success');
  } else {
    articles.unshift(article);
    showAlert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`, 'success');
  }

  saveArticles();
  renderNewsList();
  clearForm();
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

  newsList.innerHTML = sortedArticles.map(article => `
    <div class="news-item ${article.status}">
      <div class="news-item-title">${article.title}</div>
      <div class="news-item-date">${article.dateDisplay}</div>
      <span class="badge badge-${article.status}">${article.status}</span>
      <div class="news-item-actions">
        <button class="btn btn-primary btn-sm" onclick="editArticle('${article.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteArticle('${article.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Edit article
window.editArticle = function(id) {
  const article = articles.find(a => a.id === id);
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
window.deleteArticle = function(id) {
  if (!confirm('Are you sure you want to delete this article?')) return;

  articles = articles.filter(a => a.id !== id);
  saveArticles();
  renderNewsList();
  showAlert('Article deleted successfully', 'success');
};

// Initialize
setDefaultDateTime();
loadArticles();