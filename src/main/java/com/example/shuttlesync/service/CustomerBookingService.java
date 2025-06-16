package com.example.shuttlesync.service;

import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class CustomerBookingService {

    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookingStatusTypeRepository bookingStatusTypeRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Lấy danh sách sân có sẵn từ database
     */
    public List<Map<String, Object>> getAvailableCourts(String search, String location, String priceRange) {
        List<Court> courts = courtRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Court court : courts) {
            Map<String, Object> courtMap = new HashMap<>();
            courtMap.put("id", court.getId());
            courtMap.put("name", court.getName());
            courtMap.put("description", court.getDescription());
            courtMap.put("location", "Khu A"); // Default location since not in database
            courtMap.put("rating", 4.5); // Default rating
            courtMap.put("image", "/images/court" + court.getId() + ".jpg");
            courtMap.put("priceRange", "200,000 - 300,000 VND"); // Default price range
            
            // Check availability for today
            LocalDate today = LocalDate.now();
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            long availableSlots = timeSlots.stream()
                    .filter(slot -> !isTimeSlotBooked(court.getId(), slot.getId(), today))
                    .count();
            courtMap.put("availableSlots", (int) availableSlots);
            
            result.add(courtMap);
        }
        
        return result;
    }

    /**
     * Lấy khung giờ có sẵn cho sân từ database
     */
    public List<Map<String, Object>> getAvailableTimeSlots(Integer courtId, LocalDate date) {
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Use Set to avoid duplicates based on time
        Set<String> addedTimes = new HashSet<>();
        
        for (TimeSlot slot : timeSlots) {
            String timeKey = slot.getStartTime() + "-" + slot.getEndTime();
            
            // Skip if this time combination already exists
            if (addedTimes.contains(timeKey)) {
                continue;
            }
            
            Map<String, Object> slotMap = new HashMap<>();
            slotMap.put("id", slot.getId());
            slotMap.put("startTime", slot.getStartTime().toString());
            slotMap.put("endTime", slot.getEndTime().toString());
            slotMap.put("price", slot.getPrice().doubleValue());
            slotMap.put("isAvailable", !isTimeSlotBooked(courtId, slot.getId(), date));
            
            result.add(slotMap);
            addedTimes.add(timeKey);
        }
        
        // Sort by start time
        result.sort((a, b) -> {
            String timeA = (String) a.get("startTime");
            String timeB = (String) b.get("startTime");
            return timeA.compareTo(timeB);
        });
        
        return result;
    }

    /**
     * Kiểm tra khung giờ đã được đặt chưa
     */
    private boolean isTimeSlotBooked(Integer courtId, Integer timeSlotId, LocalDate date) {
        return bookingRepository.existsByCourtIdAndTimeSlotIdAndBookingDateAndStatusIdNot(
                courtId, timeSlotId, date, (byte) 4); // 4 = Cancelled
    }

    /**
     * Tạo booking mới
     */
    public Map<String, Object> createBooking(Integer userId, Map<String, Object> bookingData) {
        try {
            Integer courtId = (Integer) bookingData.get("courtId");
            Integer timeSlotId = (Integer) bookingData.get("timeSlotId");
            String bookingDateStr = (String) bookingData.get("bookingDate");
            String notes = (String) bookingData.getOrDefault("notes", "");
            
            LocalDate bookingDate = LocalDate.parse(bookingDateStr);
            
            // Validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate court exists
            Court court = courtRepository.findById(courtId)
                    .orElseThrow(() -> new RuntimeException("Court not found"));
            
            // Validate time slot exists
            TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));
            
            // Check if time slot is available
            if (isTimeSlotBooked(courtId, timeSlotId, bookingDate)) {
                throw new RuntimeException("Time slot is already booked");
            }
            
            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setCourt(court);
            booking.setTimeSlot(timeSlot);
            booking.setBookingDate(bookingDate);
            booking.setNotes(notes);
            booking.setCreatedAt(java.time.LocalDateTime.now());
            
            // Set default status (pending confirmation)
            BookingStatusType pendingStatus = bookingStatusTypeRepository.findById((byte) 1)
                    .orElseThrow(() -> new RuntimeException("Pending status not found"));
            booking.setStatus(pendingStatus);
            
            // Save booking
            booking = bookingRepository.save(booking);
            
            // CustomerBookingInfo sẽ được tự động tạo bởi database triggers
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", booking.getId());
            response.put("status", "pending_confirmation");
            response.put("message", "Booking đã được tạo thành công. Vui lòng chờ xác nhận.");
            response.put("estimatedConfirmTime", "15 phút");
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo booking: " + e.getMessage());
        }
    }

    /**
     * Lấy thông tin chi tiết booking từ database
     */
    public Map<String, Object> getBookingDetails(Integer bookingId, Integer userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify booking belongs to user
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to booking");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", booking.getId());
        result.put("courtName", booking.getCourt().getName());
        result.put("date", booking.getBookingDate());
        result.put("startTime", booking.getTimeSlot().getStartTime());
        result.put("endTime", booking.getTimeSlot().getEndTime());
        result.put("status", booking.getStatus().getName());
        result.put("notes", booking.getNotes());
        result.put("createdAt", booking.getCreatedAt());
        
        // Calculate total amount from time slot price
        result.put("totalAmount", booking.getTimeSlot().getPrice().doubleValue());
        
        // Payment status (simplified)
        result.put("paymentStatus", booking.getPayments().isEmpty() ? "unpaid" : "paid");
        
        return result;
    }

    /**
     * Hủy booking
     */
    public void cancelBooking(Integer bookingId, Integer userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify booking belongs to user
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to booking");
        }
        
        // Check if booking can be cancelled (only pending and confirmed bookings)
        if (booking.getStatus().getId() != 1 && booking.getStatus().getId() != 2) {
            throw new RuntimeException("Booking cannot be cancelled");
        }
        
        // Set status to cancelled
        BookingStatusType cancelledStatus = bookingStatusTypeRepository.findById((byte) 4)
                .orElseThrow(() -> new RuntimeException("Cancelled status not found"));
        booking.setStatus(cancelledStatus);
        
        bookingRepository.save(booking);
    }

    /**
     * Tính giá booking
     */
    public Map<String, Object> calculatePrice(Map<String, Object> bookingData) {
        try {
            Integer timeSlotId = (Integer) bookingData.get("timeSlotId");
            TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));
            
            double basePrice = timeSlot.getPrice().doubleValue();
            double servicePrice = 0; // TODO: Calculate from services
            double discount = 0; // TODO: Calculate from vouchers
            double total = basePrice + servicePrice - discount;
            
            Map<String, Object> priceInfo = new HashMap<>();
            priceInfo.put("basePrice", basePrice);
            priceInfo.put("servicePrice", servicePrice);
            priceInfo.put("discount", discount);
            priceInfo.put("total", total);
            priceInfo.put("currency", "VND");
            
            return priceInfo;
        } catch (Exception e) {
            throw new RuntimeException("Cannot calculate price: " + e.getMessage());
        }
    }

    /**
     * Áp dụng voucher
     */
    public Map<String, Object> applyVoucher(Integer userId, Map<String, Object> voucherData) {
        Map<String, Object> result = new HashMap<>();
        
        // Mock implementation
        result.put("isValid", true);
        result.put("discountAmount", 20000);
        result.put("discountType", "fixed");
        result.put("message", "Voucher đã được áp dụng thành công");
        
        return result;
    }

    /**
     * Lấy danh sách voucher có thể sử dụng
     */
    public List<Map<String, Object>> getAvailableVouchers(Integer userId, Double totalAmount) {
        List<Map<String, Object>> vouchers = new ArrayList<>();
        
        // Mock vouchers
        Map<String, Object> voucher1 = new HashMap<>();
        voucher1.put("id", 1);
        voucher1.put("code", "WELCOME10");
        voucher1.put("name", "Chào mừng khách hàng mới");
        voucher1.put("description", "Giảm 10% cho đơn hàng đầu tiên");
        voucher1.put("discountType", "percentage");
        voucher1.put("discountValue", 10);
        voucher1.put("minAmount", 200000);
        voucher1.put("maxDiscount", 50000);
        vouchers.add(voucher1);
        
        Map<String, Object> voucher2 = new HashMap<>();
        voucher2.put("id", 2);
        voucher2.put("code", "WEEKEND20");
        voucher2.put("name", "Khuyến mãi cuối tuần");
        voucher2.put("description", "Giảm 20% cho booking cuối tuần");
        voucher2.put("discountType", "percentage");
        voucher2.put("discountValue", 20);
        voucher2.put("minAmount", 300000);
        voucher2.put("maxDiscount", 100000);
        vouchers.add(voucher2);
        
        return vouchers;
    }
    

} 