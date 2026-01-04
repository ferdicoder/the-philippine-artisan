<?php
// Test script to verify profile API

header('Content-Type: application/json');

require_once 'src/php/config.php';
require_once 'src/php/models/User.php';

// Test 1: Check if we can read users
$users = User::getAll();
echo "Total users: " . count($users) . "\n\n";

// Test 2: Try to update a user
$testUserId = '5c5e4c06b3bdb98257f99919d0e0a59d';
$user = User::findById($testUserId);

if ($user) {
    echo "Found user: " . $user['name'] . "\n";
    echo "Current organization: " . ($user['organization'] ?? 'N/A') . "\n\n";
    
    // Try updating
    $updated = User::update($testUserId, [
        'name' => $user['name'],
        'organization' => 'Test Organization ' . date('H:i:s')
    ]);
    
    if ($updated) {
        echo "Updated successfully!\n";
        echo "New organization: " . $updated['organization'] . "\n";
    } else {
        echo "Update failed!\n";
    }
} else {
    echo "User not found!\n";
}
