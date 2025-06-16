package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.CustomerBookingInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CustomerBookingInfoRepository extends JpaRepository<CustomerBookingInfo, Integer> {
    
    @Query("SELECT c FROM CustomerBookingInfo c WHERE c.userEmail = :email")
    List<CustomerBookingInfo> findByUserEmail(@Param("email") String email);
    
    @Query("SELECT c FROM CustomerBookingInfo c WHERE c.bookingDate = :date")
    List<CustomerBookingInfo> findByBookingDate(@Param("date") LocalDate date);
    
    @Query("SELECT c FROM CustomerBookingInfo c WHERE c.bookingStatus = :status")
    List<CustomerBookingInfo> findByBookingStatus(@Param("status") String status);
    
    @Modifying
    @Query("UPDATE CustomerBookingInfo c SET c.paymentAmount = :paymentAmount, c.paymentMethod = :paymentMethod, c.paymentStatus = :paymentStatus WHERE c.bookingId = :bookingId")
    void updatePaymentInfo(@Param("bookingId") Integer bookingId, 
                          @Param("paymentAmount") BigDecimal paymentAmount,
                          @Param("paymentMethod") String paymentMethod,
                          @Param("paymentStatus") String paymentStatus);
} 