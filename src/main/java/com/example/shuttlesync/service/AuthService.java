package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.AuthRequest;
import com.example.shuttlesync.dto.AuthResponse;
import com.example.shuttlesync.dto.UserDto;

public interface AuthService {

    AuthResponse authenticate(AuthRequest request);

    AuthResponse register(UserDto userDto);

    AuthResponse refreshToken(String refreshToken);
}