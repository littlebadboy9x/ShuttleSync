package com.example.shuttlesync.service;

import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerHistoryService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingServiceRepository bookingServiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Lấy thống kê lịch sử booking
     */
    public Map<String, Object> getHistoryStats(Integer userId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Booking> allBookings = bookingRepository.findByUserIdOrderByBookingDateDesc(userId);
        
        // Tổng số booking
        stats.put("totalBookings", allBookings.size());
        
        // Booking theo trạng thái (sử dụng name từ BookingStatusType)
        Map<String, Long> statusCount = allBookings.stream()
                .collect(Collectors.groupingBy(
                    booking -> booking.getStatus().getName(),
                    Collectors.counting()
                ));
        stats.put("statusBreakdown", statusCount);
        
        // Tổng tiền đã chi tiêu (từ Payment table)
        Double totalSpent = allBookings.stream()
                .filter(booking -> "Đã hoàn thành".equals(booking.getStatus().getName()))
                .flatMap(booking -> booking.getPayments().stream())
                .filter(payment -> "Đã thanh toán".equals(payment.getPaymentStatus().getName()))
                .mapToDouble(payment -> payment.getAmount().doubleValue())
                .sum();
        stats.put("totalSpent", totalSpent);
        
        // Sân được đặt nhiều nhất (sử dụng name từ Court)
        Map<String, Long> courtCount = allBookings.stream()
                .collect(Collectors.groupingBy(
                    booking -> booking.getCourt().getName(),
                    Collectors.counting()
                ));
        
        String favoriteCourt = courtCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Chưa có");
        stats.put("favoriteCourt", favoriteCourt);
        
        // Booking trong tháng này
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        long thisMonthBookings = allBookings.stream()
                .filter(booking -> !booking.getBookingDate().isBefore(startOfMonth))
                .count();
        stats.put("thisMonthBookings", thisMonthBookings);
        
        return stats;
    }

    /**
     * Lấy danh sách booking history với filter
     */
    public List<Map<String, Object>> getBookingHistory(Integer userId, String status, String period, 
                                                       String search, int page, int size) {
        
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingDateDesc(userId);
        
        // Filter theo status
        if (!"all".equals(status)) {
            bookings = bookings.stream()
                    .filter(booking -> status.equals(booking.getStatus().getName()))
                    .collect(Collectors.toList());
        }
        
        // Filter theo period
        if (!"all".equals(period)) {
            LocalDate filterDate = switch (period) {
                case "week" -> LocalDate.now().minusWeeks(1);
                case "month" -> LocalDate.now().minusMonths(1);
                case "quarter" -> LocalDate.now().minusMonths(3);
                case "year" -> LocalDate.now().minusYears(1);
                default -> LocalDate.now().minusYears(10);
            };
            
            bookings = bookings.stream()
                    .filter(booking -> !booking.getBookingDate().isBefore(filterDate))
                    .collect(Collectors.toList());
        }
        
        // Filter theo search
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            bookings = bookings.stream()
                    .filter(booking -> 
                        booking.getCourt().getName().toLowerCase().contains(searchLower) ||
                        booking.getId().toString().contains(searchLower))
                    .collect(Collectors.toList());
        }
        
        // Pagination
        int start = page * size;
        int end = Math.min(start + size, bookings.size());
        
        if (start >= bookings.size()) {
            return new ArrayList<>();
        }
        
        return bookings.subList(start, end).stream()
                .map(this::convertBookingToMap)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết booking
     */
    public Map<String, Object> getBookingDetail(Integer bookingId, Integer userId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking không tồn tại");
        }
        
        Booking booking = bookingOpt.get();
        
        // Kiểm tra quyền truy cập
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền truy cập booking này");
        }
        
        Map<String, Object> result = convertBookingToMap(booking);
        
        // Thêm thông tin dịch vụ booking
        List<com.example.shuttlesync.model.BookingService> serviceItems = bookingServiceRepository.findByBookingId(bookingId);
        List<Map<String, Object>> services = serviceItems.stream()
                .map(item -> {
                    Map<String, Object> service = new HashMap<>();
                    service.put("serviceName", item.getService().getServiceName());
                    service.put("quantity", item.getQuantity());
                    service.put("unitPrice", item.getUnitPrice());
                    service.put("totalPrice", item.getTotalPrice());
                    service.put("notes", item.getNotes());
                    return service;
                })
                .collect(Collectors.toList());
        result.put("services", services);
        
        // Thông tin thanh toán
        Optional<Payment> paymentOpt = booking.getPayments().stream().findFirst();
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("paymentMethod", payment.getPaymentMethod());
            paymentInfo.put("amount", payment.getAmount());
            paymentInfo.put("paymentStatus", payment.getPaymentStatus().getName());
            paymentInfo.put("createdAt", payment.getCreatedAt());
            paymentInfo.put("paidAt", payment.getPaidAt());
            result.put("payment", paymentInfo);
        }
        
        // Thông tin đánh giá
        Optional<Review> reviewOpt = reviewRepository.findByBookingIdAndUserId(bookingId, userId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            Map<String, Object> reviewInfo = new HashMap<>();
            reviewInfo.put("rating", review.getRating());
            reviewInfo.put("comment", review.getComment());
            reviewInfo.put("createdAt", review.getCreatedAt());
            result.put("review", reviewInfo);
        }
        
        return result;
    }

    /**
     * Thêm đánh giá cho booking
     */
    public void addReview(Integer bookingId, Integer userId, Map<String, Object> reviewData) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking không tồn tại");
        }
        
        Booking booking = bookingOpt.get();
        
        // Kiểm tra quyền và trạng thái
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền đánh giá booking này");
        }
        
        if (!"Đã hoàn thành".equals(booking.getStatus().getName())) {
            throw new RuntimeException("Chỉ có thể đánh giá booking đã hoàn thành");
        }
        
        // Kiểm tra đã có review chưa
        Optional<Review> existingReview = reviewRepository.findByBookingIdAndUserId(bookingId, userId);
        if (existingReview.isPresent()) {
            throw new RuntimeException("Booking này đã được đánh giá rồi");
        }
        
        // Tạo review mới
        Review review = new Review();
        review.setBooking(booking);
        review.setUser(booking.getUser());
        review.setRating((Integer) reviewData.get("rating"));
        review.setComment((String) reviewData.get("comment"));
        review.setCreatedAt(LocalDateTime.now());
        
        reviewRepository.save(review);
    }

    /**
     * Cập nhật đánh giá
     */
    public void updateReview(Integer bookingId, Integer userId, Map<String, Object> reviewData) {
        Optional<Review> reviewOpt = reviewRepository.findByBookingIdAndUserId(bookingId, userId);
        
        if (reviewOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy đánh giá để cập nhật");
        }
        
        Review review = reviewOpt.get();
        review.setRating((Integer) reviewData.get("rating"));
        review.setComment((String) reviewData.get("comment"));
        
        reviewRepository.save(review);
    }

    /**
     * Đặt lại booking từ lịch sử
     */
    public Map<String, Object> rebookFromHistory(Integer bookingId, Integer userId) {
        Optional<Booking> originalBookingOpt = bookingRepository.findById(bookingId);
        
        if (originalBookingOpt.isEmpty()) {
            throw new RuntimeException("Booking gốc không tồn tại");
        }
        
        Booking originalBooking = originalBookingOpt.get();
        
        if (!originalBooking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền đặt lại booking này");
        }
        
        Map<String, Object> rebookData = new HashMap<>();
        rebookData.put("courtId", originalBooking.getCourt().getId());
        rebookData.put("courtName", originalBooking.getCourt().getName());
        rebookData.put("timeSlotId", originalBooking.getTimeSlot().getId());
        rebookData.put("startTime", originalBooking.getTimeSlot().getStartTime());
        rebookData.put("endTime", originalBooking.getTimeSlot().getEndTime());
        rebookData.put("message", "Thông tin booking đã được sao chép. Vui lòng chọn ngày mới.");
        
        // Lấy danh sách dịch vụ đã đặt
        List<com.example.shuttlesync.model.BookingService> originalServices = bookingServiceRepository.findByBookingId(bookingId);
        List<Map<String, Object>> services = originalServices.stream()
                .map(service -> {
                    Map<String, Object> serviceData = new HashMap<>();
                    serviceData.put("serviceId", service.getService().getId());
                    serviceData.put("serviceName", service.getService().getServiceName());
                    serviceData.put("quantity", service.getQuantity());
                    return serviceData;
                })
                .collect(Collectors.toList());
        rebookData.put("services", services);
        
        return rebookData;
    }

    /**
     * Xuất báo cáo lịch sử
     */
    public Map<String, Object> exportHistory(Integer userId, String format, String startDate, String endDate) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingDateDesc(userId);
        
        // Filter theo ngày nếu có
        if (startDate != null && endDate != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);
            
            bookings = bookings.stream()
                    .filter(booking -> {
                        LocalDate bookingDate = booking.getBookingDate();
                        return !bookingDate.isBefore(start) && !bookingDate.isAfter(end);
                    })
                    .collect(Collectors.toList());
        }
        
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("format", format);
        exportData.put("totalRecords", bookings.size());
        exportData.put("data", bookings.stream()
                .map(this::convertBookingToMap)
                .collect(Collectors.toList()));
        exportData.put("exportDate", LocalDateTime.now());
        exportData.put("message", "Báo cáo đã được tạo thành công");
        
        return exportData;
    }

    /**
     * Convert Booking entity to Map
     */
    private Map<String, Object> convertBookingToMap(Booking booking) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("id", booking.getId());
        result.put("courtId", booking.getCourt().getId());
        result.put("courtName", booking.getCourt().getName());
        result.put("courtDescription", booking.getCourt().getDescription());
        result.put("bookingDate", booking.getBookingDate());
        result.put("timeSlotId", booking.getTimeSlot().getId());
        result.put("startTime", booking.getTimeSlot().getStartTime());
        result.put("endTime", booking.getTimeSlot().getEndTime());
        result.put("status", booking.getStatus().getName());
        result.put("statusId", booking.getStatus().getId());
        result.put("notes", booking.getNotes());
        result.put("createdAt", booking.getCreatedAt());
        
        // Tính toán tổng tiền từ payments
        Double totalAmount = booking.getPayments().stream()
                .mapToDouble(payment -> payment.getAmount().doubleValue())
                .sum();
        result.put("totalAmount", totalAmount);
        
        // Court image (mock - có thể thêm vào Court entity sau)
        result.put("courtImage", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop");
        
        // Payment status
        Optional<Payment> paymentOpt = booking.getPayments().stream().findFirst();
        if (paymentOpt.isPresent()) {
            result.put("paymentStatus", paymentOpt.get().getPaymentStatus().getName());
            result.put("paymentMethod", paymentOpt.get().getPaymentMethod());
        } else {
            result.put("paymentStatus", "Chưa thanh toán");
            result.put("paymentMethod", null);
        }
        
        return result;
    }
} 