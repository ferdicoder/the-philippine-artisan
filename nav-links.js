document.addEventListener("DOMContentLoaded", function () {
    const signUpButtons = document.querySelectorAll(".btn-outline");

    signUpButtons.forEach(button => {
        button.addEventListener("click", function () {
            window.location.href = "SignUp.html";
        });
    });
});
