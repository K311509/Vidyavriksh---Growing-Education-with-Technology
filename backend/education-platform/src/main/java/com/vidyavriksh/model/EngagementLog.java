package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "engagement_logs")
public class EngagementLog {

    @Id
    private String id;

    private String studentId;    // plain String — no @DBRef
    private String teacherId;    // plain String — no @DBRef

    private int    pointsDelta;  // positive = added, negative = removed
    private String reason;

    private LocalDateTime loggedAt = LocalDateTime.now();
}