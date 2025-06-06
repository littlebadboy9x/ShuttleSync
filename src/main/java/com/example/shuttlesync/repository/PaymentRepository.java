package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.PaymentStatusType;
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

    List<Payment> findByPaymentStatus(PaymentStatusType paymentStatus);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus.id = 2")
    BigDecimal getTotalPaidAmount();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus.id = 2 AND p.paidAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaidAmountBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Payment> findByBookingId(Integer bookingId);

    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentStatus.id = 2")
    Optional<Payment> findPaidPaymentByBookingId(@Param("bookingId") Integer bookingId);

    @Query("SELECT p FROM Payment p WHERE p.paymentStatus.id = 1 AND p.createdAt < :expiryTime")
    List<Payment> findExpiredPayments(@Param("expiryTime") LocalDateTime expiryTime);

    List<Payment> findByInvoiceId(Integer invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentStatus.id = :statusId")
    List<Payment> findByBookingIdAndStatusId(@Param("bookingId") Integer bookingId, @Param("statusId") Byte statusId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentStatus.id = 2")
    BigDecimal getTotalPaidAmountByBookingId(@Param("bookingId") Integer bookingId);
}