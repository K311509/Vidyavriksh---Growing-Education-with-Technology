package com.vidyavriksh.repository;

import com.vidyavriksh.model.LearningResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningResourceRepository extends MongoRepository<LearningResource, String> {
    List<LearningResource> findBySubject(String subject);
    List<LearningResource> findByGradeLevel(String gradeLevel);
    List<LearningResource> findByType(String type);
    List<LearningResource> findBySubjectAndGradeLevel(String subject, String gradeLevel);
    List<LearningResource> findByTagsContaining(String tag);
}