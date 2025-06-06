package com.example.shuttlesync.dto;

import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.PaymentStatusType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Integer id;
    private Integer bookingId;
    private Integer invoiceId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatusType paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    
    // Constructor để chuyển đổi từ Payment entity
    public PaymentDto(Payment payment) {
        this.id = payment.getId();
        this.bookingId = payment.getBooking().getId();
        this.invoiceId = payment.getInvoice() != null ? payment.getInvoice().getId() : null;
        this.amount = payment.getAmount();
        this.paymentMethod = payment.getPaymentMethod();
        this.paymentStatus = payment.getPaymentStatus();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
    }
} 