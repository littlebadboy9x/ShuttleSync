package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.CreateVoucherRequest;
import com.example.shuttlesync.dto.UpdateVoucherStatusRequest;
import com.example.shuttlesync.dto.VoucherDTO;
import com.example.shuttlesync.model.Discount;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.UserService;
import com.example.shuttlesync.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/vouchers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class VoucherController {

    private final VoucherService voucherService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<VoucherDTO>> getAllVouchers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching vouchers with filters - status: {}, type: {}, search: {}", status, type, search);

        List<Discount> vouchers;

        if (search != null && !search.trim().isEmpty()) {
            vouchers = voucherService.searchVouchers(search);
        } else if (status != null && !status.equals("all")) {
            vouchers = voucherService.getVouchersByStatus(status);
        } else if (type != null && !type.equals("all")) {
            vouchers = voucherService.getVouchersByType(type);
        } else if (startDate != null && endDate != null) {
            vouchers = voucherService.getVouchersByDateRange(startDate, endDate);
        } else {
            vouchers = voucherService.getAllVouchers();
        }

        // Update expired vouchers before returning
        voucherService.updateExpiredVouchers();

        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable Integer id) {
        log.info("Fetching voucher with id: {}", id);

        return voucherService.getVoucherById(id)
                .map(voucher -> ResponseEntity.ok(convertToDTO(voucher)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<VoucherDTO> getVoucherByCode(@PathVariable String code) {
        log.info("Fetching voucher with code: {}", code);

        return voucherService.getVoucherByCode(code)
                .map(voucher -> ResponseEntity.ok(convertToDTO(voucher)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VoucherDTO> createVoucher(@RequestBody CreateVoucherRequest request, Authentication authentication) {
        log.info("Creating voucher with code: {}", request.getCode());

        try {
            Discount voucher = convertFromRequest(request);
            Discount savedVoucher = voucherService.createVoucher(voucher);

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedVoucher));
        } catch (IllegalArgumentException e) {
            log.error("Error creating voucher: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherDTO> updateVoucher(@PathVariable Integer id, @RequestBody CreateVoucherRequest request, Authentication authentication) {
        log.info("Updating voucher: {}", id);

        return voucherService.getVoucherById(id)
                .map(existingVoucher -> {
                    try {
                        Discount updatedVoucher = convertFromRequest(request);
                        updatedVoucher.setId(id);

                        Discount savedVoucher = voucherService.updateVoucher(updatedVoucher);
                        return ResponseEntity.ok(convertToDTO(savedVoucher));
                    } catch (IllegalArgumentException e) {
                        log.error("Error updating voucher: {}", e.getMessage());
                        return ResponseEntity.badRequest().<VoucherDTO>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VoucherDTO> updateVoucherStatus(@PathVariable Integer id, @RequestBody UpdateVoucherStatusRequest request, Authentication authentication) {
        log.info("Updating voucher {} status to: {}", id, request.getStatus());

        try {
            Discount updatedVoucher = voucherService.updateVoucherStatus(id, request.getStatus(), getCurrentUser(authentication));
            return ResponseEntity.ok(convertToDTO(updatedVoucher));
        } catch (IllegalArgumentException e) {
            log.error("Error updating voucher status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<VoucherDTO> toggleVoucherStatus(@PathVariable Integer id, Authentication authentication) {
        log.info("Toggling voucher {} status", id);

        try {
            Discount updatedVoucher = voucherService.toggleVoucherStatus(id, getCurrentUser(authentication));
            return ResponseEntity.ok(convertToDTO(updatedVoucher));
        } catch (IllegalArgumentException e) {
            log.error("Error toggling voucher status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Integer id) {
        log.info("Deleting voucher: {}", id);

        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting voucher: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<VoucherDTO>> getActiveVouchers() {
        log.info("Fetching active vouchers");

        List<Discount> activeVouchers = voucherService.getActiveVouchers();
        List<VoucherDTO> voucherDTOs = activeVouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/available")
    public ResponseEntity<List<VoucherDTO>> getAvailableVouchers(@RequestParam BigDecimal amount) {
        log.info("Fetching available vouchers for amount: {}", amount);

        List<Discount> availableVouchers = voucherService.getAvailableVouchersForAmount(amount);
        List<VoucherDTO> voucherDTOs = availableVouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(voucherDTOs);
    }

    @PostMapping("/calculate-discount")
    public ResponseEntity<BigDecimal> calculateDiscount(@RequestParam String code, @RequestParam BigDecimal amount) {
        log.info("Calculating discount for voucher: {} with amount: {}", code, amount);

        try {
            BigDecimal discount = voucherService.calculateDiscount(code, amount);
            return ResponseEntity.ok(discount);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error calculating discount: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateVoucher(@RequestParam String code, @RequestParam BigDecimal amount) {
        log.info("Validating voucher: {} for amount: {}", code, amount);

        boolean canUse = voucherService.canUseVoucher(code, amount);
        return ResponseEntity.ok(canUse);
    }

    @PostMapping("/{code}/use")
    public ResponseEntity<VoucherDTO> useVoucher(@PathVariable String code, @RequestParam BigDecimal amount, Authentication authentication) {
        log.info("Using voucher: {} for amount: {}", code, amount);

        try {
            Discount usedVoucher = voucherService.useVoucher(code, amount, getCurrentUser(authentication));
            return ResponseEntity.ok(convertToDTO(usedVoucher));
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error using voucher: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<VoucherStatisticsDTO> getVoucherStatistics() {
        log.info("Fetching voucher statistics");

        VoucherStatisticsDTO statistics = new VoucherStatisticsDTO();
        statistics.setTotalVouchers(voucherService.getTotalVoucherCount());
        statistics.setActiveVouchers(voucherService.getActiveVoucherCount());
        statistics.setExpiredVouchers(voucherService.getExpiredVoucherCount());
        statistics.setTotalUsage(voucherService.getTotalUsageCount());
        statistics.setAverageUsageRate(voucherService.getAverageUsageRate());

        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/check-code")
    public ResponseEntity<Boolean> checkCodeUniqueness(@RequestParam String code) {
        log.info("Checking code uniqueness: {}", code);

        boolean isUnique = voucherService.isVoucherCodeUnique(code);
        return ResponseEntity.ok(isUnique);
    }

    @PostMapping("/update-expired")
    public ResponseEntity<Void> updateExpiredVouchers() {
        log.info("Manually updating expired vouchers");

        voucherService.updateExpiredVouchers();
        return ResponseEntity.ok().build();
    }

    /**
     * Tự động kiểm tra và tặng voucher cho một khách hàng cụ thể
     */
    @PostMapping("/auto-gift/{userId}")
    public ResponseEntity<Map<String, Object>> autoGiftVouchersForUser(@PathVariable Integer userId) {
        try {
            log.info("Tự động tặng voucher cho UserId: {}", userId);
            
            int giftedCount = voucherService.autoGiftVouchersForUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("giftedCount", giftedCount);
            response.put("message", "Đã tặng " + giftedCount + " voucher cho khách hàng");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi tự động tặng voucher cho UserId {}: {}", userId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Tự động kiểm tra và tặng voucher cho tất cả khách hàng
     */
    @PostMapping("/auto-gift-all")
    public ResponseEntity<Map<String, Object>> autoGiftVouchersForAllUsers() {
        try {
            log.info("Tự động tặng voucher cho tất cả khách hàng");
            
            int processedCount = voucherService.autoGiftVouchersForAllUsers();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("processedCount", processedCount);
            response.put("message", "Đã kiểm tra " + processedCount + " khách hàng để tặng voucher");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi tự động tặng voucher cho tất cả khách hàng: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy số lượt đặt sân của khách hàng
     */
    @GetMapping("/booking-count/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBookingCount(@PathVariable Integer userId) {
        try {
            log.info("Lấy số lượt đặt sân cho UserId: {}", userId);
            
            int bookingCount = voucherService.getUserBookingCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("bookingCount", bookingCount);
            response.put("message", "Khách hàng có " + bookingCount + " lượt đặt sân");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi lấy số lượt đặt sân cho UserId {}: {}", userId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Kiểm tra tình trạng voucher của khách hàng
     */
    @GetMapping("/eligibility/{userId}")
    public ResponseEntity<Map<String, Object>> getVoucherEligibility(@PathVariable Integer userId) {
        try {
            log.info("Kiểm tra tình trạng voucher cho UserId: {}", userId);
            
            Map<String, Object> eligibility = voucherService.getVoucherEligibility(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("eligibility", eligibility);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra tình trạng voucher cho UserId {}: {}", userId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy danh sách voucher đã được tặng cho khách hàng
     */
    @GetMapping("/personal/{userId}")
    public ResponseEntity<Map<String, Object>> getPersonalVouchers(@PathVariable Integer userId) {
        try {
            log.info("Lấy danh sách voucher cá nhân cho UserId: {}", userId);
            
            Map<String, Object> personalVouchers = voucherService.getPersonalVouchers(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("vouchers", personalVouchers);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi lấy voucher cá nhân cho UserId {}: {}", userId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Tặng voucher cá nhân thủ công cho khách hàng
     */
    @PostMapping("/gift-manual")
    public ResponseEntity<Map<String, Object>> giftVoucherManually(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Integer voucherId = (Integer) request.get("voucherId");
            String notes = (String) request.get("notes");
            
            log.info("Tặng voucher thủ công - UserId: {}, VoucherId: {}", userId, voucherId);
            
            boolean success = voucherService.giftVoucherManually(userId, voucherId, notes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("userId", userId);
            response.put("voucherId", voucherId);
            response.put("message", success ? "Đã tặng voucher thành công" : "Không thể tặng voucher");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi tặng voucher thủ công: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private VoucherDTO convertToDTO(Discount voucher) {
        VoucherDTO dto = new VoucherDTO();
        dto.setId(voucher.getId());
        dto.setCode(voucher.getCode());
        dto.setName(voucher.getName());
        dto.setType(voucher.getType().name().toLowerCase());
        dto.setValue(voucher.getValue());
        dto.setMinOrder(voucher.getMinOrderAmount());
        dto.setMaxDiscount(voucher.getMaxDiscountAmount());
        dto.setUsageLimit(voucher.getUsageLimit());
        dto.setUsedCount(voucher.getUsedCount());
        dto.setValidFrom(voucher.getValidFrom());
        dto.setValidTo(voucher.getValidTo());
        dto.setStatus(voucher.getStatus().name().toLowerCase());
        dto.setDescription(voucher.getDescription());
        dto.setCreatedAt(voucher.getCreatedAt());
        dto.setUpdatedAt(voucher.getUpdatedAt());
        
        // Thêm các trường mới
        if (voucher.getVoucherType() != null) {
            dto.setVoucherType(voucher.getVoucherType().name());
        } else {
            dto.setVoucherType("PUBLIC");
        }
        dto.setRequiredBookingCount(voucher.getRequiredBookingCount());
        dto.setCreatedBy(voucher.getCreatedBy());

        // Calculate computed fields
        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() > 0) {
            dto.setUsagePercentage((double) voucher.getUsedCount() / voucher.getUsageLimit() * 100);
        } else {
            dto.setUsagePercentage(0.0);
        }

        LocalDate today = LocalDate.now();
        dto.setIsExpired(voucher.getValidTo() != null && voucher.getValidTo().isBefore(today));
        dto.setIsAvailable(voucher.getStatus() == Discount.DiscountStatus.ACTIVE &&
                (voucher.getValidFrom().isBefore(today) || voucher.getValidFrom().equals(today)) &&
                (voucher.getValidTo() == null || voucher.getValidTo().isAfter(today) || voucher.getValidTo().equals(today)) &&
                (voucher.getUsageLimit() == null || voucher.getUsedCount() < voucher.getUsageLimit()));

        return dto;
    }

    private Discount convertFromRequest(CreateVoucherRequest request) {
        Discount voucher = new Discount();
        voucher.setCode(request.getCode().toUpperCase().trim());
        voucher.setName(request.getName().trim());
        voucher.setType(Discount.DiscountType.valueOf(request.getType().toUpperCase()));
        voucher.setValue(request.getValue());
        voucher.setMinOrderAmount(request.getMinOrder());
        voucher.setMaxDiscountAmount(request.getMaxDiscount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setValidFrom(request.getValidFrom());
        voucher.setValidTo(request.getValidTo());
        voucher.setDescription(request.getDescription());
        voucher.setStatus(Discount.DiscountStatus.ACTIVE);
        
        // Xử lý các trường mới
        if (request.getVoucherType() != null) {
            voucher.setVoucherType(Discount.VoucherType.valueOf(request.getVoucherType().toUpperCase()));
        } else {
            voucher.setVoucherType(Discount.VoucherType.PUBLIC);
        }
        
        voucher.setRequiredBookingCount(request.getRequiredBookingCount());

        return voucher;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            return userService.getUserByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    // Statistics DTO
    public static class VoucherStatisticsDTO {
        private long totalVouchers;
        private long activeVouchers;
        private long expiredVouchers;
        private long totalUsage;
        private double averageUsageRate;

        // Getters and Setters
        public long getTotalVouchers() { return totalVouchers; }
        public void setTotalVouchers(long totalVouchers) { this.totalVouchers = totalVouchers; }
        public long getActiveVouchers() { return activeVouchers; }
        public void setActiveVouchers(long activeVouchers) { this.activeVouchers = activeVouchers; }
        public long getExpiredVouchers() { return expiredVouchers; }
        public void setExpiredVouchers(long expiredVouchers) { this.expiredVouchers = expiredVouchers; }
        public long getTotalUsage() { return totalUsage; }
        public void setTotalUsage(long totalUsage) { this.totalUsage = totalUsage; }
        public double getAverageUsageRate() { return averageUsageRate; }
        public void setAverageUsageRate(double averageUsageRate) { this.averageUsageRate = averageUsageRate; }
    }
}