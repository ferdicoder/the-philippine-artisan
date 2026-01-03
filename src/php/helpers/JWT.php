<?php
/**
 * Simple JWT Helper Class
 * Handles token creation and verification
 */

class JWT {
    
    /**
     * Generate a JWT token
     */
    public static function encode(array $payload, string $secret): string {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]));
        
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", $secret, true)
        );
        
        return "$header.$payloadEncoded.$signature";
    }
    
    /**
     * Decode and verify a JWT token
     */
    public static function decode(string $token, string $secret): ?array {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return null;
        }
        
        [$header, $payload, $signature] = $parts;
        
        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );
        
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }
        
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return null;
        }
        
        return $payloadData;
    }
    
    /**
     * Base64 URL-safe encode
     */
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL-safe decode
     */
    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
