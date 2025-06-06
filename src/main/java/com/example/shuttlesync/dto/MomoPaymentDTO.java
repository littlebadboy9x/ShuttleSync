package com.example.shuttlesync.dto;

import com.example.shuttlesync.model.MomoPayment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoPaymentDTO {
    private Integer id;
    private Integer paymentId;
    private Integer bookingId;
    private String requestId;
    private String orderId;
    private BigDecimal amount;
    private String payUrl;
    private String qrCodeUrl;
    private String deeplink;
    private String resultCode;
    private String message;
    private String transactionId;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public MomoPaymentDTO(MomoPayment momoPayment) {
        this.id = momoPayment.getId();
        this.paymentId = momoPayment.getPayment().getId();
        this.bookingId = momoPayment.getBooking().getId();
        this.requestId = momoPayment.getRequestId();
        this.orderId = momoPayment.getOrderId();
        this.amount = momoPayment.getAmount();
        this.payUrl = momoPayment.getPayUrl();
        this.qrCodeUrl = momoPayment.getQrCodeUrl();
        this.deeplink = momoPayment.getDeeplink();
        this.resultCode = momoPayment.getResultCode();
        this.message = momoPayment.getMessage();
        this.transactionId = momoPayment.getTransactionId();
        this.paymentStatus = momoPayment.getPaymentStatus();
        this.createdAt = momoPayment.getCreatedAt();
        this.updatedAt = momoPayment.getUpdatedAt();
    }
} 