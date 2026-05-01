package com.vidyavriksh.repository;

import com.vidyavriksh.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByUserId(String userId);
    List<Student> findByClassGradeAndSection(String classGrade, String section);
    List<Student> findByRiskLevel(String riskLevel); // riskLevel is String in Student model
}
