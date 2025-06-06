package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

public interface PaymentService {
    
    List<Payment> getAllPayments();
    
    Optional<Payment> getPaymentById(Integer id);
    
    List<Payment> getPaymentsByBookingId(Integer bookingId);
    
    List<Payment> getPaymentsByStatus(Byte statusId);
    
    Payment createPayment(Integer bookingId, BigDecimal amount, String paymentMethod);
    
    Payment createPayment(Integer bookingId, Integer invoiceId, BigDecimal amount, String paymentMethod);
    
    Payment updatePaymentStatus(Integer paymentId, Byte newStatusId, User changedBy);
    
    Payment addDiscountToPayment(Integer paymentId, Integer discountId);
    
    Payment removeDiscountFromPayment(Integer paymentId, Integer discountId);
    
    List<Payment> getPaymentsByInvoiceId(Integer invoiceId);
    
    BigDecimal calculateTotalAmount(Integer paymentId);
    
    @Transactional
    void processPayment(Integer paymentId, String paymentMethod);

    BigDecimal getTotalPaidAmount();
}
