package com.vidyavriksh.repository;

import com.vidyavriksh.model.EngagementLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EngagementLogRepository extends MongoRepository<EngagementLog, String> {
    List<EngagementLog> findByStudentIdOrderByLoggedAtDesc(String studentId);
    List<EngagementLog> findByTeacherIdOrderByLoggedAtDesc(String teacherId);
}