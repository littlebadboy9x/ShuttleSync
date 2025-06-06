package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVoucherRequest {
    
    private String code;
    private String name;
    private String type; // "percentage" or "fixed"
    private BigDecimal value;
    private BigDecimal minOrder;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String description;
} 