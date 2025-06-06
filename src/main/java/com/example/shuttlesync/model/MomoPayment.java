package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "MomoPayments")
public class MomoPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "PaymentId", nullable = false)
    private Payment payment;

    @ManyToOne
    @JoinColumn(name = "BookingId", nullable = false)
    private Booking booking;

    @Column(name = "RequestId", nullable = false)
    private String requestId;

    @Column(name = "OrderId", nullable = false)
    private String orderId;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "PayUrl")
    private String payUrl;

    @Column(name = "QrCodeUrl")
    private String qrCodeUrl;

    @Column(name = "Deeplink")
    private String deeplink;

    @Column(name = "ResultCode")
    private String resultCode;

    @Column(name = "Message")
    private String message;

    @Column(name = "TransactionId")
    private String transactionId;

    @Column(name = "PaymentStatus", nullable = false)
    private String paymentStatus = "PENDING";

    @Column(name = "CreatedAt")
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
} 