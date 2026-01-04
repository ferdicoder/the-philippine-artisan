<?php
/**
 * User Profile Endpoint
 * GET    /api/users/profile.php - Get current user's profile
 * PUT    /api/users/profile.php - Update current user's profile
 * 
 * Users can update their own profile without admin privileges
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';
require_once __DIR__ . '/../../models/User.php';

// Require authenticated user
$currentUser = Auth::requireUser();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get current user's full profile
        $user = User::findByIdSafe($currentUser['id']);
        
        if (!$user) {
            Response::notFound('User not found');
        }
        
        // Add computed fields
        $user['created_at'] = $user['createdAt'] ?? null;
        
        Response::success(['user' => $user], 'Profile retrieved successfully');
        break;
        
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Check if this is a password change request
        if (isset($input['currentPassword']) && isset($input['newPassword'])) {
            // Password change flow
            $fullUser = User::findById($currentUser['id']);
            
            if (!$fullUser) {
                Response::notFound('User not found');
            }
            
            // Verify current password
            if (!User::verifyPassword($fullUser, $input['currentPassword'])) {
                Response::error('Current password is incorrect', 400);
            }
            
            // Validate new password
            if (strlen($input['newPassword']) < 6) {
                Response::error('New password must be at least 6 characters', 400);
            }
            
            try {
                $user = User::update($currentUser['id'], [
                    'password' => $input['newPassword']
                ]);
                
                Response::success(['user' => $user], 'Password updated successfully');
                
            } catch (Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        } else {
            // Profile update flow
            
            // Validate email if provided
            if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                Response::error('Invalid email format', 400);
            }
            
            // Validate name if provided
            if (isset($input['name']) && empty(trim($input['name']))) {
                Response::error('Name cannot be empty', 400);
            }
            
            // Sanitize fields
            $department = isset($input['department']) ? htmlspecialchars(trim($input['department']), ENT_QUOTES, 'UTF-8') : null;
            $organization = isset($input['organization']) ? htmlspecialchars(trim($input['organization']), ENT_QUOTES, 'UTF-8') : null;
            
            try {
                $updateData = [];
                
                if (isset($input['name'])) {
                    $updateData['name'] = trim($input['name']);
                }
                if (isset($input['email'])) {
                    $updateData['email'] = trim($input['email']);
                }
                if ($department !== null) {
                    $updateData['department'] = $department;
                }
                if ($organization !== null) {
                    $updateData['organization'] = $organization;
                }
                
                $user = User::update($currentUser['id'], $updateData);
                
                // Add computed fields for response
                $user['created_at'] = $user['createdAt'] ?? null;
                
                Response::success(['user' => $user], 'Profile updated successfully');
                
            } catch (Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        }
        break;
    
    case 'DELETE':
        // Delete own account
        try {
            if (!User::delete($currentUser['id'])) {
                Response::error('Failed to delete account', 500);
            }
            
            Response::success(null, 'Account deleted successfully');
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
        break;
        
    default:
        Response::error('Method not allowed', 405);
}
