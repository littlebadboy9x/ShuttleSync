package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.MomoPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MomoPaymentRepository extends JpaRepository<MomoPayment, Integer> {
    
    List<MomoPayment> findByBookingId(Integer bookingId);
    
    List<MomoPayment> findByPaymentId(Integer paymentId);
    
    Optional<MomoPayment> findByRequestId(String requestId);
    
    Optional<MomoPayment> findByOrderId(String orderId);
    
    List<MomoPayment> findByPaymentStatus(String paymentStatus);
} 