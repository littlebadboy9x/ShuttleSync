package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "Name", nullable = false, length = 100)
    private String name;

    @Column(name = "Description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "Type", nullable = false)
    private DiscountType type;

    @Column(name = "Value", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "MinOrderAmount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "MaxDiscountAmount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "UsageLimit")
    private Integer usageLimit;

    @Column(name = "UsedCount", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "ValidFrom", nullable = false)
    private LocalDate validFrom;

    @Column(name = "ValidTo")
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private DiscountStatus status = DiscountStatus.ACTIVE;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DiscountType {
        PERCENTAGE, FIXED
    }

    public enum DiscountStatus {
        ACTIVE, INACTIVE, EXPIRED
    }
} 