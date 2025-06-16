package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Notification;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.NotificationService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerNotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

//    @PostMapping("/notifications")
//    public ResponseEntity<Map<String, Object>> getNotifications(@RequestBody Map<String, Object> request) {
//        try {
//            Integer userId = (Integer) request.get("userId");
//
//            User user = userService.findById(userId);
//            if (user == null) {
//                Map<String, Object> errorResponse = new HashMap<>();
//                errorResponse.put("success", false);
//                errorResponse.put("message", "User not found");
//                return ResponseEntity.badRequest().body(errorResponse);
//            }
//
//            List<Notification> notifications = notificationService.getNotificationsByUser(user);
//
//            // Convert to response format
//            List<Map<String, Object>> notificationData = notifications.stream()
//                .map(notification -> {
//                    Map<String, Object> data = new HashMap<>();
//                    data.put("id", notification.getId());
//                    data.put("message", notification.getMessage());
//                    data.put("isRead", notification.getIsRead());
//                    data.put("createdAt", notification.getCreatedAt().toString());
//                    return data;
//                })
//                .collect(Collectors.toList());
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("success", true);
//            response.put("data", notificationData);
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("success", false);
//            errorResponse.put("message", "Error fetching notifications: " + e.getMessage());
//            return ResponseEntity.badRequest().body(errorResponse);
//        }
//    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Integer id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            
            Map<String, Object> response = new HashMap<>();
            if (notification != null) {
                response.put("success", true);
                response.put("message", "Notification marked as read");
            } else {
                response.put("success", false);
                response.put("message", "Notification not found");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error marking notification as read: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Integer id) {
        try {
            notificationService.deleteNotification(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification deleted");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error deleting notification: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

//    @PutMapping("/notifications/mark-all-read")
//    public ResponseEntity<Map<String, Object>> markAllAsRead(@RequestBody Map<String, Object> request) {
//        try {
//            Integer userId = (Integer) request.get("userId");
//
//            User user = userService.findById(userId);
//            if (user == null) {
//                Map<String, Object> errorResponse = new HashMap<>();
//                errorResponse.put("success", false);
//                errorResponse.put("message", "User not found");
//                return ResponseEntity.badRequest().body(errorResponse);
//            }
//
//            List<Notification> notifications = notificationService.getUnreadNotificationsByUser(user);
//            for (Notification notification : notifications) {
//                notificationService.markAsRead(notification.getId());
//            }
//            
//            Map<String, Object> response = new HashMap<>();
//            response.put("success", true);
//            response.put("message", "All notifications marked as read");
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("success", false);
//            errorResponse.put("message", "Error marking all notifications as read: " + e.getMessage());
//            return ResponseEntity.badRequest().body(errorResponse);
//        }
//    }
}