package com.vidyavriksh.repository;

import com.vidyavriksh.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends MongoRepository<Teacher, String> {
    Optional<Teacher> findByUserId(String userId);
    // Teacher model uses assignedSection NOT section
    List<Teacher> findByAssignedClassAndAssignedSection(String assignedClass, String assignedSection);
}