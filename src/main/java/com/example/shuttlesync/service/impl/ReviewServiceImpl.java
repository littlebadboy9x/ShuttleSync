package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Review;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.ReviewRepository;
import com.example.shuttlesync.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public Optional<Review> getReviewById(Integer id) {
        return reviewRepository.findById(id);
    }

    @Override
    public List<Review> getReviewsByUser(User user) {
        return reviewRepository.findByUser(user);
    }

    @Override
    public List<Review> getReviewsByBooking(Booking booking) {
        return reviewRepository.findByBooking(booking);
    }

    @Override
    public Double getAverageRatingByCourt(Integer courtId) {
        return reviewRepository.getAverageRatingByCourt(courtId);
    }

    @Override
    public List<Review> getRecentReviews() {
        return reviewRepository.findRecentReviews();
    }

    @Override
    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    @Override
    public Review updateReview(Review review) {
        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Integer id) {
        reviewRepository.deleteById(id);
    }
} 