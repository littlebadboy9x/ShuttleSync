package com.example.shuttlesync.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherEmailService {

    private final JavaMailSender mailSender;
    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.mail.username:noreply@shuttlesync.com}")
    private String fromEmail;

    @Value("${app.name:ShuttleSync}")
    private String appName;

    /**
     * Xử lý email voucher chờ gửi (chạy tự động mỗi phút)
     */
    @Scheduled(fixedRate = 60000)
    public void processVoucherEmails() {
        try {
            // Log đơn giản để kiểm tra job có chạy không
            System.out.println("=== SCHEDULED JOB RUNNING === " + new java.util.Date());
            log.info("[SCHEDULED] Bắt đầu xử lý email voucher chờ gửi... Time: {}", new java.util.Date());

            String sql = """
                SELECT Id, ToEmail, Subject, Body, RelatedId
                FROM EmailLogs 
                WHERE Status = 'PENDING' AND RelatedType = 'VOUCHER'
                ORDER BY CreatedAt
                """;

            List<Map<String, Object>> pendingEmails = jdbcTemplate.queryForList(sql);

            log.info("[SCHEDULED] Tìm thấy {} email voucher chờ gửi", pendingEmails.size());
            System.out.println("=== FOUND " + pendingEmails.size() + " PENDING EMAILS ===");

            if (pendingEmails.isEmpty()) {
                log.debug("[SCHEDULED] Không có email voucher nào cần gửi");
                System.out.println("=== NO PENDING EMAILS ===");
                return;
            }

            int successCount = 0;
            int failCount = 0;

            for (Map<String, Object> email : pendingEmails) {
                Integer emailId = (Integer) email.get("Id");
                String toEmail = (String) email.get("ToEmail");
                String subject = (String) email.get("Subject");
                Integer voucherId = (Integer) email.get("RelatedId");

                log.info("[SCHEDULED] Đang gửi email voucher #{} đến: {}", emailId, toEmail);
                System.out.println("=== SENDING EMAIL " + emailId + " TO " + toEmail + " ===");

                boolean sent = sendVoucherEmailFromDatabase(toEmail, subject, voucherId);

                if (sent) {
                    updateEmailStatus(emailId, "SENT", null);
                    updateVoucherEmailSent(voucherId, toEmail);
                    successCount++;
                    log.info("[SCHEDULED] Gửi email voucher #{} thành công", emailId);
                    System.out.println("=== EMAIL " + emailId + " SENT SUCCESS ===");
                } else {
                    updateEmailStatus(emailId, "FAILED", "Không thể gửi email voucher");
                    failCount++;
                    log.error("[SCHEDULED] Gửi email voucher #{} thất bại", emailId);
                    System.out.println("=== EMAIL " + emailId + " FAILED ===");
                }
            }

            log.info("[SCHEDULED] Kết quả gửi email voucher: {} thành công, {} thất bại", successCount, failCount);
            System.out.println("=== RESULT: " + successCount + " success, " + failCount + " failed ===");

        } catch (Exception e) {
            log.error("[SCHEDULED] Lỗi khi xử lý email voucher: {}", e.getMessage(), e);
            System.out.println("=== SCHEDULED JOB ERROR: " + e.getMessage() + " ===");
            e.printStackTrace();
        }
    }

    /**
     * Gửi email voucher từ database
     */
    private boolean sendVoucherEmailFromDatabase(String toEmail, String subject, Integer voucherId) {
        try {
            // Lấy thông tin voucher và khách hàng
            String sql = """
                SELECT 
                    d.Code as VoucherCode,
                    d.Name as VoucherName,
                    d.Description as VoucherDescription,
                    d.Type as VoucherType,
                    d.Value as VoucherValue,
                    d.ValidFrom,
                    d.ValidTo,
                    u.FullName as CustomerName,
                    u.Email as CustomerEmail
                FROM PersonalVouchers pv
                JOIN Discounts d ON pv.VoucherId = d.Id
                JOIN Users u ON pv.UserId = u.Id
                WHERE d.Id = ? AND u.Email = ?
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, voucherId, toEmail);

            if (results.isEmpty()) {
                log.error("❌ Không tìm thấy thông tin voucher {} cho email {}", voucherId, toEmail);
                return false;
            }

            Map<String, Object> voucherInfo = results.get(0);
            String voucherCode = (String) voucherInfo.get("VoucherCode");
            String voucherName = (String) voucherInfo.get("VoucherName");
            String customerName = (String) voucherInfo.get("CustomerName");

            return sendVoucherEmail(toEmail, subject, voucherCode, voucherName, customerName);

        } catch (Exception e) {
            log.error("❌ Lỗi khi lấy thông tin voucher từ database: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gửi email voucher với template HTML đẹp
     */
    public boolean sendVoucherEmail(String toEmail, String subject, String voucherCode, String voucherName, String customerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = createVoucherEmailTemplate(voucherCode, voucherName, customerName);
            helper.setText(htmlContent, true);
            
            // Đảm bảo encoding UTF-8
            message.setHeader("Content-Type", "text/html; charset=UTF-8");

            mailSender.send(message);
            log.info("✅ Đã gửi email voucher {} thành công đến: {}", voucherCode, toEmail);
            return true;

        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email voucher đến {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    /**
     * Gửi email voucher thủ công cho user cụ thể
     */
    public boolean sendVoucherEmailToUser(Integer userId, Integer voucherId) {
        try {
            String sql = """
                SELECT 
                    u.Email,
                    u.FullName,
                    d.Code,
                    d.Name
                FROM Users u
                JOIN PersonalVouchers pv ON u.Id = pv.UserId
                JOIN Discounts d ON pv.VoucherId = d.Id
                WHERE u.Id = ? AND d.Id = ?
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, userId, voucherId);

            if (results.isEmpty()) {
                log.error("❌ Không tìm thấy voucher {} cho user {}", voucherId, userId);
                return false;
            }

            Map<String, Object> info = results.get(0);
            String email = (String) info.get("Email");
            String fullName = (String) info.get("FullName");
            String code = (String) info.get("Code");
            String name = (String) info.get("Name");

            String subject = "🎉 Bạn đã nhận được voucher đặc biệt từ " + appName;
            
            boolean sent = sendVoucherEmail(email, subject, code, name, fullName);

            if (sent) {
                updateVoucherEmailSent(voucherId, email);
            }

            return sent;

        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email voucher thủ công: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Cập nhật trạng thái email trong database
     */
    private void updateEmailStatus(Integer emailId, String status, String errorMessage) {
        try {
            String sql = """
                UPDATE EmailLogs 
                SET Status = ?, 
                    SentAt = CASE WHEN ? = 'SENT' THEN GETDATE() ELSE SentAt END,
                    ErrorMessage = ?
                WHERE Id = ?
                """;

            jdbcTemplate.update(sql, status, status, errorMessage, emailId);

        } catch (Exception e) {
            log.error("❌ Lỗi khi cập nhật trạng thái email: {}", e.getMessage());
        }
    }

    /**
     * Cập nhật trạng thái đã gửi email cho voucher
     */
    private void updateVoucherEmailSent(Integer voucherId, String email) {
        try {
            String sql = """
                UPDATE PersonalVouchers 
                SET EmailSent = 1, EmailSentAt = GETDATE()
                WHERE VoucherId = ? 
                AND UserId = (SELECT Id FROM Users WHERE Email = ?)
                AND EmailSent = 0
                """;

            int updated = jdbcTemplate.update(sql, voucherId, email);
            
            if (updated > 0) {
                log.info("✅ Đã cập nhật trạng thái email cho voucher {}", voucherId);
            }

        } catch (Exception e) {
            log.error("❌ Lỗi khi cập nhật trạng thái voucher: {}", e.getMessage());
        }
    }

    /**
     * Tạo template email voucher HTML đẹp
     */
    private String createVoucherEmailTemplate(String voucherCode, String voucherName, String customerName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Voucher Đặc Biệt - %s</title>
                <style>
                    body { 
                        font-family: 'Arial', 'Helvetica', sans-serif; 
                        margin: 0; padding: 0; background-color: #f5f5f5; 
                        line-height: 1.6;
                    }
                    .container { 
                        max-width: 600px; margin: 0 auto; background-color: white; 
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
                    }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                        color: white; padding: 30px; text-align: center; 
                    }
                    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                    .content { padding: 30px; }
                    .voucher-card { 
                        background: linear-gradient(135deg, #ffecd2 0%%, #fcb69f 100%%); 
                        border-radius: 15px; padding: 25px; margin: 20px 0; 
                        text-align: center; border: 2px dashed #ff6b6b; 
                    }
                    .voucher-code { 
                        font-size: 32px; font-weight: bold; color: #e74c3c; 
                        margin: 15px 0; letter-spacing: 3px; 
                        background: white; padding: 10px; border-radius: 10px;
                    }
                    .voucher-name { 
                        font-size: 20px; color: #2c3e50; margin: 10px 0; font-weight: bold;
                    }
                    .btn { 
                        display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 25px; margin: 20px 0; font-weight: bold; 
                    }
                    .footer { 
                        background-color: #34495e; color: white; 
                        padding: 20px; text-align: center; font-size: 14px; 
                    }
                    .steps { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .steps ol { margin: 0; padding-left: 20px; }
                    .steps li { margin: 8px 0; }
                    .highlight { background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏸 %s</h1>
                        <p>Hệ thống đặt sân cầu lông trực tuyến</p>
                    </div>
                    
                    <div class="content">
                        <h2>Xin chào %s! 👋</h2>
                        
                        <p>Chúc mừng! Bạn đã nhận được một voucher đặc biệt từ <strong>%s</strong>:</p>
                        
                        <div class="voucher-card">
                            <div style="font-size: 24px;">🎁</div>
                            <div class="voucher-name">%s</div>
                            <div class="voucher-code">%s</div>
                            <p><strong>Sử dụng mã này khi đặt sân để nhận ưu đãi!</strong></p>
                        </div>
                        
                        <div class="steps">
                            <p><strong>🔥 Cách sử dụng voucher:</strong></p>
                            <ol>
                                <li><strong>Đăng nhập</strong> vào tài khoản của bạn</li>
                                <li><strong>Chọn sân</strong> và thời gian muốn đặt</li>
                                <li><strong>Nhập mã voucher</strong> <span class="highlight">%s</span> khi thanh toán</li>
                                <li><strong>Nhận ngay ưu đãi</strong> đặc biệt!</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:3000" class="btn">Đặt Sân Ngay 🚀</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            <em>⚠️ Lưu ý: Voucher có thể có điều kiện sử dụng và thời hạn nhất định. 
                            Vui lòng kiểm tra chi tiết trong tài khoản của bạn.</em>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>📞 Hotline: 1900-xxxx | 📧 Email: support@shuttlesync.com</p>
                        <p>&copy; 2025 %s. All rights reserved.</p>
                        <p style="font-size: 12px; margin-top: 10px;">
                            Bạn nhận được email này vì đã đăng ký tài khoản tại %s
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            appName, appName, customerName, appName, voucherName, voucherCode, voucherCode, appName, appName);
    }

    /**
     * Gửi email test cho voucher
     */
    public boolean sendTestVoucherEmail(String toEmail) {
        try {
            String subject = "🎉 Bạn đã nhận được voucher đặc biệt từ " + appName;
            return sendVoucherEmail(toEmail, subject, "WELCOME2025", "Voucher chào mừng", "Khách hàng thân mến");
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email voucher: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra trạng thái email service
     */
    public Map<String, Object> getEmailServiceStatus() {
        try {
            String sql = """
                SELECT 
                    Status,
                    COUNT(*) as Count
                FROM EmailLogs 
                WHERE RelatedType = 'VOUCHER'
                GROUP BY Status
                """;

            List<Map<String, Object>> statusList = jdbcTemplate.queryForList(sql);
            
            return Map.of(
                "status", "OK",
                "emailStats", statusList,
                "lastCheck", new java.util.Date()
            );

        } catch (Exception e) {
            log.error("❌ Lỗi khi kiểm tra trạng thái email service: {}", e.getMessage());
            return Map.of(
                "status", "ERROR",
                "error", e.getMessage(),
                "lastCheck", new java.util.Date()
            );
        }
    }
} 