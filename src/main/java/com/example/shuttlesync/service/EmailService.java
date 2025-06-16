package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.User;

public interface EmailService {
    
    /**
     * Gửi email xác nhận đặt sân
     */
    void sendBookingConfirmationEmail(User user, Booking booking);
    
    /**
     * Gửi email nhắc nhở thanh toán
     */
    void sendPaymentReminderEmail(User user, Booking booking);
    
    /**
     * Gửi email thông báo hủy booking
     */
    void sendBookingCancellationEmail(User user, Booking booking);
    
    /**
     * Gửi email thông báo chung
     */
    void sendNotificationEmail(String to, String subject, String content);
} 