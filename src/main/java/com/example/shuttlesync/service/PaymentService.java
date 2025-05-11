package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.PaymentDto;
import com.example.shuttlesync.model.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    List<Payment> getAllPayments();

    Payment getPaymentById(Integer id);

    Payment getPaymentByBookingId(Integer bookingId);

    List<Payment> getPaymentsByUser(Integer userId);

    List<Payment> getPaymentsByStatus(String status);

    Payment createPayment(PaymentDto paymentDto);

    Payment updatePaymentStatus(Integer id, String status);

    BigDecimal getTotalPaidAmount();

    BigDecimal getTotalPaidAmountBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
}
