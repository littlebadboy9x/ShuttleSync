package com.example.shuttlesync.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimpleEmailTestService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Test gửi email đơn giản
     */
    public boolean sendSimpleTestEmail(String toEmail) {
        try {
            log.info("🧪 Gửi email đơn giản đến: {}", toEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🎉 Thông báo từ ShuttleSync");
            message.setText("Xin chào!\n\n" +
                          "Đây là email thông báo từ hệ thống ShuttleSync.\n\n" +
                          "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!\n\n" +
                          "Thời gian: " + new java.util.Date() + "\n" +
                          "Từ: " + fromEmail);

            mailSender.send(message);
            
            log.info("✅ Đã gửi email thành công!");
            return true;
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Kiểm tra cấu hình email
     */
    public String checkEmailConfig() {
        try {
            return String.format("Email config: From=%s, Host=smtp.gmail.com, Port=587", fromEmail);
        } catch (Exception e) {
            return "Lỗi khi kiểm tra config: " + e.getMessage();
        }
    }
} 