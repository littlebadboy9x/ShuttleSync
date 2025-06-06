package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {
    
    private Integer bookingId;
    private BigDecimal discountAmount;
    private String notes;
    private String status;
} 