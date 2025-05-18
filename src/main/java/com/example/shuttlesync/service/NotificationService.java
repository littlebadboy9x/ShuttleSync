package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Notification;
import com.example.shuttlesync.model.User;

import java.util.List;
import java.util.Optional;

public interface NotificationService {
    
    List<Notification> getAllNotifications();
    
    Optional<Notification> getNotificationById(Integer id);
    
    List<Notification> getNotificationsByUser(User user);
    
    List<Notification> getUnreadNotificationsByUser(User user);
    
    Notification createNotification(Notification notification);
    
    Notification markAsRead(Integer id);
    
    void deleteNotification(Integer id);

    void sendNotification(Integer userId, String message);
} 