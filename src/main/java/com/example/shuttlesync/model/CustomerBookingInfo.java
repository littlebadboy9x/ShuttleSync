package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "CustomerBookingInfo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerBookingInfo {

    @Id
    @Column(name = "BookingId")
    private Integer bookingId;

    @OneToOne
    @JoinColumn(name = "BookingId", insertable = false, updatable = false)
    private Booking booking;

    @Column(name = "UserFullName")
    private String userFullName;

    @Column(name = "UserEmail")
    private String userEmail;

    @Column(name = "CourtName")
    private String courtName;

    @Column(name = "BookingDate")
    private LocalDate bookingDate;

    @Column(name = "SlotStartTime")
    private LocalTime slotStartTime;

    @Column(name = "SlotEndTime")
    private LocalTime slotEndTime;

    @Column(name = "OriginalPrice")
    private BigDecimal originalPrice;

    @Column(name = "BookingStatus")
    private String bookingStatus;

    @Column(name = "PaymentAmount")
    private BigDecimal paymentAmount;

    @Column(name = "PaymentMethod")
    private String paymentMethod;

    @Column(name = "PaymentStatus")
    private String paymentStatus;
} 