package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Notification;
import com.example.shuttlesync.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerNotificationController {

    private final NotificationService notificationService;

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
}