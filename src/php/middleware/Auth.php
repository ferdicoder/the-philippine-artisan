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
     * Authenticate user from JWT token
     * Returns user data if valid, sends error response if not
     */
    public static function authenticate(): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
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
