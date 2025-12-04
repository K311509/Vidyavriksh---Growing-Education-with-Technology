package com.vidyavriksh.repository;

import com.vidyavriksh.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {
    List<Alert> findByStudentId(String studentId);
    List<Alert> findByStudentIdAndAcknowledged(String studentId, boolean acknowledged);
    List<Alert> findByAlertType(String alertType);
    List<Alert> findBySeverity(String severity);
    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
    List<Alert> findByCreatedAtAfter(LocalDateTime dateTime);
}