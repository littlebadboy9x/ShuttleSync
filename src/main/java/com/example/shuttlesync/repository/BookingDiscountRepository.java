package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.BookingDiscount;
import com.example.shuttlesync.model.BookingDiscountId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingDiscountRepository extends JpaRepository<BookingDiscount, BookingDiscountId> {
    
    List<BookingDiscount> findByBooking(Booking booking);
} 