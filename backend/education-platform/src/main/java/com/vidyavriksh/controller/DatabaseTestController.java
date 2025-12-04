package com.vidyavriksh.controller;

import com.vidyavriksh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db-test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DatabaseTestController {

    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;

    @GetMapping("/connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test connection by getting database name
            String dbName = mongoTemplate.getDb().getName();
            
            // Count documents
            long userCount = userRepository.count();
            
            response.put("status", "Connected");
            response.put("database", dbName);
            response.put("userCount", userCount);
            response.put("message", "MongoDB connection is working!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "Failed");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/collections")
    public ResponseEntity<Map<String, Object>> listCollections() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var collections = mongoTemplate.getCollectionNames();
            response.put("status", "Success");
            response.put("collections", collections);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "Failed");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}