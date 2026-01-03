/**
 * Admin Module
 * Handles admin authentication, authorization, and user management
 * Updated to work with PHP backend
 */

const AdminModule = (function() {
  'use strict';

  // Admin configuration
  const config = {
    adminRole: 'Admin',
    tokenKey: 'token',
    userKey: 'user'
  };

  /**
   * Check if user is authenticated (token exists)
   */
  function isAdminAuthenticated() {
    const token = localStorage.getItem(config.tokenKey);
    return token !== null;
  }

  /**
   * Check if user has admin privileges
   */
  function hasAdminPrivileges() {
    const user = getCurrentAdmin();
    return user && user.role === config.adminRole;
  }

  /**
   * Authenticate admin user (now handled by PHP backend via SignIn.js)
   * This is kept for backward compatibility
   */
  function authenticateAdmin(email, password) {
    // Authentication is now handled by SignIn.js via PHP backend
    // This function is deprecated but kept for compatibility
    console.warn('authenticateAdmin is deprecated. Use SignIn.js instead.');
    return false;
  }

  /**
   * Get current admin user
   */
  function getCurrentAdmin() {
    const stored = localStorage.getItem(config.userKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Logout admin user
   */
  function logoutAdmin() {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.userKey);
  }

  /**
   * Protect page - redirect to login if not authenticated
   */
  function protectAdminPage() {
    if (!isAdminAuthenticated()) {
      window.location.href = 'SignIn.html';
      return false;
    }
    return true;
  }

  /**
   * Initialize admin module
   */
  function init() {
    // Check if user is already authenticated
    if (isAdminAuthenticated()) {
      console.log('Admin session active');
    }
  }

  // Public API
  return {
    init: init,
    authenticateAdmin: authenticateAdmin,
    getCurrentAdmin: getCurrentAdmin,
    isAdminAuthenticated: isAdminAuthenticated,
    hasAdminPrivileges: hasAdminPrivileges,
    logoutAdmin: logoutAdmin,
    protectAdminPage: protectAdminPage
  };
})();

// Initialize on document load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AdminModule.init);
} else {
  AdminModule.init();
}
