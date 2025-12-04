package com.vidyavriksh.repository;

import com.vidyavriksh.model.PersonalizedPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalizedPlanRepository extends MongoRepository<PersonalizedPlan, String> {
    List<PersonalizedPlan> findByStudentId(String studentId);
    Optional<PersonalizedPlan> findByStudentIdAndStatus(String studentId, String status);
    List<PersonalizedPlan> findByStatus(String status);
}