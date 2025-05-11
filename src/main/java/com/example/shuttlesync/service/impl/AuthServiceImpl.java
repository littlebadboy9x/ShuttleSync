package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.AuthRequest;
import com.example.shuttlesync.dto.AuthResponse;
import com.example.shuttlesync.dto.UserDto;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.UserRepository;
import com.example.shuttlesync.service.AuthService;
import com.example.shuttlesync.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse authenticate(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .email(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .role(userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "").toLowerCase())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Tạo tài khoản người dùng mới - không mã hóa mật khẩu
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setFullName(userDto.getFullName());
        user.setPassword(userDto.getPassword()); // Lưu mật khẩu không mã hóa
        user.setRole(userDto.getRole());

        userRepository.save(user);

        // Đăng nhập tự động sau khi đăng ký
        return authenticate(new AuthRequest(userDto.getEmail(), userDto.getPassword()));
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        if (jwtService.isTokenValid(refreshToken, userDetails)) {
            String newToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .id(userDetails.getId())
                    .email(userDetails.getUsername())
                    .fullName(userDetails.getFullName())
                    .role(userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "").toLowerCase())
                    .build();
        }

        throw new RuntimeException("Refresh token không hợp lệ");
    }
}
