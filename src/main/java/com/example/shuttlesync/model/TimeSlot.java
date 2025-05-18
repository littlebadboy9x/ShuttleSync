package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "TimeSlots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "CourtId", nullable = false)
    private Court court;

    @Column(name = "SlotIndex", nullable = false)
    private Integer slotIndex;

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;
    
    @ManyToOne
    @JoinColumn(name = "Status", nullable = false)
    private StatusType status;
    
    @Column(name = "Price")
    private BigDecimal price;
    
    @Column(name = "EffectiveDate")
    private LocalDate effectiveDate;
}