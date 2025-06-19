package com.example.shuttlesync.controller.customer;

import com.example.shuttlesync.service.VoucherAutoGiftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer/test-auto-gift")
@RequiredArgsConstructor
@Slf4j
public class TestAutoGiftController {

    private final VoucherAutoGiftService voucherAutoGiftService;

    /**
     * Test chạy auto-gift thủ công cho tất cả khách hàng
     */
    @PostMapping("/run-all")
    public ResponseEntity<?> runAutoGiftForAll() {
        try {
            log.info("🧪 [TEST] Chạy auto-gift thủ công cho tất cả khách hàng");
            
            voucherAutoGiftService.autoGiftVouchersForAllCustomers();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Đã chạy auto-gift cho tất cả khách hàng"
            ));
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi chạy auto-gift: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Test chạy auto-gift cho một khách hàng cụ thể
     */
    @PostMapping("/run-customer")
    public ResponseEntity<?> runAutoGiftForCustomer(@RequestParam String email) {
        try {
            log.info("🧪 [TEST] Chạy auto-gift thủ công cho khách hàng: {}", email);
            
            int vouchersGifted = voucherAutoGiftService.giftVouchersForCustomer(email);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", String.format("✅ Đã tặng %d voucher cho %s", vouchersGifted, email),
                "vouchersGifted", vouchersGifted
            ));
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi chạy auto-gift cho khách hàng: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra trạng thái scheduled job
     */
    @GetMapping("/status")
    public ResponseEntity<?> getAutoGiftStatus() {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Auto-gift service đang hoạt động",
                "scheduledRate", "Mỗi 1 phút",
                "lastCheck", new java.util.Date()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
} 