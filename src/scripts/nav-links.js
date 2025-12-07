//Sign Up Form Validation and Handling
document.addEventListener("DOMContentLoaded", function () {
    const signUpForm = document.querySelector('.signup-form');
    const pageTitle = document.title;
    
    //Handle Sign Up Form
    if (signUpForm && (pageTitle.includes('Sign Up') || pageTitle.includes('Create Account'))) {
        signUpForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const inputs = signUpForm.querySelectorAll('input[required]');
            let isValid = true;
            
            //Validate all required fields
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#d1d5db';
                }
            });
            
            if (isValid) {
                //Get form data
                const fullName = signUpForm.querySelector('input[type="text"]')?.value;
                const email = signUpForm.querySelector('input[type="email"]')?.value;
                const password = signUpForm.querySelector('input[type="password"]')?.value;
                
                //Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                
                //Validate password length
                if (password.length < 6) {
                    alert('Password must be at least 6 characters long.');
                    return;
                }
                
                //Store user data (in real app, send to server)
                const formData = {
                    fullName: fullName,
                    email: email,
                    password: password
                };
                
                localStorage.setItem('user', JSON.stringify(formData));
                
                alert('Account created successfully! Please click OK to go to Sign In page.');
                // Redirect using anchor tag click instead of window.location
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }
    
    //Handle Sign In Form
    if (signUpForm && (pageTitle.includes('Sign In') || pageTitle.includes('Welcome Back'))) {
        signUpForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const email = signUpForm.querySelector('input[type="email"]')?.value;
            const password = signUpForm.querySelector('input[type="password"]')?.value;
            const rememberMe = signUpForm.querySelector('input[type="checkbox"]')?.checked;
            
            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }
            
            //Get stored user data (in real app, validate with server)
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                
                if (userData.email === email && userData.password === password) {
                    //Store login session
                    if (rememberMe) {
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userEmail', email);
                    } else {
                        sessionStorage.setItem('isLoggedIn', 'true');
                        sessionStorage.setItem('userEmail', email);
                    }
                    
                    alert('Login successful! Welcome back, ' + userData.fullName + '! Please click OK to continue.');
                    // Redirect using anchor tag click instead of window.location
                } else {
                    alert('Invalid email or password. Please try again.');
                }
            } else {
                alert('No account found. Please sign up first.');
            }
        });
    }
});

//Check if user is logged in and update UI
document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            
            //Update header buttons if user is logged in
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.innerHTML = `
                    <span style="color: white; margin-right: 1rem;">Welcome, ${userData.fullName}!</span>
                    <a href="#" class="btn-outline" id="logoutBtn">Logout</a>
                `;
                
                //Handle logout
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        sessionStorage.removeItem('isLoggedIn');
                        sessionStorage.removeItem('userEmail');
                        alert('Logged out successfully!');
                        //Redirect using anchor tag click instead of window.location
                    });
                }
            }
        }
    }
});
