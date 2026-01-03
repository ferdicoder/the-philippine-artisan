<?php
/**
 * Single User Endpoint
 * GET    /api/users/user.php?id=xxx - Get user by ID (Admin only)
 * PUT    /api/users/user.php?id=xxx - Update user (Admin only)
 * DELETE /api/users/user.php?id=xxx - Delete user (Admin only)
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';
require_once __DIR__ . '/../../models/User.php';

// Require admin for all operations
$currentUser = Auth::requireAdmin();

// Get user ID from query string
$userId = $_GET['id'] ?? '';

if (empty($userId)) {
    Response::error('User ID is required', 400);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get single user
        $user = User::findByIdSafe($userId);
        
        if (!$user) {
            Response::notFound('User not found');
        }
        
        Response::success(['user' => $user], 'User retrieved successfully');
        break;
        
    case 'PUT':
        // Update user
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Check if user exists
        if (!User::findById($userId)) {
            Response::notFound('User not found');
        }
        
        // Validate email if provided
        if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format', 400);
        }
        
        // Validate role if provided
        if (isset($input['role']) && !in_array($input['role'], ['Admin', 'User'])) {
            Response::error('Role must be Admin or User', 400);
        }
        
        // Validate password if provided
        if (isset($input['password']) && !empty($input['password']) && strlen($input['password']) < 6) {
            Response::error('Password must be at least 6 characters', 400);
        }
        
        try {
            $user = User::update($userId, [
                'name' => $input['name'] ?? null,
                'email' => $input['email'] ?? null,
                'role' => $input['role'] ?? null,
                'password' => $input['password'] ?? null
            ]);
            
            Response::success(['user' => $user], 'User updated successfully');
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
        break;
        
    case 'DELETE':
        // Prevent self-deletion
        if ($userId === $currentUser['id']) {
            Response::error('Cannot delete your own account', 400);
        }
        
        // Delete user
        if (!User::delete($userId)) {
            Response::notFound('User not found');
        }
        
        Response::success(null, 'User deleted successfully');
        break;
        
    default:
        Response::error('Method not allowed', 405);
}
