package com.example.shuttlesync.controller.admin;

import com.example.shuttlesync.service.VoucherEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/voucher-emails")
@RequiredArgsConstructor
@Slf4j
public class VoucherEmailController {

    private final VoucherEmailService voucherEmailService;

    /**
     * Test gửi email voucher
     */
    @PostMapping("/test")
    public ResponseEntity<?> testVoucherEmail(@RequestParam String email) {
        try {
            log.info("🧪 Test gửi email voucher đến: {}", email);
            
            boolean sent = voucherEmailService.sendTestVoucherEmail(email);
            
            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "✅ Đã gửi email test voucher thành công đến: " + email
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ Không thể gửi email test voucher"
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi test email voucher: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Gửi email voucher thủ công cho user
     */
    @PostMapping("/send-manual")
    public ResponseEntity<?> sendManualVoucherEmail(
            @RequestParam Integer userId,
            @RequestParam Integer voucherId) {
        try {
            log.info("📤 Gửi email voucher thủ công - User: {}, Voucher: {}", userId, voucherId);
            
            boolean sent = voucherEmailService.sendVoucherEmailToUser(userId, voucherId);
            
            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "✅ Đã gửi email voucher thành công"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ Không thể gửi email voucher"
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email voucher thủ công: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Xử lý email voucher chờ gửi (trigger thủ công)
     */
    @PostMapping("/process-pending")
    public ResponseEntity<?> processPendingEmails() {
        try {
            log.info("🔄 Xử lý email voucher chờ gửi (thủ công)");
            
            voucherEmailService.processVoucherEmails();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Đã xử lý email voucher chờ gửi"
            ));
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý email voucher: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra trạng thái email service
     */
    @GetMapping("/status")
    public ResponseEntity<?> getEmailServiceStatus() {
        try {
            Map<String, Object> status = voucherEmailService.getEmailServiceStatus();
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi kiểm tra trạng thái email service: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy danh sách email logs
     */
    @GetMapping("/logs")
    public ResponseEntity<?> getEmailLogs(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "VOUCHER") String type) {
        try {
            // Có thể thêm method này vào VoucherEmailService nếu cần
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Chức năng đang phát triển"
            ));
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi lấy email logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }
} 