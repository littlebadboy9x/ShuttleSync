package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Review;
import com.example.shuttlesync.model.User;

import java.util.List;
import java.util.Optional;

public interface ReviewService {
    
    List<Review> getAllReviews();
    
    Optional<Review> getReviewById(Integer id);
    
    List<Review> getReviewsByUser(User user);
    
    List<Review> getReviewsByBooking(Booking booking);
    
    Double getAverageRatingByCourt(Integer courtId);
    
    List<Review> getRecentReviews();
    
    Review createReview(Review review);
    
    Review updateReview(Review review);
    
    void deleteReview(Integer id);
} 