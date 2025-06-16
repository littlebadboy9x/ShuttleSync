package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.User;
import com.example.shuttlesync.security.AuthenticationFacade;
import com.example.shuttlesync.service.CustomerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/customer/profile")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {

    @Autowired
    private CustomerProfileService profileService;

    @Autowired
    private AuthenticationFacade authenticationFacade;

    /**
     * Lấy thông tin profile
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile() {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> profile = profileService.getProfile(currentUser.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    @PutMapping("/personal")
    public ResponseEntity<Map<String, String>> updatePersonalInfo(@RequestBody Map<String, Object> profileData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            profileService.updatePersonalInfo(currentUser.getId(), profileData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Thông tin cá nhân đã được cập nhật thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể cập nhật thông tin: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Thay đổi mật khẩu
     */
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> passwordData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            profileService.changePassword(currentUser.getId(), passwordData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Mật khẩu đã được thay đổi thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể thay đổi mật khẩu: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Upload avatar
     */
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            String avatarUrl = profileService.uploadAvatar(currentUser.getId(), file);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Avatar đã được cập nhật thành công");
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể upload avatar: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy thông tin thành tích
     */
    @GetMapping("/achievements")
    public ResponseEntity<Map<String, Object>> getAchievements() {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> achievements = profileService.getAchievements(currentUser.getId());
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy cài đặt tài khoản
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> settings = profileService.getSettings(currentUser.getId());
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Cập nhật cài đặt
     */
    @PutMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, Object> settingsData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            profileService.updateSettings(currentUser.getId(), settingsData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cài đặt đã được cập nhật thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể cập nhật cài đặt: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy lịch sử đăng nhập
     */
    @GetMapping("/login-history")
    public ResponseEntity<List<Map<String, Object>>> getLoginHistory(@RequestParam(defaultValue = "10") int limit) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            List<Map<String, Object>> loginHistory = profileService.getLoginHistory(currentUser.getId(), limit);
            return ResponseEntity.ok(loginHistory);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xóa tài khoản
     */
    @DeleteMapping("/delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(@RequestBody Map<String, String> confirmData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            profileService.deleteAccount(currentUser.getId(), confirmData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Tài khoản đã được xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể xóa tài khoản: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 