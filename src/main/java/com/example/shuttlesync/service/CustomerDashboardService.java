package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.DashboardStatsDto;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    
    // Constants for status mapping
    private static final byte BOOKING_STATUS_PENDING = 1;      // Chờ xác nhận
    private static final byte BOOKING_STATUS_CONFIRMED = 2;    // Đã xác nhận
    private static final byte BOOKING_STATUS_COMPLETED = 3;    // Đã hoàn thành
    private static final byte BOOKING_STATUS_CANCELLED = 4;    // Đã hủy
    
    private static final byte PAYMENT_STATUS_UNPAID = 1;       // Chưa thanh toán  
    private static final byte PAYMENT_STATUS_PAID = 2;         // Đã thanh toán

    public DashboardStatsDto getDashboardStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> userBookings = bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId());
        System.out.println("Dashboard Stats for user: " + email + ", Total bookings: " + userBookings.size());
        
        // Tính toán stats
        int totalBookings = userBookings.size();
        int completedBookings = (int) userBookings.stream()
                .filter(b -> b.getStatus() != null && b.getStatus().getId() == (byte) 3)
                .count();
        int upcomingBookings = (int) userBookings.stream()
                .filter(b -> b.getStatus() != null && b.getStatus().getId() == (byte) 2 && 
                           b.getBookingDate().isAfter(LocalDate.now()))
                .count();
        int cancelledBookings = (int) userBookings.stream()
                .filter(b -> b.getStatus() != null && b.getStatus().getId() == (byte) 4)
                .count();

        // Tính tổng chi tiêu từ payments (chỉ tính các payment đã thanh toán)
        Double totalSpent = userBookings.stream()
                .flatMap(b -> b.getPayments().stream())
                .filter(p -> p.getPaymentStatus() != null && p.getPaymentStatus().getId() == PAYMENT_STATUS_PAID)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();

        // Tìm sân yêu thích (được đặt nhiều nhất)
        Map<Integer, Long> courtFrequency = userBookings.stream()
                .collect(Collectors.groupingBy(
                    b -> b.getCourt().getId(), 
                    Collectors.counting()
                ));
        
        Integer favoriteCourtId = null;
        String favoriteCourtName = "N/A";
        if (!courtFrequency.isEmpty()) {
            favoriteCourtId = courtFrequency.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            if (favoriteCourtId != null) {
                favoriteCourtName = courtRepository.findById(favoriteCourtId)
                        .map(Court::getName)
                        .orElse("N/A");
            }
        }

        // Tính membership level dựa trên số booking
        String membershipLevel = calculateMembershipLevel(totalBookings);
        
        // Tính loyalty points (1 point per 100k VND)
        Integer loyaltyPoints = (int) (totalSpent / 100000);

        return DashboardStatsDto.builder()
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .upcomingBookings(upcomingBookings)
                .cancelledBookings(cancelledBookings)
                .totalSpent(totalSpent)
                .totalSaved(0.0)
                .favoriteCourtId(favoriteCourtId)
                .favoriteCourtName(favoriteCourtName)
                .loyaltyPoints(loyaltyPoints)
                .membershipLevel(membershipLevel)
                .build();
    }

    public List<Map<String, Object>> getRecentBookings(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> recentBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(limit)
                .collect(Collectors.toList());

        return recentBookings.stream().map(booking -> {
            Map<String, Object> bookingMap = new HashMap<>();
            bookingMap.put("bookingId", booking.getId());
            bookingMap.put("courtName", booking.getCourt().getName());
            bookingMap.put("bookingDate", booking.getBookingDate().toString());
            bookingMap.put("startTime", booking.getTimeSlot().getStartTime().toString());
            bookingMap.put("endTime", booking.getTimeSlot().getEndTime().toString());
            
            // Convert BookingStatusType to String
            String status = "Chờ xác nhận";
            if (booking.getStatus() != null) {
                switch (booking.getStatus().getId()) {
                    case 1: status = "Chờ xác nhận"; break;
                    case 2: status = "Đã xác nhận"; break;
                    case 3: status = "Đã hoàn thành"; break;
                    case 4: status = "Đã hủy"; break;
                }
            }
            bookingMap.put("status", status);
            
            // Tính tổng amount từ payments
            Double amount = booking.getPayments().stream()
                    .mapToDouble(p -> p.getAmount().doubleValue())
                    .sum();
            bookingMap.put("amount", amount);
            
            String paymentStatus = "Chưa thanh toán";
            if (!booking.getPayments().isEmpty()) {
                Payment firstPayment = booking.getPayments().iterator().next();
                if (firstPayment.getPaymentStatus() != null) {
                    if (firstPayment.getPaymentStatus().getId() == PAYMENT_STATUS_PAID) {
                        paymentStatus = "Đã thanh toán";
                    } else {
                        paymentStatus = "Chưa thanh toán";
                    }
                }
            }
            bookingMap.put("paymentStatus", paymentStatus);
            bookingMap.put("canCancel", canCancelBooking(booking));
            bookingMap.put("canReview", canReviewBooking(booking));
            
            return bookingMap;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAvailableCourts() {
        List<Court> courts = courtRepository.findAll(); // Lấy tất cả courts để hiển thị
        LocalDate today = LocalDate.now();
        
        return courts.stream().map(court -> {
            Map<String, Object> courtMap = new HashMap<>();
            courtMap.put("id", court.getId());
            courtMap.put("name", court.getName());
            courtMap.put("description", court.getDescription());
            courtMap.put("location", "Khu A");
            courtMap.put("priceRange", "200,000 - 300,000 VND");
            courtMap.put("rating", 4.5);
            courtMap.put("isPopular", true);
            courtMap.put("amenities", Arrays.asList("Điều hòa", "Thay đồ", "Nước uống"));
            courtMap.put("image", "/images/court" + court.getId() + ".jpg");
            
            // Tính available slots hôm nay
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            long availableSlots = timeSlots.stream()
                    .filter(slot -> !isTimeSlotBooked(court.getId(), slot.getId(), today))
                    .count();
            courtMap.put("availableSlots", (int) availableSlots);
            
            return courtMap;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getNotifications(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> notifications = new ArrayList<>();
        
        // Thông báo từ upcoming bookings
        List<Booking> upcomingBookings = bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId())
                .stream()
                .filter(b -> b.getStatus() != null && b.getStatus().getId() == (byte) 2 && 
                           b.getBookingDate().isAfter(LocalDate.now()))
                .limit(limit)
                .collect(Collectors.toList());

        for (Booking booking : upcomingBookings) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", booking.getId());
            notification.put("message", String.format("Bạn có lịch chơi tại %s vào ngày %s lúc %s", 
                    booking.getCourt().getName(), 
                    booking.getBookingDate(),
                    booking.getTimeSlot().getStartTime()));
            notification.put("isRead", false);
            notification.put("createdAt", booking.getCreatedAt());
            notifications.add(notification);
        }

        return notifications;
    }

    public Map<String, Object> getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardStatsDto stats = getDashboardStats(email);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("membershipLevel", stats.getMembershipLevel());
        profile.put("points", stats.getLoyaltyPoints());
        
        return profile;
    }

    private String calculateMembershipLevel(int totalBookings) {
        if (totalBookings >= 50) return "Platinum";
        if (totalBookings >= 20) return "Gold";
        if (totalBookings >= 5) return "Silver";
        return "Bronze";
    }

    private boolean canCancelBooking(Booking booking) {
        return booking.getStatus() != null && booking.getStatus().getId() == (byte) 2 && 
               booking.getBookingDate().isAfter(LocalDate.now());
    }

    private boolean canReviewBooking(Booking booking) {
        return booking.getStatus() != null && booking.getStatus().getId() == (byte) 3;
    }

    private boolean isTimeSlotBooked(Integer courtId, Integer timeSlotId, LocalDate date) {
        return bookingRepository.existsByCourtIdAndTimeSlotIdAndBookingDateAndStatusIdNot(
                courtId, timeSlotId, date, (byte) 4);
    }
} 