// SignIn.js - PHP Backend Integration
// Connected to: /src/php/api/auth/login.php

const API_URL = '/the-philippine-artisan/src/php/api';

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
      // Make API request to PHP backend
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user to localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Show success message
        showAlert(`Welcome back, ${data.data.user.name}! Redirecting...`, 'success');

        // Clear form
        form.reset();

        // Redirect to Admin Dashboard after 1.5 seconds
        setTimeout(() => {
          window.location.href = 'Admin.html';
        }, 1500);
      } else {
        // Show error message from server
        showAlert(data.message || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showAlert('Network error. Please check if XAMPP Apache is running.', 'error');
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