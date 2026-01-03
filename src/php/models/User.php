<?php
/**
 * User Model
 * Handles user data operations with JSON file storage
 */

class User {
    private static string $file = DATA_PATH . 'users.json';
    
    /**
     * Initialize users file with seed data if it doesn't exist
     */
    public static function init(): void {
        if (!file_exists(self::$file)) {
            $seedUsers = [
                [
                    'id' => self::generateId(),
                    'name' => 'Admin',
                    'email' => 'admin@example.com',
                    'password' => password_hash('admin123', PASSWORD_DEFAULT),
                    'role' => 'Admin',
                    'createdAt' => date('Y-m-d H:i:s')
                ],
                [
                    'id' => self::generateId(),
                    'name' => 'Demo User',
                    'email' => 'user@example.com',
                    'password' => password_hash('user123', PASSWORD_DEFAULT),
                    'role' => 'User',
                    'createdAt' => date('Y-m-d H:i:s')
                ]
            ];
            self::saveAll($seedUsers);
        }
    }
    
    /**
     * Get all users
     */
    public static function getAll(): array {
        self::init();
        $data = file_get_contents(self::$file);
        return json_decode($data, true) ?? [];
    }
    
    /**
     * Get all users without passwords (safe for API response)
     */
    public static function getAllSafe(): array {
        $users = self::getAll();
        return array_map(function($user) {
            unset($user['password']);
            return $user;
        }, $users);
    }
    
    /**
     * Find user by ID
     */
    public static function findById(string $id): ?array {
        $users = self::getAll();
        foreach ($users as $user) {
            if ($user['id'] === $id) {
                return $user;
            }
        }
        return null;
    }
    
    /**
     * Find user by ID (safe - without password)
     */
    public static function findByIdSafe(string $id): ?array {
        $user = self::findById($id);
        if ($user) {
            unset($user['password']);
        }
        return $user;
    }
    
    /**
     * Find user by email
     */
    public static function findByEmail(string $email): ?array {
        $users = self::getAll();
        foreach ($users as $user) {
            if (strtolower($user['email']) === strtolower($email)) {
                return $user;
            }
        }
        return null;
    }
    
    /**
     * Create a new user
     */
    public static function create(array $data): array {
        $users = self::getAll();
        
        // Check if email already exists
        if (self::findByEmail($data['email'])) {
            throw new Exception('Email already registered');
        }
        
        $user = [
            'id' => self::generateId(),
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'] ?? 'User',
            'createdAt' => date('Y-m-d H:i:s')
        ];
        
        $users[] = $user;
        self::saveAll($users);
        
        // Return without password
        unset($user['password']);
        return $user;
    }
    
    /**
     * Update a user
     */
    public static function update(string $id, array $data): ?array {
        $users = self::getAll();
        
        foreach ($users as $index => $user) {
            if ($user['id'] === $id) {
                // Update fields if provided
                if (isset($data['name'])) {
                    $users[$index]['name'] = $data['name'];
                }
                if (isset($data['email'])) {
                    // Check if email is taken by another user
                    $existing = self::findByEmail($data['email']);
                    if ($existing && $existing['id'] !== $id) {
                        throw new Exception('Email already in use');
                    }
                    $users[$index]['email'] = $data['email'];
                }
                if (isset($data['role'])) {
                    $users[$index]['role'] = $data['role'];
                }
                if (isset($data['password']) && !empty($data['password'])) {
                    $users[$index]['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
                }
                
                $users[$index]['updatedAt'] = date('Y-m-d H:i:s');
                self::saveAll($users);
                
                $updated = $users[$index];
                unset($updated['password']);
                return $updated;
            }
        }
        
        return null;
    }
    
    /**
     * Delete a user
     */
    public static function delete(string $id): bool {
        $users = self::getAll();
        
        foreach ($users as $index => $user) {
            if ($user['id'] === $id) {
                array_splice($users, $index, 1);
                self::saveAll($users);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword(array $user, string $password): bool {
        return password_verify($password, $user['password']);
    }
    
    /**
     * Count users
     */
    public static function count(): int {
        return count(self::getAll());
    }
    
    /**
     * Count users by role
     */
    public static function countByRole(string $role): int {
        $users = self::getAll();
        return count(array_filter($users, fn($u) => $u['role'] === $role));
    }
    
    /**
     * Save all users to file
     */
    private static function saveAll(array $users): void {
        file_put_contents(self::$file, json_encode($users, JSON_PRETTY_PRINT));
    }
    
    /**
     * Generate unique ID
     */
    private static function generateId(): string {
        return bin2hex(random_bytes(16));
    }
}
