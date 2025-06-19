package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.Discount;
import com.example.shuttlesync.model.SystemChangeLog;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.DiscountRepository;
import com.example.shuttlesync.repository.SystemChangeLogRepository;
import com.example.shuttlesync.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final DiscountRepository discountRepository;
    private final SystemChangeLogRepository systemChangeLogRepository;

    @Override
    public List<Discount> getAllVouchers() {
        log.info("Fetching all vouchers");
        return discountRepository.findAll();
    }

    @Override
    public Optional<Discount> getVoucherById(Integer id) {
        log.info("Fetching voucher with id: {}", id);
        return discountRepository.findById(id);
    }

    @Override
    public Optional<Discount> getVoucherByCode(String code) {
        log.info("Fetching voucher with code: {}", code);
        return discountRepository.findByCode(code);
    }

    @Override
    public Discount createVoucher(Discount voucher) {
        log.info("Creating new voucher with code: {}", voucher.getCode());
        
        // Validate code uniqueness
        if (discountRepository.existsByCode(voucher.getCode())) {
            throw new IllegalArgumentException("Voucher code already exists: " + voucher.getCode());
        }
        
        // Set default values
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(0);
        }
        
        if (voucher.getStatus() == null) {
            voucher.setStatus(Discount.DiscountStatus.ACTIVE);
        }
        
        // Validate voucher data
        validateVoucherData(voucher);
        
        Discount savedVoucher = discountRepository.save(voucher);
        log.info("Created voucher with id: {} and code: {}", savedVoucher.getId(), savedVoucher.getCode());
        
        return savedVoucher;
    }

    @Override
    public Discount updateVoucher(Discount voucher) {
        log.info("Updating voucher with id: {}", voucher.getId());
        
        Discount existingVoucher = discountRepository.findById(voucher.getId())
            .orElseThrow(() -> new IllegalArgumentException("Voucher not found with id: " + voucher.getId()));
        
        // Check code uniqueness if code is changed
        if (!existingVoucher.getCode().equals(voucher.getCode()) && 
            discountRepository.existsByCode(voucher.getCode())) {
            throw new IllegalArgumentException("Voucher code already exists: " + voucher.getCode());
        }
        
        // Validate voucher data
        validateVoucherData(voucher);
        
        // Preserve usage count and creation date
        voucher.setUsedCount(existingVoucher.getUsedCount());
        voucher.setCreatedAt(existingVoucher.getCreatedAt());
        
        Discount updatedVoucher = discountRepository.save(voucher);
        log.info("Updated voucher with id: {}", updatedVoucher.getId());
        
        return updatedVoucher;
    }

    @Override
    public void deleteVoucher(Integer id) {
        log.info("Deleting voucher with id: {}", id);
        
        if (!discountRepository.existsById(id)) {
            throw new IllegalArgumentException("Voucher not found with id: " + id);
        }
        
        discountRepository.deleteById(id);
        log.info("Deleted voucher with id: {}", id);
    }

    @Override
    public Discount updateVoucherStatus(Integer id, String status, User updatedBy) {
        log.info("Updating voucher {} status to: {}", id, status);
        
        Discount voucher = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Voucher not found with id: " + id));
        
        Discount.DiscountStatus oldStatus = voucher.getStatus();
        Discount.DiscountStatus newStatus = Discount.DiscountStatus.valueOf(status.toUpperCase());
        
        voucher.setStatus(newStatus);
        Discount updatedVoucher = discountRepository.save(voucher);
        
        // Log the change
        if (updatedBy != null) {
            SystemChangeLog changeLog = new SystemChangeLog();
            changeLog.setTableName("Discounts");
            changeLog.setRecordId(id);
            changeLog.setChangeType("UPDATE");
            changeLog.setChangedFields("{\"Status\":\"" + oldStatus + " -> " + newStatus + "\"}");
            changeLog.setChangedBy(updatedBy);
            systemChangeLogRepository.save(changeLog);
        }
        
        log.info("Updated voucher {} status from {} to {}", id, oldStatus, newStatus);
        return updatedVoucher;
    }

    @Override
    public Discount toggleVoucherStatus(Integer id, User updatedBy) {
        log.info("Toggling voucher {} status", id);
        
        Discount voucher = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Voucher not found with id: " + id));
        
        String newStatus = voucher.getStatus() == Discount.DiscountStatus.ACTIVE ? "INACTIVE" : "ACTIVE";
        return updateVoucherStatus(id, newStatus, updatedBy);
    }

    @Override
    public List<Discount> getVouchersByStatus(String status) {
        log.info("Fetching vouchers with status: {}", status);
        Discount.DiscountStatus discountStatus = Discount.DiscountStatus.valueOf(status.toUpperCase());
        return discountRepository.findByStatus(discountStatus);
    }

    @Override
    public List<Discount> getVouchersByType(String type) {
        log.info("Fetching vouchers with type: {}", type);
        Discount.DiscountType discountType = Discount.DiscountType.valueOf(type.toUpperCase());
        return discountRepository.findByType(discountType);
    }

    @Override
    public List<Discount> searchVouchers(String searchTerm) {
        log.info("Searching vouchers with term: {}", searchTerm);
        return discountRepository.findBySearchTerm(searchTerm);
    }

    @Override
    public List<Discount> getVouchersByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching vouchers between {} and {}", startDate, endDate);
        return discountRepository.findByDateRange(startDate, endDate);
    }

    @Override
    public List<Discount> getActiveVouchers() {
        log.info("Fetching active vouchers");
        return discountRepository.findActiveVouchers(LocalDate.now());
    }

    @Override
    public List<Discount> getExpiredVouchers() {
        log.info("Fetching expired vouchers");
        return discountRepository.findExpiredVouchers(LocalDate.now());
    }

    @Override
    public List<Discount> getAvailableVouchersForAmount(BigDecimal amount) {
        log.info("Fetching available vouchers for amount: {}", amount);
        return discountRepository.findAvailableVouchersForAmount(LocalDate.now(), amount);
    }

    @Override
    public BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount) {
        log.info("Calculating discount for voucher: {} with amount: {}", voucherCode, orderAmount);
        
        Optional<Discount> voucherOpt = discountRepository.findByCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            throw new IllegalArgumentException("Voucher not found: " + voucherCode);
        }
        
        Discount voucher = voucherOpt.get();
        
        if (!canUseVoucher(voucherCode, orderAmount)) {
            throw new IllegalStateException("Voucher cannot be used for this order");
        }
        
        BigDecimal discount = BigDecimal.ZERO;
        
        if (voucher.getType() == Discount.DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(voucher.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            // Apply max discount limit if set
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else if (voucher.getType() == Discount.DiscountType.FIXED) {
            discount = voucher.getValue();
        }
        
        // Discount cannot exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }
        
        log.info("Calculated discount: {} for voucher: {}", discount, voucherCode);
        return discount;
    }

    @Override
    public boolean canUseVoucher(String voucherCode, BigDecimal orderAmount) {
        Optional<Discount> voucherOpt = discountRepository.findByCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            return false;
        }
        
        Discount voucher = voucherOpt.get();
        LocalDate today = LocalDate.now();
        
        // Check status
        if (voucher.getStatus() != Discount.DiscountStatus.ACTIVE) {
            log.debug("Voucher {} is not active", voucherCode);
            return false;
        }
        
        // Check date validity
        if (voucher.getValidFrom().isAfter(today)) {
            log.debug("Voucher {} is not yet valid", voucherCode);
            return false;
        }
        
        if (voucher.getValidTo() != null && voucher.getValidTo().isBefore(today)) {
            log.debug("Voucher {} has expired", voucherCode);
            return false;
        }
        
        // Check minimum order amount
        if (voucher.getMinOrderAmount() != null && orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            log.debug("Order amount {} is below minimum {} for voucher {}", orderAmount, voucher.getMinOrderAmount(), voucherCode);
            return false;
        }
        
        // Check usage limit
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            log.debug("Voucher {} has reached usage limit", voucherCode);
            return false;
        }
        
        return true;
    }

    @Override
    public Discount useVoucher(String voucherCode, BigDecimal orderAmount, User usedBy) {
        log.info("Using voucher: {} for amount: {} by user: {}", voucherCode, orderAmount, usedBy != null ? usedBy.getId() : "unknown");
        
        if (!canUseVoucher(voucherCode, orderAmount)) {
            throw new IllegalStateException("Voucher cannot be used for this order");
        }
        
        Discount voucher = discountRepository.findByCode(voucherCode)
            .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + voucherCode));
        
        // Increment usage count
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        
        Discount updatedVoucher = discountRepository.save(voucher);
        
        // Log the usage
        if (usedBy != null) {
            SystemChangeLog changeLog = new SystemChangeLog();
            changeLog.setTableName("Discounts");
            changeLog.setRecordId(voucher.getId());
            changeLog.setChangeType("USE");
            changeLog.setChangedFields("{\"UsedCount\":\"" + (voucher.getUsedCount() - 1) + " -> " + voucher.getUsedCount() + "\"}");
            changeLog.setChangedBy(usedBy);
            systemChangeLogRepository.save(changeLog);
        }
        
        log.info("Used voucher: {}, new usage count: {}", voucherCode, updatedVoucher.getUsedCount());
        return updatedVoucher;
    }

    @Override
    public long getTotalVoucherCount() {
        return discountRepository.count();
    }

    @Override
    public long getActiveVoucherCount() {
        return discountRepository.countByStatus(Discount.DiscountStatus.ACTIVE);
    }

    @Override
    public long getExpiredVoucherCount() {
        return discountRepository.countByStatus(Discount.DiscountStatus.EXPIRED);
    }

    @Override
    public long getTotalUsageCount() {
        Long count = discountRepository.getTotalUsageCount();
        return count != null ? count : 0L;
    }

    @Override
    public double getAverageUsageRate() {
        Double rate = discountRepository.getAverageUsageRate();
        return rate != null ? rate : 0.0;
    }

    @Override
    public void updateExpiredVouchers() {
        log.info("Updating expired vouchers");
        
        List<Discount> expiredVouchers = discountRepository.findExpiredVouchers(LocalDate.now());
        
        for (Discount voucher : expiredVouchers) {
            voucher.setStatus(Discount.DiscountStatus.EXPIRED);
            discountRepository.save(voucher);
            log.debug("Marked voucher {} as expired", voucher.getCode());
        }
        
        log.info("Updated {} expired vouchers", expiredVouchers.size());
    }

    @Override
    public boolean isVoucherCodeUnique(String code) {
        return !discountRepository.existsByCode(code);
    }
    
    // Auto voucher system implementations
    @Override
    public int autoGiftVouchersForUser(Integer userId) {
        log.info("Auto gifting vouchers for user: {}", userId);
        // Mock implementation - in real scenario, call stored procedure
        return 0;
    }
    
    @Override
    public int autoGiftVouchersForAllUsers() {
        log.info("Auto gifting vouchers for all users");
        // Mock implementation - in real scenario, call stored procedure
        return 0;
    }
    
    @Override
    public int getUserBookingCount(Integer userId) {
        log.info("Getting booking count for user: {}", userId);
        // Mock implementation - in real scenario, call database function
        return 0;
    }
    
    @Override
    public Map<String, Object> getVoucherEligibility(Integer userId) {
        log.info("Getting voucher eligibility for user: {}", userId);
        // Mock implementation
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("bookingCount", 0);
        result.put("eligibleVouchers", new ArrayList<>());
        return result;
    }
    
    @Override
    public Map<String, Object> getPersonalVouchers(Integer userId) {
        log.info("Getting personal vouchers for user: {}", userId);
        // Mock implementation
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("personalVouchers", new ArrayList<>());
        return result;
    }
    
    @Override
    public boolean giftVoucherManually(Integer userId, Integer voucherId, String notes) {
        log.info("Manually gifting voucher {} to user {}", voucherId, userId);
        // Mock implementation - in real scenario, insert into PersonalVouchers table
        return true;
    }

    private void validateVoucherData(Discount voucher) {
        if (voucher.getCode() == null || voucher.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Voucher code is required");
        }
        
        if (voucher.getName() == null || voucher.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Voucher name is required");
        }
        
        if (voucher.getType() == null) {
            throw new IllegalArgumentException("Voucher type is required");
        }
        
        if (voucher.getValue() == null || voucher.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Voucher value must be greater than 0");
        }
        
        if (voucher.getType() == Discount.DiscountType.PERCENTAGE && voucher.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
        }
        
        if (voucher.getValidFrom() == null) {
            throw new IllegalArgumentException("Valid from date is required");
        }
        
        if (voucher.getValidTo() != null && voucher.getValidTo().isBefore(voucher.getValidFrom())) {
            throw new IllegalArgumentException("Valid to date must be after valid from date");
        }
        
        if (voucher.getMinOrderAmount() != null && voucher.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum order amount cannot be negative");
        }
        
        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() < 0) {
            throw new IllegalArgumentException("Usage limit cannot be negative");
        }
    }
} 