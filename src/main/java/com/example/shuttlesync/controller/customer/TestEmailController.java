package com.example.shuttlesync.controller.customer;

import com.example.shuttlesync.service.VoucherEmailService;
import com.example.shuttlesync.service.SimpleEmailTestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer/test-email")
@RequiredArgsConstructor
@Slf4j
public class TestEmailController {

    private final VoucherEmailService voucherEmailService;
    private final SimpleEmailTestService simpleEmailTestService;

    @PostMapping("/voucher")
    public ResponseEntity<?> testVoucherEmail(@RequestParam String email) {
        try {
            log.info("🧪 [PUBLIC] Test gửi email voucher đến: {}", email);
            
            boolean sent = voucherEmailService.sendTestVoucherEmail(email);
            
            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "✅ Đã gửi email test voucher thành công đến: " + email
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể gửi email test voucher"
                ));
            }
            
        } catch (Exception e) {
            log.error("Lỗi khi test email voucher: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/process-pending")
    public ResponseEntity<?> processPendingEmails() {
        try {
            log.info("🔄 [PUBLIC] Xử lý email voucher chờ gửi");
            
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

    @PostMapping("/simple")
    public ResponseEntity<?> sendSimpleEmail(@RequestParam String email) {
        try {
            log.info("🧪 [PUBLIC] Test gửi email đơn giản đến: {}", email);
            
            boolean sent = simpleEmailTestService.sendSimpleTestEmail(email);
            
            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "✅ Đã gửi email đơn giản thành công đến: " + email
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ Không thể gửi email đơn giản"
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email đơn giản: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<?> checkEmailConfig() {
        try {
            String config = simpleEmailTestService.checkEmailConfig();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "config", config
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
} 