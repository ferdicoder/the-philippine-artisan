<?php
/**
 * Admin Dashboard Endpoint
 * GET /api/admin/dashboard.php
 * 
 * Requires: Authorization: Bearer <token> (Admin only)
 * Response: { success, data: { totalUsers, totalAdmins, recentUsers } }
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';
require_once __DIR__ . '/../../models/User.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Require admin
Auth::requireAdmin();

// Get dashboard stats
$users = User::getAllSafe();
$totalUsers = count($users);
$totalAdmins = User::countByRole('Admin');
$totalRegularUsers = User::countByRole('User');

// Get recent users (last 5)
usort($users, function($a, $b) {
    return strtotime($b['createdAt']) - strtotime($a['createdAt']);
});
$recentUsers = array_slice($users, 0, 5);

Response::success([
    'stats' => [
        'totalUsers' => $totalUsers,
        'totalAdmins' => $totalAdmins,
        'totalRegularUsers' => $totalRegularUsers
    ],
    'recentUsers' => $recentUsers
], 'Dashboard data retrieved successfully');
