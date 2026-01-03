/**
 * Dynamic Navigation Handler
 * Updates navigation links based on user authentication status and role
 * 
 * For logged-in users: Replaces "More" with "User Profile" and "Publish News"
 * For logged-in admins: Replaces "More" with "Dashboard", "Admin Profile", and "Publish News"
 * For logged-out users: Shows default navigation with "More"
 */

document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    updateHeaderActions();
});

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Check if current user is an admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role && user.role.toLowerCase() === 'admin';
}

/**
 * Get the base path based on current page location
 */
function getBasePath() {
    const path = window.location.pathname;
    
    // If we're in admin module folder
    if (path.includes('/admin module/') || path.includes('/admin%20module/')) {
        return '../../';
    }
    // If we're in src folder
    if (path.includes('/src/')) {
        return '../';
    }
    // If we're in root folder
    return '';
}

/**
 * Get the src path based on current page location
 */
function getSrcPath() {
    const path = window.location.pathname;
    
    // If we're in admin module folder
    if (path.includes('/admin module/') || path.includes('/admin%20module/')) {
        return '../';
    }
    // If we're in src folder
    if (path.includes('/src/')) {
        return '';
    }
    // If we're in root folder
    return 'src/';
}

/**
 * Update navigation based on login status and role
 */
function updateNavigation() {
    const navUl = document.querySelector('.nav ul');
    if (!navUl) return;

    const basePath = getBasePath();
    const srcPath = getSrcPath();

    // Get all navigation items
    const navItems = navUl.querySelectorAll('li');
    
    // Find and update the "More" link or replace navigation
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && (link.textContent.trim().toLowerCase() === 'more' || 
                     link.href.includes('AddNews') || 
                     link.href.includes('#more'))) {
            
            if (isLoggedIn()) {
                const user = getCurrentUser();
                
                if (isAdmin()) {
                    // Admin navigation: Dashboard, Admin Profile, Publish News
                    const adminNav = createAdminNavItems(basePath, srcPath);
                    item.parentNode.replaceChild(adminNav, item);
                } else {
                    // Regular user navigation: User Profile, Publish News
                    const userNav = createUserNavItems(basePath, srcPath);
                    item.parentNode.replaceChild(userNav, item);
                }
            }
            // If not logged in, keep the default "More" link
        }
    });
}

/**
 * Create navigation items for admin users
 */
function createAdminNavItems(basePath, srcPath) {
    const fragment = document.createDocumentFragment();
    
    // Dashboard link
    const dashboardLi = document.createElement('li');
    const dashboardLink = document.createElement('a');
    dashboardLink.href = srcPath + 'Admin.html';
    dashboardLink.textContent = 'Dashboard';
    dashboardLi.appendChild(dashboardLink);
    fragment.appendChild(dashboardLi);
    
    // Admin Profile link
    const profileLi = document.createElement('li');
    const profileLink = document.createElement('a');
    profileLink.href = srcPath + 'admin-profile.html';
    profileLink.textContent = 'Admin Profile';
    profileLi.appendChild(profileLink);
    fragment.appendChild(profileLi);
    
    // Publish News link
    const publishLi = document.createElement('li');
    const publishLink = document.createElement('a');
    publishLink.href = srcPath + 'admin module/AddNews.html';
    publishLink.textContent = 'Publish News';
    publishLi.appendChild(publishLink);
    fragment.appendChild(publishLi);
    
    return fragment;
}

/**
 * Create navigation items for regular users
 */
function createUserNavItems(basePath, srcPath) {
    const fragment = document.createDocumentFragment();
    
    // User Profile link
    const profileLi = document.createElement('li');
    const profileLink = document.createElement('a');
    profileLink.href = basePath + 'user-profile.html';
    profileLink.textContent = 'User Profile';
    profileLi.appendChild(profileLink);
    fragment.appendChild(profileLi);
    
    // Publish News link
    const publishLi = document.createElement('li');
    const publishLink = document.createElement('a');
    publishLink.href = srcPath + 'admin module/AddNews.html';
    publishLink.textContent = 'Publish News';
    publishLi.appendChild(publishLink);
    fragment.appendChild(publishLi);
    
    return fragment;
}

/**
 * Update header action buttons based on login status
 */
function updateHeaderActions() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const basePath = getBasePath();
    const srcPath = getSrcPath();

    if (isLoggedIn()) {
        const user = getCurrentUser();
        const userName = user ? user.name : 'User';
        
        // Clear existing buttons
        headerActions.innerHTML = '';
        
        // Add welcome message
        const welcomeSpan = document.createElement('span');
        welcomeSpan.className = 'welcome-text';
        welcomeSpan.textContent = `Hi, ${userName}`;
        welcomeSpan.style.cssText = 'margin-right: 15px; color: #333; font-weight: 500;';
        headerActions.appendChild(welcomeSpan);
        
        // Add logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-filled logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = handleLogout;
        headerActions.appendChild(logoutBtn);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    
    // Show logout message
    alert('You have been logged out successfully.');
    
    // Redirect to home page
    const basePath = getBasePath();
    window.location.href = basePath + 'index.html';
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isLoggedIn,
        getCurrentUser,
        isAdmin,
        handleLogout
    };
}
