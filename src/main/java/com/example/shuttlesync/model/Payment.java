package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "BookingId", nullable = false)
    private Booking booking;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;

    @ManyToOne
    @JoinColumn(name = "PaymentStatus", nullable = false)
    private PaymentStatusType status;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "PaidAt")
    private LocalDateTime paidAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}