package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendBookingConfirmationEmail(User user, Booking booking) {
        try {
            String subject = "🎾 Xác nhận đặt sân - ShuttleSync";
            String content = buildBookingConfirmationContent(user, booking);
            
            // Gửi email thật
            sendEmail(user.getEmail(), subject, content);
            
            log.info("✅ Email xác nhận đã được gửi thành công đến: {}", user.getEmail());
            System.out.println("📧 Email xác nhận đã được gửi đến: " + user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send booking confirmation email to: {}", user.getEmail(), e);
            System.err.println("❌ Lỗi gửi email xác nhận đến: " + user.getEmail() + " - " + e.getMessage());
        }
    }

    @Override
    public void sendPaymentReminderEmail(User user, Booking booking) {
        try {
            String subject = "💳 Nhắc nhở thanh toán - ShuttleSync";
            String content = buildPaymentReminderContent(user, booking);
            
            // Gửi email thật
            sendEmail(user.getEmail(), subject, content);
            
            log.info("✅ Email nhắc nhở thanh toán đã được gửi thành công đến: {}", user.getEmail());
            System.out.println("📧 Email nhắc nhở thanh toán đã được gửi đến: " + user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send payment reminder email to: {}", user.getEmail(), e);
            System.err.println("❌ Lỗi gửi email nhắc nhở thanh toán đến: " + user.getEmail() + " - " + e.getMessage());
        }
    }

    @Override
    public void sendBookingCancellationEmail(User user, Booking booking) {
        try {
            String subject = "❌ Thông báo hủy đặt sân - ShuttleSync";
            String content = buildBookingCancellationContent(user, booking);
            
            // Gửi email thật
            sendEmail(user.getEmail(), subject, content);
            
            log.info("✅ Email thông báo hủy đã được gửi thành công đến: {}", user.getEmail());
            System.out.println("📧 Email thông báo hủy đã được gửi đến: " + user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send booking cancellation email to: {}", user.getEmail(), e);
            System.err.println("❌ Lỗi gửi email thông báo hủy đến: " + user.getEmail() + " - " + e.getMessage());
        }
    }

    @Override
    public void sendNotificationEmail(String to, String subject, String content) {
        try {
            // Gửi email thật
            sendEmail(to, subject, content);
            
            log.info("✅ Email thông báo đã được gửi thành công đến: {}", to);
            System.out.println("📧 Email thông báo đã được gửi đến: " + to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}", to, e);
            System.err.println("❌ Lỗi gửi email thông báo đến: " + to + " - " + e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("shuttlesync.system@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        log.info("Đang gửi email đến: {} với subject: {}", to, subject);
        mailSender.send(message);
        log.info("Email đã được gửi thành công!");
    }

    private String buildBookingConfirmationContent(User user, Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        return String.format("""
            Xin chào %s,
            
            Đặt sân của bạn đã được XÁC NHẬN thành công! 🎉
            
            📋 THÔNG TIN ĐẶT SÂN:
            • Mã đặt sân: #%d
            • Sân: %s
            • Ngày: %s
            • Giờ: %s - %s
            • Giá: %,.0f VNĐ
            
            💳 THANH TOÁN:
            Vui lòng truy cập hệ thống để tiến hành thanh toán:
            👉 http://localhost:3000/customer/payment
            
            📞 HỖ TRỢ:
            Nếu có thắc mắc, vui lòng liên hệ:
            • Hotline: 1900-xxxx
            • Email: support@shuttlesync.com
            
            Cảm ơn bạn đã sử dụng dịch vụ ShuttleSync!
            
            ---
            ShuttleSync - Hệ thống đặt sân cầu lông
            """,
            user.getFullName(),
            booking.getId(),
            booking.getCourt().getName(),
            booking.getBookingDate().format(dateFormatter),
            booking.getTimeSlot().getStartTime().format(timeFormatter),
            booking.getTimeSlot().getEndTime().format(timeFormatter),
            booking.getTimeSlot().getPrice()
        );
    }

    private String buildPaymentReminderContent(User user, Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        return String.format("""
            Xin chào %s,
            
            Bạn có đơn đặt sân chưa thanh toán! ⏰
            
            📋 THÔNG TIN ĐẶT SÂN:
            • Mã đặt sân: #%d
            • Sân: %s
            • Ngày: %s
            • Giờ: %s - %s
            • Giá: %,.0f VNĐ
            
            💳 THANH TOÁN NGAY:
            Vui lòng truy cập hệ thống để thanh toán:
            👉 http://localhost:3000/customer/payment
            
            ⚠️ LƯU Ý:
            Vui lòng thanh toán trước 24h để đảm bảo giữ chỗ.
            
            Cảm ơn bạn đã sử dụng dịch vụ ShuttleSync!
            
            ---
            ShuttleSync - Hệ thống đặt sân cầu lông
            """,
            user.getFullName(),
            booking.getId(),
            booking.getCourt().getName(),
            booking.getBookingDate().format(dateFormatter),
            booking.getTimeSlot().getStartTime().format(timeFormatter),
            booking.getTimeSlot().getEndTime().format(timeFormatter),
            booking.getTimeSlot().getPrice()
        );
    }

    private String buildBookingCancellationContent(User user, Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        return String.format("""
            Xin chào %s,
            
            Đặt sân của bạn đã bị HỦY! ❌
            
            📋 THÔNG TIN ĐẶT SÂN ĐÃ HỦY:
            • Mã đặt sân: #%d
            • Sân: %s
            • Ngày: %s
            • Giờ: %s - %s
            
            📞 HỖ TRỢ:
            Nếu có thắc mắc về việc hủy đặt sân, vui lòng liên hệ:
            • Hotline: 1900-xxxx
            • Email: support@shuttlesync.com
            
            Cảm ơn bạn đã sử dụng dịch vụ ShuttleSync!
            
            ---
            ShuttleSync - Hệ thống đặt sân cầu lông
            """,
            user.getFullName(),
            booking.getId(),
            booking.getCourt().getName(),
            booking.getBookingDate().format(dateFormatter),
            booking.getTimeSlot().getStartTime().format(timeFormatter),
            booking.getTimeSlot().getEndTime().format(timeFormatter)
        );
    }
} 