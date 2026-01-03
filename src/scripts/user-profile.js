/**
 * User Profile Page Handler
 * Manages user profile display and updates
 */

// Use relative path - user-profile.html is at root level, API is at /src/php/api
const API_URL = 'src/php/api';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        alert('Please sign in to view your profile.');
        window.location.href = 'src/SignIn.html';
        return;
    }

    // Load user profile data
    loadUserProfile();

    // Setup form handlers
    setupProfileForm();
    setupPasswordForm();
    setupDeleteAccount();
});

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem('token') && localStorage.getItem('user');
}

/**
 * Get current user from localStorage
 */
function getUserData() {
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
 * Load user profile data into the page
 */
function loadUserProfile() {
    const user = getUserData();
    
    if (!user) {
        showAlert('Failed to load user data.', 'error');
        return;
    }

    // Update profile header
    document.getElementById('userName').textContent = user.name || 'User';
    document.getElementById('userRole').textContent = user.role || 'User';
    document.getElementById('userEmail').textContent = user.email || '';

    // Update avatar with initials
    const avatarImg = document.getElementById('userAvatar');
    const initials = getInitials(user.name || 'User');
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=8B0000&color=fff&size=150`;

    // Populate edit form
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editBio').value = user.bio || '';

    // Update activity stats
    updateActivityStats(user);
}

/**
 * Get initials from name
 */
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Update activity statistics
 */
function updateActivityStats(user) {
    // These would normally come from the API
    document.getElementById('articlesCount').textContent = user.articlesCount || 0;
    document.getElementById('commentsCount').textContent = user.commentsCount || 0;
    
    // Format member since date
    if (user.created_at) {
        const date = new Date(user.created_at);
        const options = { year: 'numeric', month: 'short' };
        document.getElementById('memberSince').textContent = date.toLocaleDateString('en-US', options);
    } else {
        document.getElementById('memberSince').textContent = 'N/A';
    }
}

/**
 * Setup profile edit form
 */
function setupProfileForm() {
    const form = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelEdit');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const bio = document.getElementById('editBio').value.trim();

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
            const user = getUserData();
            
            const response = await fetch(`${API_URL}/users/user.php?id=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, bio })
            });

            const data = await response.json();

            if (data.success) {
                // Update local storage
                const updatedUser = { ...user, name, email, bio };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Reload profile display
                loadUserProfile();
                showAlert('Profile updated successfully!', 'success');
            } else {
                showAlert(data.message || 'Failed to update profile.', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            
            // For demo purposes, update locally if API fails
            const user = getUserData();
            const updatedUser = { ...user, name, email, bio };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            loadUserProfile();
            showAlert('Profile updated locally!', 'success');
        }
    });

    cancelBtn.addEventListener('click', function() {
        // Reset form to original values
        loadUserProfile();
    });
}

/**
 * Setup password change form
 */
function setupPasswordForm() {
    const form = document.getElementById('passwordForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

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
            const user = getUserData();

            const response = await fetch(`${API_URL}/users/user.php?id=${user.id}`, {
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
 * Setup delete account button
 */
function setupDeleteAccount() {
    const deleteBtn = document.getElementById('deleteAccount');

    deleteBtn.addEventListener('click', async function() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
        );

        if (!confirmed) return;

        const doubleConfirm = confirm(
            'This will permanently delete all your data. Type OK to confirm.'
        );

        if (!doubleConfirm) return;

        try {
            const token = localStorage.getItem('token');
            const user = getUserData();

            const response = await fetch(`${API_URL}/users/user.php?id=${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Clear all user data
                localStorage.clear();
                sessionStorage.clear();
                
                alert('Your account has been deleted.');
                window.location.href = 'index.html';
            } else {
                showAlert(data.message || 'Failed to delete account.', 'error');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            showAlert('Network error. Please try again.', 'error');
        }
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

    // Insert after profile header
    const profileCard = document.querySelector('.profile-card');
    const profileHeader = document.querySelector('.profile-header');
    profileCard.insertBefore(alert, profileHeader.nextSibling);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
