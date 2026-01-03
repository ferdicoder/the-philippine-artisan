<?php
/**
 * Article Model
 * Handles article data operations with JSON file storage
 */

class Article {
    private static string $file = DATA_PATH . 'articles.json';
    
    /**
     * Initialize articles file if it doesn't exist
     */
    public static function init(): void {
        if (!file_exists(self::$file)) {
            self::saveAll([]);
        }
    }
    
    /**
     * Get all articles
     */
    public static function getAll(): array {
        self::init();
        $data = file_get_contents(self::$file);
        return json_decode($data, true) ?? [];
    }
    
    /**
     * Get published articles only (sorted by date, newest first)
     */
    public static function getPublished(): array {
        $articles = self::getAll();
        $published = array_filter($articles, function($article) {
            return $article['status'] === 'published';
        });
        
        // Sort by date, newest first
        usort($published, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_values($published);
    }
    
    /**
     * Get articles with pagination
     */
    public static function getPaginated(int $page = 1, int $limit = 10, bool $publishedOnly = true): array {
        $articles = $publishedOnly ? self::getPublished() : self::getAll();
        $total = count($articles);
        $totalPages = ceil($total / $limit);
        $offset = ($page - 1) * $limit;
        
        $paginatedArticles = array_slice($articles, $offset, $limit);
        
        return [
            'articles' => $paginatedArticles,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => $totalPages,
                'totalItems' => $total,
                'itemsPerPage' => $limit,
                'hasNext' => $page < $totalPages,
                'hasPrev' => $page > 1
            ]
        ];
    }
    
    /**
     * Find article by ID
     */
    public static function findById(string $id): ?array {
        $articles = self::getAll();
        foreach ($articles as $article) {
            if ($article['id'] === $id) {
                return $article;
            }
        }
        return null;
    }
    
    /**
     * Create new article
     */
    public static function create(array $data): array {
        $articles = self::getAll();
        
        $article = [
            'id' => self::generateId(),
            'title' => $data['title'],
            'summary' => $data['summary'],
            'body' => $data['body'],
            'image' => $data['image'] ?? '',
            'date' => $data['date'] ?? date('c'),
            'status' => $data['status'] ?? 'draft',
            'author' => $data['author'] ?? 'The Philippine Artisan',
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];
        
        // Add to beginning of array (newest first)
        array_unshift($articles, $article);
        self::saveAll($articles);
        
        return $article;
    }
    
    /**
     * Update article
     */
    public static function update(string $id, array $data): ?array {
        $articles = self::getAll();
        
        foreach ($articles as $key => $article) {
            if ($article['id'] === $id) {
                $articles[$key] = array_merge($article, [
                    'title' => $data['title'] ?? $article['title'],
                    'summary' => $data['summary'] ?? $article['summary'],
                    'body' => $data['body'] ?? $article['body'],
                    'image' => $data['image'] ?? $article['image'],
                    'date' => $data['date'] ?? $article['date'],
                    'status' => $data['status'] ?? $article['status'],
                    'updatedAt' => date('c')
                ]);
                
                self::saveAll($articles);
                return $articles[$key];
            }
        }
        
        return null;
    }
    
    /**
     * Delete article
     */
    public static function delete(string $id): bool {
        $articles = self::getAll();
        $initialCount = count($articles);
        
        $articles = array_filter($articles, function($article) use ($id) {
            return $article['id'] !== $id;
        });
        
        if (count($articles) < $initialCount) {
            self::saveAll(array_values($articles));
            return true;
        }
        
        return false;
    }
    
    /**
     * Save all articles to file
     */
    private static function saveAll(array $articles): void {
        $dir = dirname(self::$file);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(self::$file, json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    /**
     * Generate unique ID
     */
    private static function generateId(): string {
        return 'article-' . bin2hex(random_bytes(8));
    }
    
    /**
     * Search articles by title or summary
     */
    public static function search(string $query, bool $publishedOnly = true): array {
        $articles = $publishedOnly ? self::getPublished() : self::getAll();
        $query = strtolower($query);
        
        return array_filter($articles, function($article) use ($query) {
            return strpos(strtolower($article['title']), $query) !== false ||
                   strpos(strtolower($article['summary']), $query) !== false;
        });
    }
}
