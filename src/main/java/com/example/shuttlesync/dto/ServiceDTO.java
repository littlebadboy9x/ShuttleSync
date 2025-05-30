package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {
    private Integer id;
    private Integer serviceTypeId;
    private String serviceName;
    private String description;
    private BigDecimal unitPrice;
    private Boolean isActive;
}

