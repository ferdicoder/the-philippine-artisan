console.log("JS loaded");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".newsletter form");
  console.log("Form found:", form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
  });
});
