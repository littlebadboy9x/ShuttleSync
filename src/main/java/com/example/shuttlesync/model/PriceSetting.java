package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PriceSettings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "CourtId")
    private Court court;

    @Column(name = "TimeSlotIndex")
    private Integer timeSlotIndex;

    @Column(name = "DayType", length = 20)
    private String dayType;  // 'weekday', 'weekend', 'holiday'

    @Column(name = "Price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "EffectiveFrom")
    private LocalDate effectiveFrom;

    @Column(name = "EffectiveTo")
    private LocalDate effectiveTo;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "UpdatedBy")
    private User updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 