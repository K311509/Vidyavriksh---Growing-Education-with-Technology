package com.vidyavriksh.controller;

import com.vidyavriksh.dto.AlertRequest;
import com.vidyavriksh.dto.AlertResponse;
import com.vidyavriksh.dto.ApiResponse;
import com.vidyavriksh.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AlertResponse>> createAlert(
            @Valid @RequestBody AlertRequest request) {
        AlertResponse response = alertService.createAlert(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Alert created successfully", response));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getStudentAlerts(
            @PathVariable String studentId) {
        List<AlertResponse> alerts = alertService.getStudentAlerts(studentId);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved successfully", alerts));
    }

    @GetMapping("/unacknowledged")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getUnacknowledgedAlerts() {
        List<AlertResponse> alerts = alertService.getUnacknowledgedAlerts();
        return ResponseEntity.ok(ApiResponse.success("Unacknowledged alerts retrieved", alerts));
    }

    @GetMapping("/severity/{severity}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlertsBySeverity(
            @PathVariable String severity) {
        List<AlertResponse> alerts = alertService.getAlertsBySeverity(severity);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved successfully", alerts));
    }

    @PutMapping("/{alertId}/acknowledge")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AlertResponse>> acknowledgeAlert(
            @PathVariable String alertId,
            @RequestParam String acknowledgedBy) {
        AlertResponse response = alertService.acknowledgeAlert(alertId, acknowledgedBy);
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged successfully", response));
    }
}