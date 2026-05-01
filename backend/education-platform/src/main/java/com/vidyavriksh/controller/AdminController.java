package com.vidyavriksh.controller;

import com.vidyavriksh.dto.AdminStatistics;
import com.vidyavriksh.dto.ApiResponse;
import com.vidyavriksh.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatistics>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", adminService.getStatistics()));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatistics>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", adminService.getStatistics()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@PathVariable String userId,
                                          @RequestBody Map<String, Boolean> body) {
        try {
            adminService.toggleUserStatus(userId, body.get("active"));
            return ResponseEntity.ok(Map.of("message", "User status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}