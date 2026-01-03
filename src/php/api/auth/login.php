<?php
/**
 * Login Endpoint
 * POST /api/auth/login.php
 * 
 * Body: { "email": "admin@example.com", "password": "admin123" }
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

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    Response::error('Email and password are required', 400);
}

// Find user
$user = User::findByEmail($email);

if (!$user) {
    Response::error('Invalid credentials', 401);
}

// Verify password
if (!User::verifyPassword($user, $password)) {
    Response::error('Invalid credentials', 401);
}

// Generate token
$token = JWT::encode([
    'id' => $user['id'],
    'role' => $user['role']
], JWT_SECRET);

// Return success (without password)
unset($user['password']);

Response::success([
    'token' => $token,
    'user' => $user
], 'Login successful');
