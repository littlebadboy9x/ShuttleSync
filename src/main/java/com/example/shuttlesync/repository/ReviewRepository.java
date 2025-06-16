package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Review;
import com.example.shuttlesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByUser(User user);
    
    List<Review> findByBooking(Booking booking);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.booking.court.id = :courtId")
    Double getAverageRatingByCourt(@Param("courtId") Integer courtId);
    
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews();
    
    @Query("SELECT r FROM Review r WHERE r.booking.id = :bookingId AND r.user.id = :userId")
    Optional<Review> findByBookingIdAndUserId(@Param("bookingId") Integer bookingId, @Param("userId") Integer userId);
} 