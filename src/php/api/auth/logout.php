<?php
/**
 * Logout Endpoint
 * POST /api/auth/logout.php
 * 
 * With stateless JWT, logout is handled client-side by deleting the token.
 * This endpoint just returns success for consistency.
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

Response::success(null, 'Logged out successfully');
