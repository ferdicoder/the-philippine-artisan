<?php
/**
 * Configuration file for PHP Backend
 * The Philippine Artisan
 */

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

// Timezone
date_default_timezone_set('Asia/Manila');

// Database path (JSON file-based storage)
define('DATA_PATH', __DIR__ . '/data/');

// JWT Secret (change this in production!)
define('JWT_SECRET', 'philippine_artisan_secret_key_change_me');
define('JWT_EXPIRY', 86400); // 24 hours in seconds

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure data directory exists
if (!file_exists(DATA_PATH)) {
    mkdir(DATA_PATH, 0755, true);
}
