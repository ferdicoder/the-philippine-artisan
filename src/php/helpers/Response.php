<?php
/**
 * Response Helper Class
 * Standardizes JSON API responses
 */

class Response {
    
    /**
     * Send success response
     */
    public static function success($data = null, string $message = 'Success', int $code = 200): void {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
        exit();
    }
    
    /**
     * Send error response
     */
    public static function error(string $message = 'Error', int $code = 400, $errors = null): void {
        http_response_code($code);
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        echo json_encode($response);
        exit();
    }
    
    /**
     * Send unauthorized response
     */
    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401);
    }
    
    /**
     * Send forbidden response
     */
    public static function forbidden(string $message = 'Forbidden: insufficient permissions'): void {
        self::error($message, 403);
    }
    
    /**
     * Send not found response
     */
    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404);
    }
}
