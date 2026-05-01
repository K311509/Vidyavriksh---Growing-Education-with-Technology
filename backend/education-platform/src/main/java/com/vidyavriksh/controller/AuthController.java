package com.vidyavriksh.controller;

import com.vidyavriksh.model.Role;
import com.vidyavriksh.model.User;
import com.vidyavriksh.repository.UserRepository;
import com.vidyavriksh.security.JwtTokenProvider;
import com.vidyavriksh.dto.LoginRequest;
import com.vidyavriksh.dto.RegisterRequest;
import com.vidyavriksh.dto.AuthResponse;
import com.vidyavriksh.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService      authService;
    private final JwtTokenProvider jwtUtil;
    private final UserRepository   userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * GET /api/auth/me
     * Called by AuthContext on every page load to validate the stored token.
     *
     * Returns consistent field names that match what AuthContext expects:
     *   id, name (= fullName), role (without ROLE_ prefix)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "No token provided"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Strip ROLE_ prefix so frontend gets "ADMIN", "TEACHER" etc.
            String roleStr = user.getRoles().stream()
                    .findFirst()
                    .map(r -> r.name().replace("ROLE_", ""))
                    .orElse("STUDENT");

            return ResponseEntity.ok(Map.of(
                "id",   user.getId(),
                "name", user.getFullName(),   // consistent field name
                "role", roleStr               // e.g. "ADMIN" not "ROLE_ADMIN"
            ));

        } catch (Exception e) {
            log.error("Error in /auth/me: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }
    }
}