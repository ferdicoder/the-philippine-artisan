document.addEventListener("DOMContentLoaded", function () {
    //Sign Up buttons
    const signUpButtons = document.querySelectorAll(".btn-outline");
    signUpButtons.forEach(button => {
        button.addEventListener("click", function () {
            window.location.href = "SignUp.html";
        });
    });

    //Sign In / Log In buttons
    const signInButtons = document.querySelectorAll(".btn-filled");
    signInButtons.forEach(button => {
        const buttonText = button.textContent.trim().toLowerCase();
        if (buttonText === "sign in" || buttonText === "log in") {
            button.addEventListener("click", function () {
                window.location.href = "SignIn.html";
            });
        }
    });
});
