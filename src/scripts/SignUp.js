// SignUp.js - PHP Backend Integration


const API_URL = '/the-philippine-artisan/src/php/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.signup-form');
  const nameInput = form.querySelector('input[name="name"]') || form.querySelector('input[type="text"]');
  const emailInput = form.querySelector('input[name="email"]') || form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[name="password"]') || form.querySelector('input[type="password"]');
  const submitButton = form.querySelector('.btn-submit');

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

    if (!nameInput.value.trim()) {
      errors.push('Full name is required');
    }

    if (!emailInput.value.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      errors.push('Please enter a valid email address');
    }

    if (!passwordInput.value) {
      errors.push('Password is required');
    } else if (passwordInput.value.length < 6) {
      errors.push('Password must be at least 6 characters long');
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
    submitButton.textContent = 'Creating Account...';

    try {
      // Make API request to PHP backend
      const response = await fetch(`${API_URL}/auth/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput.value.trim(),
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
        showAlert('Account created successfully! Redirecting...', 'success');

        // Redirect to Admin Dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = 'Admin.html';
        }, 2000);
      } else {
        // Show error message from server
        showAlert(data.message || 'Sign up failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showAlert('Network error. Please check if XAMPP Apache is running.', 'error');
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Sign Up';
    }
  });

  // Real-time validation feedback
  emailInput.addEventListener('blur', () => {
    if (emailInput.value && !/\S+@\S+\.\S+/.test(emailInput.value)) {
      emailInput.style.borderColor = '#ef4444';
    } else {
      emailInput.style.borderColor = '';
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value && passwordInput.value.length < 6) {
      passwordInput.style.borderColor = '#ef4444';
    } else {
      passwordInput.style.borderColor = '';
    }
  });
});