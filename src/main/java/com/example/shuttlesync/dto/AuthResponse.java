package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private Integer id;
    private String email;
    private String fullName;
    private String role;
    
    private UserInfo user;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Integer id;
        private String email;
        private String fullName;
        private String role;
    }
}