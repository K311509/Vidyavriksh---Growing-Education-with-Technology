package com.vidyavriksh.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // ── Used by AuthService (login / register) ────────────────────────────────
    public String generateToken(String email, String role, String userId) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // ── Used by Spring Security filter ───────────────────────────────────────
    public String generateToken(Authentication authentication) {
        return generateToken(authentication.getName(), null, null);
    }

    // ── Claim extraction ──────────────────────────────────────────────────────
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return extractAllClaims(token).getSubject(); // email is subject
    }

    public String extractEmail(String token) {
        return getUsernameFromToken(token);
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).get("userId", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // ── Validation ────────────────────────────────────────────────────────────
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (SecurityException ex)      { System.err.println("Invalid JWT signature"); }
        catch (MalformedJwtException ex)    { System.err.println("Invalid JWT token"); }
        catch (ExpiredJwtException ex)      { System.err.println("Expired JWT token"); }
        catch (UnsupportedJwtException ex)  { System.err.println("Unsupported JWT token"); }
        catch (IllegalArgumentException ex) { System.err.println("JWT claims string is empty"); }
        return false;
    }
}