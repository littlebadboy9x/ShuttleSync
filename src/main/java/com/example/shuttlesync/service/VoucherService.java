package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Discount;
import com.example.shuttlesync.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VoucherService {
    
    // Basic CRUD operations
    List<Discount> getAllVouchers();
    Optional<Discount> getVoucherById(Integer id);
    Optional<Discount> getVoucherByCode(String code);
    Discount createVoucher(Discount voucher);
    Discount updateVoucher(Discount voucher);
    void deleteVoucher(Integer id);
    
    // Status management
    Discount updateVoucherStatus(Integer id, String status, User updatedBy);
    Discount toggleVoucherStatus(Integer id, User updatedBy);
    
    // Filtering and searching
    List<Discount> getVouchersByStatus(String status);
    List<Discount> getVouchersByType(String type);
    List<Discount> searchVouchers(String searchTerm);
    List<Discount> getVouchersByDateRange(LocalDate startDate, LocalDate endDate);
    
    // Business logic
    List<Discount> getActiveVouchers();
    List<Discount> getExpiredVouchers();
    List<Discount> getAvailableVouchersForAmount(BigDecimal amount);
    
    // Voucher application
    BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount);
    boolean canUseVoucher(String voucherCode, BigDecimal orderAmount);
    Discount useVoucher(String voucherCode, BigDecimal orderAmount, User usedBy);
    
    // Statistics
    long getTotalVoucherCount();
    long getActiveVoucherCount();
    long getExpiredVoucherCount();
    long getTotalUsageCount();
    double getAverageUsageRate();
    
    // Maintenance
    void updateExpiredVouchers();
    boolean isVoucherCodeUnique(String code);
    
    // Auto voucher system
    int autoGiftVouchersForUser(Integer userId);
    int autoGiftVouchersForAllUsers();
    int getUserBookingCount(Integer userId);
    Map<String, Object> getVoucherEligibility(Integer userId);
    Map<String, Object> getPersonalVouchers(Integer userId);
    boolean giftVoucherManually(Integer userId, Integer voucherId, String notes);
} 