<?php
/**
 * Authentication Middleware
 * Handles JWT token verification and role-based access
 */

require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../models/User.php';

class Auth {
    
    /**
     * Get Authorization header from various sources
     * Enhanced for XAMPP/Apache compatibility
     */
    private static function getAuthorizationHeader(): string {
        // Method 1: Direct $_SERVER check (most reliable with .htaccess fix)
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        // Method 2: Redirect authorization (Apache mod_rewrite)
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        // Method 3: Try getallheaders() - works on Apache with mod_php
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            // Check various case combinations
            foreach (['Authorization', 'authorization', 'AUTHORIZATION'] as $key) {
                if (isset($headers[$key])) {
                    return $headers[$key];
                }
            }
        }
        
        // Method 4: Try apache_request_headers() as fallback
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            foreach (['Authorization', 'authorization', 'AUTHORIZATION'] as $key) {
                if (isset($headers[$key])) {
                    return $headers[$key];
                }
            }
        }
        
        // Method 5: Check PHP_AUTH variables (Basic Auth fallback)
        if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
            return 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . $_SERVER['PHP_AUTH_PW']);
        }
        
        return '';
    }
    
    /**
     * Authenticate user from JWT token
     * Returns user data if valid, sends error response if not
     */
    public static function authenticate(): array {
        $authHeader = self::getAuthorizationHeader();
        
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            Response::unauthorized('Missing or invalid Authorization header');
        }
        
        $token = substr($authHeader, 7); // Remove 'Bearer ' prefix
        $payload = JWT::decode($token, JWT_SECRET);
        
        if (!$payload) {
            Response::unauthorized('Invalid or expired token');
        }
        
        $user = User::findById($payload['id']);
        
        if (!$user) {
            Response::unauthorized('User no longer exists');
        }
        
        // Return user without password
        unset($user['password']);
        return $user;
    }
    
    /**
     * Authorize user by role
     * Must call authenticate() first
     */
    public static function authorize(array $user, array $allowedRoles): void {
        if (!in_array($user['role'], $allowedRoles)) {
            Response::forbidden('Forbidden: insufficient permissions');
        }
    }
    
    /**
     * Require admin role
     */
    public static function requireAdmin(): array {
        $user = self::authenticate();
        self::authorize($user, ['Admin']);
        return $user;
    }
    
    /**
     * Require any authenticated user
     */
    public static function requireUser(): array {
        return self::authenticate();
    }
}
