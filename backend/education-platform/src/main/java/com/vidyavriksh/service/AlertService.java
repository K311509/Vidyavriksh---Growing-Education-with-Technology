package com.vidyavriksh.service;

import com.vidyavriksh.dto.AlertRequest;
import com.vidyavriksh.dto.AlertResponse;
import com.vidyavriksh.exception.ResourceNotFoundException;
import com.vidyavriksh.model.Alert;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final StudentService studentService;

    @Transactional
    public AlertResponse createAlert(AlertRequest request) {
        Student student = studentService.getStudentById(request.getStudentId());
        
        Alert alert = new Alert();
        alert.setStudent(student);
        alert.setAlertType(request.getAlertType());
        alert.setSeverity(request.getSeverity());
        alert.setMessage(request.getMessage());
        alert.setDescription(request.getDescription());
        
        alert = alertRepository.save(alert);
        log.info("Alert created for student: {} - Type: {}", student.getStudentId(), request.getAlertType());
        
        return mapToResponse(alert);
    }

    public List<AlertResponse> getStudentAlerts(String studentId) {
        List<Alert> alerts = alertRepository.findByStudentId(studentId);
        return alerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getUnacknowledgedAlerts() {
        List<Alert> alerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
        return alerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getAlertsBySeverity(String severity) {
        List<Alert> alerts = alertRepository.findBySeverity(severity);
        return alerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertResponse acknowledgeAlert(String alertId, String acknowledgedBy) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());
        
        alert = alertRepository.save(alert);
        log.info("Alert acknowledged: {} by {}", alertId, acknowledgedBy);
        
        return mapToResponse(alert);
    }

    private AlertResponse mapToResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setStudentId(alert.getStudent().getId());
        response.setStudentName(alert.getStudent().getUser().getFullName());
        response.setAlertType(alert.getAlertType());
        response.setSeverity(alert.getSeverity());
        response.setMessage(alert.getMessage());
        response.setDescription(alert.getDescription());
        response.setAcknowledged(alert.isAcknowledged());
        response.setAcknowledgedBy(alert.getAcknowledgedBy());
        response.setAcknowledgedAt(alert.getAcknowledgedAt());
        response.setCreatedAt(alert.getCreatedAt());
        return response;
    }
}