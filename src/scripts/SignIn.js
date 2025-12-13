// SignIn.js - Complete Standalone Version
// Works WITHOUT backend - Uses localStorage only
// Place this in: scripts/SignIn.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.signup-form') || document.querySelector('.signin-form');
  
  if (!form) {
    console.error('Form not found!');
    return;
  }

  const emailInput = form.querySelector('input[name="email"]') || form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[name="password"]') || form.querySelector('input[type="password"]');
  const submitButton = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');

  // Create alert container if it doesn't exist
  let alertContainer = document.querySelector('.alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    document.body.insertBefore(alertContainer, document.body.firstChild);
  }

  // Show alert function
  function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${message}</span>
      <button class="alert-close">&times;</button>
    `;
    
    alertContainer.appendChild(alert);

    // Add close functionality
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
      alert.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }

  // Validate form
  function validateForm() {
    const errors = [];

    if (!emailInput || !emailInput.value.trim()) {
      errors.push('Email is required');
      if (emailInput) emailInput.style.borderColor = '#ef4444';
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      errors.push('Please enter a valid email address');
      emailInput.style.borderColor = '#ef4444';
    } else {
      emailInput.style.borderColor = '';
    }

    if (!passwordInput || !passwordInput.value) {
      errors.push('Password is required');
      if (passwordInput) passwordInput.style.borderColor = '#ef4444';
    } else {
      passwordInput.style.borderColor = '';
    }

    return errors;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => showAlert(error, 'error'));
      return;
    }

    // Disable submit button and show loading
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Find user with matching email
      const user = users.find(u => u.email === emailInput.value.trim().toLowerCase());

      if (!user) {
        showAlert('No account found with this email. Please sign up first.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
      }

      // Check password
      if (user.password !== passwordInput.value) {
        showAlert('Incorrect password. Please try again.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
      }

      // Create token and save user session
      const token = 'user_' + user.id;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));

      // Show success message
      showAlert(`Welcome back, ${user.name}! Redirecting...`, 'success');

      // Clear form
      form.reset();

      // Redirect to AddNews page after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'Admin/AddNews.html';
      }, 1500);

    } catch (error) {
      console.error('Sign in error:', error);
      showAlert('An error occurred. Please try again.', 'error');
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  // Real-time validation feedback
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !/\S+@\S+\.\S+/.test(emailInput.value)) {
        emailInput.style.borderColor = '#ef4444';
      } else {
        emailInput.style.borderColor = '';
      }
    });

    emailInput.addEventListener('focus', () => {
      emailInput.style.borderColor = '';
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('focus', () => {
      passwordInput.style.borderColor = '';
    });
  }
});