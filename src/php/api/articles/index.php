<?php
/**
 * Articles List Endpoint
 * GET /api/articles/index.php - Get all published articles (public)
 * POST /api/articles/index.php - Create new article (requires auth)
 * 
 * Query params for GET:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - all: Set to 'true' to get all articles including drafts (requires auth)
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/JWT.php';
require_once __DIR__ . '/../../models/Article.php';
require_once __DIR__ . '/../../middleware/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        handlePost();
        break;
    default:
        Response::error('Method not allowed', 405);
}

/**
 * Handle GET request - fetch articles
 */
function handleGet(): void {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $all = isset($_GET['all']) && $_GET['all'] === 'true';
    
    // If requesting all articles (including drafts), require authentication
    if ($all) {
        $user = Auth::check();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }
        
        $result = Article::getPaginated($page, $limit, false);
    } else {
        // Public endpoint - only published articles
        $result = Article::getPaginated($page, $limit, true);
    }
    
    Response::success([
        'articles' => $result['articles'],
        'pagination' => $result['pagination']
    ], 'Articles retrieved successfully');
}

/**
 * Handle POST request - create new article
 */
function handlePost(): void {
    // Require authentication
    $user = Auth::check();
    if (!$user) {
        Response::error('Unauthorized', 401);
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['title', 'summary', 'body'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            Response::error("Field '$field' is required", 400);
        }
    }
    
    // Create article
    $article = Article::create([
        'title' => $input['title'],
        'summary' => $input['summary'],
        'body' => $input['body'],
        'image' => $input['image'] ?? '',
        'date' => $input['date'] ?? date('c'),
        'status' => $input['status'] ?? 'draft',
        'author' => $user['name'] ?? 'The Philippine Artisan'
    ]);
    
    Response::success(['article' => $article], 'Article created successfully', 201);
}
