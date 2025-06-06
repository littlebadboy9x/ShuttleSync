package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, Integer> {

    List<BookingService> findByBookingId(Integer bookingId);
    
    void deleteByBookingIdAndId(Integer bookingId, Integer id);
    
    @Query("SELECT SUM(bs.totalPrice) FROM BookingService bs WHERE bs.booking.id = :bookingId")
    BigDecimal calculateTotalByBookingId(@Param("bookingId") Integer bookingId);
    
    @Query("SELECT COUNT(bs) FROM BookingService bs WHERE bs.booking.id = :bookingId")
    Long countByBookingId(@Param("bookingId") Integer bookingId);
} 