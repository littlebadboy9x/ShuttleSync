package com.example.shuttlesync.service;

import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Lấy thông tin profile
     */
    public Map<String, Object> getProfile(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        
        // Thông tin cơ bản
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole());
        profile.put("isActive", user.getIsActive());
        profile.put("createdAt", user.getCreatedAt());
        
        // Mock fields không có trong DB
        profile.put("address", "123 Đường ABC, Quận 1, TP.HCM");
        profile.put("dateOfBirth", "1990-05-15");
        profile.put("gender", "male");
        
        // Avatar (mock)
        profile.put("avatar", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face");
        
        // Thống kê
        List<Booking> userBookings = bookingRepository.findByUserId(userId);
        profile.put("totalBookings", userBookings.size());
        profile.put("completedBookings", userBookings.stream()
                .filter(b -> "Đã hoàn thành".equals(b.getStatus().getName()))
                .count());
        
        // Membership level (tính dựa trên số booking)
        String membershipLevel = calculateMembershipLevel(userBookings.size());
        profile.put("membershipLevel", membershipLevel);
        
        // Points (mock calculation)
        profile.put("points", userBookings.size() * 100);
        
        return profile;
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    public void updatePersonalInfo(Integer userId, Map<String, Object> profileData) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = userOpt.get();
        
        if (profileData.containsKey("fullName")) {
            user.setFullName((String) profileData.get("fullName"));
        }
        if (profileData.containsKey("phone")) {
            user.setPhone((String) profileData.get("phone"));
        }
        // Các field khác như address, dateOfBirth, gender sẽ được xử lý khi extend User model
        
        userRepository.save(user);
    }

    /**
     * Thay đổi mật khẩu
     */
    public void changePassword(Integer userId, Map<String, String> passwordData) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = userOpt.get();
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Upload avatar
     */
    public String uploadAvatar(Integer userId, MultipartFile file) {
        // Mock implementation - trong thực tế sẽ upload lên cloud storage
        return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
    }

    /**
     * Lấy thông tin thành tích
     */
    public Map<String, Object> getAchievements(Integer userId) {
        List<Booking> userBookings = bookingRepository.findByUserId(userId);
        Map<String, Object> achievements = new HashMap<>();
        
        List<Map<String, Object>> achievementList = new ArrayList<>();
        
        // Achievement dựa trên số booking
        if (userBookings.size() >= 10) {
            Map<String, Object> achievement = new HashMap<>();
            achievement.put("id", 1);
            achievement.put("name", "Khách hàng thân thiết");
            achievement.put("icon", "🏆");
            achievement.put("description", "Đặt sân 10 lần");
            achievement.put("achieved", true);
            achievementList.add(achievement);
        }
        
        // Achievement dựa trên completed bookings
        long completedBookings = userBookings.stream()
                .filter(b -> "Đã hoàn thành".equals(b.getStatus().getName()))
                .count();
        
        if (completedBookings >= 5) {
            Map<String, Object> achievement = new HashMap<>();
            achievement.put("id", 2);
            achievement.put("name", "Người chơi tích cực");
            achievement.put("icon", "⚡");
            achievement.put("description", "Hoàn thành 5 booking");
            achievement.put("achieved", true);
            achievementList.add(achievement);
        }
        
        achievements.put("achievements", achievementList);
        achievements.put("totalAchievements", achievementList.size());
        
        return achievements;
    }

    /**
     * Lấy cài đặt tài khoản
     */
    public Map<String, Object> getSettings(Integer userId) {
        Map<String, Object> settings = new HashMap<>();
        
        // Mock settings
        settings.put("notifications", Map.of(
            "email", true,
            "sms", false,
            "push", true
        ));
        settings.put("privacy", Map.of(
            "profilePublic", false,
            "showBookingHistory", false
        ));
        settings.put("preferences", Map.of(
            "language", "vi",
            "timezone", "Asia/Ho_Chi_Minh",
            "currency", "VND"
        ));
        
        return settings;
    }

    /**
     * Cập nhật cài đặt
     */
    public void updateSettings(Integer userId, Map<String, Object> settingsData) {
        // Mock implementation - trong thực tế sẽ lưu vào UserSettings table
        // Có thể tạo thêm entity UserSettings để lưu các cài đặt
    }

    /**
     * Lấy lịch sử đăng nhập
     */
    public List<Map<String, Object>> getLoginHistory(Integer userId, int limit) {
        // Mock implementation - trong thực tế sẽ có table LoginHistory
        List<Map<String, Object>> loginHistory = new ArrayList<>();
        
        for (int i = 0; i < Math.min(limit, 5); i++) {
            Map<String, Object> login = new HashMap<>();
            login.put("id", i + 1);
            login.put("loginTime", LocalDateTime.now().minusDays(i));
            login.put("ipAddress", "192.168.1." + (100 + i));
            login.put("device", "Chrome on Windows");
            login.put("location", "Ho Chi Minh City, Vietnam");
            loginHistory.add(login);
        }
        
        return loginHistory;
    }

    /**
     * Xóa tài khoản
     */
    public void deleteAccount(Integer userId, Map<String, String> confirmData) {
        String confirmPassword = confirmData.get("password");
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = userOpt.get();
        
        // Kiểm tra mật khẩu xác nhận
        if (!passwordEncoder.matches(confirmPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không đúng");
        }
        
        // Trong thực tế, có thể soft delete thay vì hard delete
        // user.setDeleted(true);
        // user.setDeletedAt(LocalDateTime.now());
        // userRepository.save(user);
        
        // Hoặc hard delete (cần cẩn thận với foreign keys)
        // userRepository.delete(user);
        
        throw new RuntimeException("Tính năng xóa tài khoản chưa được kích hoạt");
    }

    /**
     * Tính membership level dựa trên số booking
     */
    private String calculateMembershipLevel(int totalBookings) {
        if (totalBookings >= 50) {
            return "Platinum";
        } else if (totalBookings >= 20) {
            return "Gold";
        } else if (totalBookings >= 10) {
            return "Silver";
        } else {
            return "Bronze";
        }
    }
} 