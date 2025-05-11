package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByBooking(Booking booking);

    List<Payment> findByBookingUser(User user);

    List<Payment> findByPaymentStatus(String status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'Đã thanh toán'")
    BigDecimal getTotalPaidAmount();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'Đã thanh toán' AND p.paidAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaidAmountBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}