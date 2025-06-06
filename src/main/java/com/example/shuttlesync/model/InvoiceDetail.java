package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "InvoiceDetails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "InvoiceId", nullable = false)
    @ToString.Exclude
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "TimeSlotId")
    @ToString.Exclude
    private TimeSlot timeSlot;

    @ManyToOne
    @JoinColumn(name = "ServiceId")
    @ToString.Exclude
    private Service service;

    @Column(name = "ItemName", nullable = false, length = 100)
    private String itemName;

    @Column(name = "BookingDate")
    private LocalDate bookingDate;

    @Column(name = "StartTime")
    private LocalTime startTime;

    @Column(name = "EndTime")
    private LocalTime endTime;

    @Column(name = "CourtName", length = 50)
    private String courtName;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "UnitPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "Amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "Notes", length = 255)
    private String notes;
} 