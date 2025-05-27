package com.example.shuttlesync.dto;

import com.example.shuttlesync.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private User user;
    private String token;
} 