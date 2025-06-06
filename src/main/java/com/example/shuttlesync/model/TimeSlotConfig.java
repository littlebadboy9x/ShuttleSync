package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "TimeSlotConfigs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "SlotDurationMinutes", nullable = false)
    private Integer slotDurationMinutes;

    @Column(name = "StartTimeFirstSlot", nullable = false)
    private LocalTime startTimeFirstSlot;

    @Column(name = "EndTimeLastSlot", nullable = false)
    private LocalTime endTimeLastSlot;

    @Column(name = "MaxSlotsPerDay", nullable = false)
    private Integer maxSlotsPerDay;

    @Column(name = "IsActive")
    private Boolean isActive = true;

    @Column(name = "EffectiveFrom", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "EffectiveTo")
    private LocalDate effectiveTo;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UpdatedBy")
    private User updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 