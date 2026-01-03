<?php
/**
 * Register Endpoint
 * POST /api/auth/register.php
 * 
 * Body: { "name": "John", "email": "john@example.com", "password": "password123" }
 * Response: { success, token, user }
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/JWT.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../models/User.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$organization = trim($input['organization'] ?? '');
$password = $input['password'] ?? '';

// Validate input
$errors = [];

if (empty($name)) {
    $errors['name'] = 'Name is required';
}

if (empty($organization)) {
    $errors['organization'] = 'School organization name is required';
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

if (!empty($errors)) {
    Response::error('Validation failed', 400, $errors);
}

// Check if email already exists
if (User::findByEmail($email)) {
    Response::error('Email already registered', 409);
}

try {
    // Create user (always with 'User' role for public registration)
    $user = User::create([
        'name' => $name,
        'email' => $email,
        'organization' => $organization,
        'password' => $password,
        'role' => 'User'
    ]);
    
    // Generate token
    $token = JWT::encode([
        'id' => $user['id'],
        'role' => $user['role']
    ], JWT_SECRET);
    
    Response::success([
        'token' => $token,
        'user' => $user
    ], 'Registration successful', 201);
    
} catch (Exception $e) {
    Response::error($e->getMessage(), 400);
}
