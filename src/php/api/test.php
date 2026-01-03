<?php
/**
 * Debug Test Endpoint
 * GET /api/test.php
 * 
 * Tests if Authorization header is being received properly
 */

require_once __DIR__ . '/../config.php';

// Show all headers received
$debugInfo = [
    'success' => true,
    'message' => 'Debug information',
    'headers' => [
        'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
        'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET',
    ],
    'getallheaders' => function_exists('getallheaders') ? getallheaders() : 'Function not available',
    'apache_request_headers' => function_exists('apache_request_headers') ? apache_request_headers() : 'Function not available',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($debugInfo, JSON_PRETTY_PRINT);
