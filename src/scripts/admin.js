/**
 * Admin Module
 * Handles admin authentication, authorization, and user management
 */

const AdminModule = (function() {
  'use strict';

  // Admin configuration
  const config = {
    adminRole: 'admin',
    sessionStorageKey: 'adminUser',
    tokenKey: 'adminToken'
  };

  // Admin user storage
  let currentAdmin = null;

  /**
   * Check if user is authenticated as admin
   */
  function isAdminAuthenticated() {
    const storedAdmin = sessionStorage.getItem(config.sessionStorageKey);
    return storedAdmin !== null && storedAdmin !== undefined;
  }

  /**
   * Check if user has admin privileges
   */
  function hasAdminPrivileges(userRole) {
    return userRole === config.adminRole;
  }

  /**
   * Authenticate admin user
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {boolean} - Authentication success status
   */
  function authenticateAdmin(email, password) {
    // Validation
    if (!email || !password) {
      console.error('Email and password are required');
      return false;
    }

    // In production, this would validate against a backend API
    // For now, we're using a mock validation
    const adminCredentials = {
      email: 'admin@philippineartisan.com',
      password: 'admin123' // In production, use secure hashing
    };

    if (email === adminCredentials.email && password === adminCredentials.password) {
      const adminUser = {
        email: email,
        role: config.adminRole,
        loginTime: new Date().toISOString()
      };

      currentAdmin = adminUser;
      sessionStorage.setItem(config.sessionStorageKey, JSON.stringify(adminUser));
      return true;
    }

    return false;
  }

  /**
   * Get current admin user
   */
  function getCurrentAdmin() {
    if (!currentAdmin) {
      const stored = sessionStorage.getItem(config.sessionStorageKey);
      if (stored) {
        currentAdmin = JSON.parse(stored);
      }
    }
    return currentAdmin;
  }

  /**
   * Logout admin user
   */
  function logoutAdmin() {
    currentAdmin = null;
    sessionStorage.removeItem(config.sessionStorageKey);
    sessionStorage.removeItem(config.tokenKey);
  }

  /**
   * Protect page - redirect to login if not authenticated
   */
  function protectAdminPage() {
    if (!isAdminAuthenticated()) {
      window.location.href = 'SignIn.html?redirect=admin';
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
