<?php
/**
 * Get Current User Endpoint
 * GET /api/auth/me.php
 * 
 * Requires: Authorization: Bearer <token>
 * Response: { success, user }
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$user = Auth::requireUser();

Response::success(['user' => $user], 'User retrieved successfully');
