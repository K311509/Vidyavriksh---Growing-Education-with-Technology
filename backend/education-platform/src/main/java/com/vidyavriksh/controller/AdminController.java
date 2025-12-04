package com.vidyavriksh.controller;

import com.vidyavriksh.dto.AdminStatistics;
import com.vidyavriksh.dto.ApiResponse;
import com.vidyavriksh.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatistics>> getStatistics() {
        AdminStatistics statistics = adminService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatistics>> getDashboard() {
        AdminStatistics statistics = adminService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", statistics));
    }
}