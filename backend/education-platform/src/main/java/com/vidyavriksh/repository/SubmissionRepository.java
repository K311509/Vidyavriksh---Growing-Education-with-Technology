package com.vidyavriksh.repository;

import com.vidyavriksh.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByAssignmentId(String assignmentId);
    List<Submission> findByStudentId(String studentId);
    Optional<Submission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);
    List<Submission> findByStatus(String status);
}
