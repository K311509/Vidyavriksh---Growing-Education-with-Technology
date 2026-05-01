package com.vidyavriksh.repository;

import com.vidyavriksh.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {
    // Used by TeacherService / AlertController
    List<Alert> findByTeacherIdAndAcknowledgedFalseOrderByCreatedAtDesc(String teacherId);
    List<Alert> findByStudentIdAndAcknowledgedFalseOrderByCreatedAtDesc(String studentId);

    // Used by AlertService (original code)
    @Query("{ 'student.$id': ?0 }")
    List<Alert> findByStudentId(String studentId);

    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
    List<Alert> findBySeverity(String severity);
}