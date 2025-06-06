package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailDTO {
    
    private Integer id;
    private String itemName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String courtName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private String notes;
} 