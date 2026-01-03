<?php
/**
 * Users List / Create Endpoint
 * GET  /api/users/index.php - List all users (Admin only)
 * POST /api/users/index.php - Create a user (Admin only)
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';
require_once __DIR__ . '/../../models/User.php';

// Require admin for all operations
$currentUser = Auth::requireAdmin();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // List all users
        $users = User::getAllSafe();
        Response::success(['users' => $users], 'Users retrieved successfully');
        break;
        
    case 'POST':
        // Create a new user
        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'User';
        
        // Validate
        $errors = [];
        
        if (empty($name)) {
            $errors['name'] = 'Name is required';
        }
        
        if (empty($email)) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }
        
        if (empty($password)) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($password) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }
        
        if (!in_array($role, ['Admin', 'User'])) {
            $errors['role'] = 'Role must be Admin or User';
        }
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
        }
        
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'role' => $role
            ]);
            
            Response::success(['user' => $user], 'User created successfully', 201);
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
        break;
        
    default:
        Response::error('Method not allowed', 405);
}
