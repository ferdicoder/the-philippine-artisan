/**
 * Admin Profile Page Handler
 * Manages admin profile display and updates
 */

const API_URL = '/the-philippine-artisan/src/php/api';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    if (!isAdminLoggedIn()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '../index.html';
        return;
    }

    // Load admin profile data
    loadAdminProfile();

    // Setup form handlers
    setupProfileForm();
    setupPasswordForm();
    setupLogoutButton();
});

/**
 * Check if admin is logged in
 */
function isAdminLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) return false;
    
    try {
        const userData = JSON.parse(user);
        return userData.role && userData.role.toLowerCase() === 'admin';
    } catch (e) {
        return false;
    }
}

/**
 * Get current admin user from localStorage
 */
function getAdminData() {
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
 * Load admin profile data into the page
 */
function loadAdminProfile() {
    const admin = getAdminData();
    
    if (!admin) {
        showAlert('Failed to load admin data.', 'error');
        return;
    }

    // Update sidebar
    document.getElementById('adminName').textContent = admin.name || 'Admin';
    document.getElementById('adminEmail').textContent = admin.email || '';

    // Update avatar with initials
    const avatarImg = document.getElementById('adminAvatar');
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || 'Admin')}&background=8B0000&color=fff&size=150`;

    // Populate edit form
    document.getElementById('editAdminName').value = admin.name || '';
    document.getElementById('editAdminEmail').value = admin.email || '';
    document.getElementById('editAdminBio').value = admin.bio || '';
    document.getElementById('editDepartment').value = admin.department || '';

    // Update statistics
    updateAdminStats(admin);

    // Load recent activity
    loadRecentActivity();
}

/**
 * Update admin statistics
 */
function updateAdminStats(admin) {
    // These would normally come from the API
    document.getElementById('totalArticles').textContent = admin.articlesCount || 0;
    document.getElementById('totalUsers').textContent = admin.usersManaged || 0;
    
    // Format admin since date
    if (admin.created_at) {
        const date = new Date(admin.created_at);
        const options = { year: 'numeric', month: 'short' };
        document.getElementById('adminSince').textContent = date.toLocaleDateString('en-US', options);
    } else {
        document.getElementById('adminSince').textContent = 'N/A';
    }

    // Last login
    if (admin.last_login) {
        const date = new Date(admin.last_login);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('lastLogin').textContent = date.toLocaleDateString('en-US', options);
    } else {
        document.getElementById('lastLogin').textContent = 'Now';
    }
}

/**
 * Load recent activity
 */
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    
    // Demo activity data - in production, this would come from API
    const activities = [
        { text: 'Updated profile information', time: 'Just now' },
        { text: 'Published new article', time: '2 hours ago' },
        { text: 'Edited user permissions', time: 'Yesterday' }
    ];

    if (activities.length > 0) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Setup profile edit form
 */
function setupProfileForm() {
    const form = document.getElementById('adminProfileForm');
    const cancelBtn = document.getElementById('cancelProfileEdit');
    const editBtn = document.getElementById('editProfileBtn');

    // Toggle edit mode
    editBtn.addEventListener('click', function() {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = !input.disabled;
        });
        editBtn.textContent = inputs[0].disabled ? 'Edit' : 'Cancel Edit';
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('editAdminName').value.trim();
        const email = document.getElementById('editAdminEmail').value.trim();
        const bio = document.getElementById('editAdminBio').value.trim();
        const department = document.getElementById('editDepartment').value.trim();

        if (!name || !email) {
            showAlert('Name and email are required.', 'error');
            return;
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            showAlert('Please enter a valid email address.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const admin = getAdminData();
            
            const response = await fetch(`${API_URL}/users/user.php?id=${admin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, bio, department })
            });

            const data = await response.json();

            if (data.success) {
                // Update local storage
                const updatedAdmin = { ...admin, name, email, bio, department };
                localStorage.setItem('user', JSON.stringify(updatedAdmin));
                
                // Reload profile display
                loadAdminProfile();
                showAlert('Profile updated successfully!', 'success');
            } else {
                showAlert(data.message || 'Failed to update profile.', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            
            // For demo purposes, update locally if API fails
            const admin = getAdminData();
            const updatedAdmin = { ...admin, name, email, bio, department };
            localStorage.setItem('user', JSON.stringify(updatedAdmin));
            loadAdminProfile();
            showAlert('Profile updated locally!', 'success');
        }
    });

    cancelBtn.addEventListener('click', function() {
        // Reset form to original values
        loadAdminProfile();
    });
}

/**
 * Setup password change form
 */
function setupPasswordForm() {
    const form = document.getElementById('adminPasswordForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('adminCurrentPassword').value;
        const newPassword = document.getElementById('adminNewPassword').value;
        const confirmPassword = document.getElementById('adminConfirmPassword').value;

        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('All password fields are required.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showAlert('New password must be at least 6 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const admin = getAdminData();

            const response = await fetch(`${API_URL}/users/user.php?id=${admin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                form.reset();
                showAlert('Password updated successfully!', 'success');
            } else {
                showAlert(data.message || 'Failed to update password.', 'error');
            }
        } catch (error) {
            console.error('Password update error:', error);
            showAlert('Network error. Please try again.', 'error');
        }
    });
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('sidebarLogout');

    logoutBtn.addEventListener('click', function() {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        sessionStorage.clear();
        
        // Show logout message
        alert('You have been logged out successfully.');
        
        // Redirect to home page
        window.location.href = '../index.html';
    });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Insert at the top of main content
    const profileMain = document.querySelector('.profile-main');
    const pageHeader = document.querySelector('.page-header');
    profileMain.insertBefore(alert, pageHeader.nextSibling);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
