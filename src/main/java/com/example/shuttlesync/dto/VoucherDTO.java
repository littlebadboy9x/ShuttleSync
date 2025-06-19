package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDTO {
    
    private Integer id;
    private String code;
    private String name;
    private String type; // "percentage" or "fixed"
    private BigDecimal value;
    private BigDecimal minOrder;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String status; // "active", "inactive", "expired"
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // New voucher system fields
    private String voucherType; // "PUBLIC" or "PERSONAL"
    private Integer requiredBookingCount;
    private Integer createdBy;
    
    // Additional computed fields for UI
    private Double usagePercentage;
    private Boolean isExpired;
    private Boolean isAvailable;
} 