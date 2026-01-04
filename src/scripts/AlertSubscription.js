console.log("JS loaded");

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return token && user;
}

/**
 * Hide newsletter section for guest users
 */
function handleNewsletterVisibility() {
  const newsletterSection = document.querySelector(".newsletter");
  
  if (newsletterSection) {
    if (!isUserLoggedIn()) {
      // Hide newsletter for guest users
      newsletterSection.style.display = 'none';
    } else {
      // Show newsletter for logged-in users
      newsletterSection.style.display = '';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  handleNewsletterVisibility();
  const form = document.querySelector(".newsletter form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[name="email"]');
      const email = emailInput ? emailInput.value : '';
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      // Optional: check login status
      // if (!isUserLoggedIn()) {
      //   alert("Please log in or create an account to subscribe to our newsletter.");
      //   if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
      //   return;
      // }

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email })
      })
      .then(response => response.text())
      .then(text => {
        if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
        form.reset();
        if (text && text.trim()) {
          if (text.includes('Email Sent')) {
            alert('Thank you for subscribing!');
          } else {
            alert(text);
          }
        }
      })
      .catch(err => {
        alert('An error occurred. Please try again.');
        if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
      });
    });
  }
});
