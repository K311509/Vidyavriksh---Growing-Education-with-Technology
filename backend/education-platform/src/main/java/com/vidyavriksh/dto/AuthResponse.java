package com.vidyavriksh.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String userId;
    private String role;
    private String name;
    private String profileId;

    public AuthResponse(String token, String userId, String role, String name, String profileId) {
        this.token     = token;
        this.userId    = userId;
        this.role      = role;
        this.name      = name;
        this.profileId = profileId;
    }
}