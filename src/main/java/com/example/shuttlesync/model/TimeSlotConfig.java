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

    @Column(name = "SlotDurationMinutes")
    private Integer slotDurationMinutes;

    @Column(name = "StartTimeFirstSlot")
    private LocalTime startTimeFirstSlot;

    @Column(name = "EndTimeLastSlot")
    private LocalTime endTimeLastSlot;

    @Column(name = "MaxSlotsPerDay")
    private Integer maxSlotsPerDay;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 