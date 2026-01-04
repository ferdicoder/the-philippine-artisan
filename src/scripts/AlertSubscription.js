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
  // Handle newsletter visibility based on login status
  handleNewsletterVisibility();
  
  const form = document.querySelector(".newsletter form");
  console.log("Form found:", form);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Double-check user is logged in before allowing subscription
      if (!isUserLoggedIn()) {
        alert("Please log in or create an account to subscribe to our newsletter.");
        return;
      }
      
      alert("Thank you for subscribing!");
    });
  }
});
