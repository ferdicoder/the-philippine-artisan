<?php
/**
 * Single Article Endpoint
 * GET /api/articles/article.php?id=xxx - Get single article (public for published)
 * PUT /api/articles/article.php?id=xxx - Update article (requires auth)
 * DELETE /api/articles/article.php?id=xxx - Delete article (requires auth)
 */

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/JWT.php';
require_once __DIR__ . '/../../models/Article.php';
require_once __DIR__ . '/../../middleware/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

if (!$id) {
    Response::error('Article ID is required', 400);
}

switch ($method) {
    case 'GET':
        handleGet($id);
        break;
    case 'PUT':
        handlePut($id);
        break;
    case 'DELETE':
        handleDelete($id);
        break;
    default:
        Response::error('Method not allowed', 405);
}

/**
 * Handle GET request - fetch single article
 */
function handleGet(string $id): void {
    $article = Article::findById($id);
    
    if (!$article) {
        Response::error('Article not found', 404);
    }
    
    // If article is not published, require authentication
    if ($article['status'] !== 'published') {
        $user = Auth::check();
        if (!$user) {
            Response::error('Article not found', 404);
        }
    }
    
    Response::success(['article' => $article], 'Article retrieved successfully');
}

/**
 * Handle PUT request - update article
 */
function handlePut(string $id): void {
    // Require admin role - only admins can update news
    $user = Auth::check();
    if (!$user) {
        Response::error('Unauthorized', 401);
    }
    
    // Check if user is admin
    if (!isset($user['role']) || strtolower($user['role']) !== 'admin') {
        Response::error('Forbidden: Only administrators can edit news', 403);
    }
    
    // Check if article exists
    $existing = Article::findById($id);
    if (!$existing) {
        Response::error('Article not found', 404);
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Update article
    $article = Article::update($id, [
        'title' => $input['title'] ?? null,
        'summary' => $input['summary'] ?? null,
        'body' => $input['body'] ?? null,
        'image' => $input['image'] ?? null,
        'date' => $input['date'] ?? null,
        'status' => $input['status'] ?? null
    ]);
    
    Response::success(['article' => $article], 'Article updated successfully');
}

/**
 * Handle DELETE request - delete article
 */
function handleDelete(string $id): void {
    // Require admin role - only admins can delete news
    $user = Auth::check();
    if (!$user) {
        Response::error('Unauthorized', 401);
    }
    
    // Check if user is admin
    if (!isset($user['role']) || strtolower($user['role']) !== 'admin') {
        Response::error('Forbidden: Only administrators can delete news', 403);
    }
    
    // Check if article exists
    $existing = Article::findById($id);
    if (!$existing) {
        Response::error('Article not found', 404);
    }
    
    // Delete article
    $deleted = Article::delete($id);
    
    if ($deleted) {
        Response::success(null, 'Article deleted successfully');
    } else {
        Response::error('Failed to delete article', 500);
    }
}
