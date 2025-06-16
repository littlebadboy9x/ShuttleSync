package com.example.shuttlesync.security;

import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFacade {

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy thông tin authentication hiện tại
     */
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Lấy user hiện tại từ SecurityContext
     */
    public User getCurrentUser() {
        Authentication authentication = getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với email: " + email));
    }

    /**
     * Lấy email của user hiện tại
     */
    public String getCurrentUserEmail() {
        User user = getCurrentUser();
        return user.getEmail();
    }

    /**
     * Lấy ID của user hiện tại
     */
    public Integer getCurrentUserId() {
        User user = getCurrentUser();
        return user.getId();
    }

    /**
     * Kiểm tra xem user hiện tại có role cụ thể không
     */
    public boolean hasRole(String role) {
        Authentication authentication = getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role.toUpperCase()));
    }

    /**
     * Kiểm tra xem user hiện tại có phải admin không
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Kiểm tra xem user hiện tại có phải customer không
     */
    public boolean isCustomer() {
        return hasRole("CUSTOMER");
    }
} 