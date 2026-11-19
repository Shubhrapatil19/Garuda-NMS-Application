package com.garuda.nms.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Utility component for generating, signing, and parsing cryptographically secure JWT tokens.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long defaultExpirationMs;
    private final long rememberMeExpirationMs;

    public JwtTokenProvider(
            @Value("${garuda.security.jwt.secret}") String secret,
            @Value("${garuda.security.jwt.expiration-ms}") long defaultExpirationMs,
            @Value("${garuda.security.jwt.remember-me-expiration-ms}") long rememberMeExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.defaultExpirationMs = defaultExpirationMs;
        this.rememberMeExpirationMs = rememberMeExpirationMs;
    }

    /**
     * Generates a signed JWT Bearer token with embedded user claims.
     *
     * @param userId The unique UUID of the authenticated user
     * @param email The user's work email address
     * @param orgName The organization/customer name
     * @param roles List of authorized security roles assigned to the user
     * @param rememberMe If true, token lifespan is extended to 7 days
     * @return Compact serialized JWT token string
     */
    public String generateToken(UUID userId, String email, String orgName, List<String> roles, boolean rememberMe) {
        long validity = rememberMe ? rememberMeExpirationMs : defaultExpirationMs;
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + validity);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("organization", orgName)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extracts all payload claims from a signed JWT token.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validates cryptographic signature and expiration of the token.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}