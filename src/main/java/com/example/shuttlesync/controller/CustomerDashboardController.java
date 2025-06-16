package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.DashboardStatsDto;
import com.example.shuttlesync.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/customer/dashboard")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('CUSTOMER')") // Tạm thời disable để test
public class CustomerDashboardController {

    private final CustomerDashboardService dashboardService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Dashboard API is working");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = userDetails.getUsername();
            DashboardStatsDto stats = dashboardService.getDashboardStats(email);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            // Return dummy data for testing
            DashboardStatsDto dummyStats = DashboardStatsDto.builder()
                    .totalBookings(2)
                    .completedBookings(1)
                    .upcomingBookings(1)
                    .cancelledBookings(0)
                    .totalSpent(200000.0)
                    .totalSaved(0.0)
                    .favoriteCourtId(1)
                    .favoriteCourtName("Sân 1")
                    .loyaltyPoints(20)
                    .membershipLevel("Bronze")
                    .build();
            return ResponseEntity.ok(dummyStats);
        }
    }

    @GetMapping("/recent-bookings")
    public ResponseEntity<List<Map<String, Object>>> getRecentBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            String email;
            if (userDetails != null) {
                email = userDetails.getUsername();
            } else {
                // For testing - use default email
                email = "user1@example.com";
            }
        List<Map<String, Object>> bookings = dashboardService.getRecentBookings(email, limit);
        return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            // Return empty list on error
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/available-courts")
    public ResponseEntity<List<Map<String, Object>>> getAvailableCourts() {
        List<Map<String, Object>> courts = dashboardService.getAvailableCourts();
        return ResponseEntity.ok(courts);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit) {
        String email = userDetails.getUsername();
        List<Map<String, Object>> notifications = dashboardService.getNotifications(email, limit);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user-profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email;
            if (userDetails != null) {
                email = userDetails.getUsername();
            } else {
                // For testing - use default email
                email = "user1@example.com";
            }
        Map<String, Object> profile = dashboardService.getUserProfile(email);
        return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            // Return empty profile on error
            Map<String, Object> emptyProfile = new HashMap<>();
            emptyProfile.put("fullName", "Test User");
            emptyProfile.put("email", "user1@example.com");
            emptyProfile.put("phone", "");
            emptyProfile.put("membershipLevel", "Bronze");
            return ResponseEntity.ok(emptyProfile);
        }
    }
} 