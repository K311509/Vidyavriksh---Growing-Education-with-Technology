package com.vidyavriksh.repository;

import com.vidyavriksh.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends MongoRepository<Teacher, String> {
    Optional<Teacher> findByTeacherId(String teacherId);
    Optional<Teacher> findByUserId(String userId);
    List<Teacher> findByDepartment(String department);
    List<Teacher> findBySubject(String subject);
}