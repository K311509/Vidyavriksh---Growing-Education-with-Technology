package com.vidyavriksh.dto;

import com.vidyavriksh.model.Role;
import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String token;

    @Builder.Default
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Set<Role> roles;
}