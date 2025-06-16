package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.BookingDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.PaymentRepository;
import com.example.shuttlesync.service.BookingService;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;

@RestController
@RequestMapping 
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private static final Logger logger = Logger.getLogger(BookingController.class.getName());
    private final BookingService bookingService;
    private final InvoiceService invoiceService;
    private final PaymentRepository paymentRepository;
    private final UserService userService;

    @GetMapping("/admin/bookings/recent")
    public ResponseEntity<List<BookingDTO>> getRecentBookings() {
        logger.info("Gọi API get recent bookings");
        List<BookingDTO> bookings = bookingService.getRecentBookings();
        logger.info("Số lượng đặt sân trả về: " + (bookings != null ? bookings.size() : "null"));
        if (bookings != null && !bookings.isEmpty()) {
            logger.info("Đặt sân đầu tiên: " + bookings.get(0).toString());
        }
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/admin/bookings/all")
    public ResponseEntity<List<BookingDTO>> getAllBookings(
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) String statusFilter) {
        logger.info("Getting all bookings with filters - dateFilter: " + dateFilter + ", statusFilter: " + statusFilter);
        
        List<Booking> bookings;
        
        if (statusFilter != null && !statusFilter.equals("all")) {
            bookings = bookingService.getBookingsByStatus(Byte.parseByte(statusFilter));
        } else if (dateFilter != null && !dateFilter.equals("all")) {
            LocalDate targetDate;
            if ("today".equals(dateFilter)) {
                targetDate = LocalDate.now();
            } else if ("week".equals(dateFilter)) {
                targetDate = LocalDate.now();
                // For week filter, get last 7 days
                LocalDate startDate = targetDate.minusDays(7);
                bookings = bookingService.getBookingsBetweenDates(startDate, targetDate);
                return ResponseEntity.ok(bookings.stream()
                    .map(this::convertToDTO)
                    .toList());
            } else {
                targetDate = LocalDate.now();
            }
            bookings = bookingService.getBookingsByDate(targetDate);
        } else {
            bookings = bookingService.getAllBookings();
        }
        
        List<BookingDTO> bookingDTOs = bookings.stream()
            .map(this::convertToDTO)
            .toList();
            
        logger.info("Returning " + bookingDTOs.size() + " bookings");
        return ResponseEntity.ok(bookingDTOs);
    }

    @GetMapping("/admin/bookings/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats() {
        logger.info("Getting booking statistics");
        
        List<Booking> allBookings = bookingService.getAllBookings();
        List<Booking> todayBookings = bookingService.getBookingsByDate(LocalDate.now());
        
        // Calculate total revenue (simplified - sum of all booking prices)
        double totalRevenue = allBookings.stream()
            .filter(b -> b.getStatus().getId() == 2) // Only confirmed bookings
            .mapToDouble(b -> b.getTimeSlot().getPrice().doubleValue())
            .sum();
        
        // Get total users count (simplified - return a fixed number for now)
        int totalUsers = 150; // Placeholder - in real app, get from UserService
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", allBookings.size());
        stats.put("todayBookings", todayBookings.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalUsers", totalUsers);
        stats.put("pendingBookings", allBookings.stream().filter(b -> b.getStatus().getId() == 1).count());
        stats.put("confirmedBookings", allBookings.stream().filter(b -> b.getStatus().getId() == 2).count());
        stats.put("cancelledBookings", allBookings.stream().filter(b -> b.getStatus().getId() == 3).count());
        
        logger.info("Returning stats: totalBookings=" + allBookings.size() + ", totalRevenue=" + totalRevenue);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/admin/bookings/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Integer id,
            @RequestParam Byte statusId) {
        try {
            // Note: For now, we'll use a dummy user. In production, get from JWT token
            Booking updatedBooking = bookingService.updateBookingStatus(id, statusId, null);
            return ResponseEntity.ok(convertToDTO(updatedBooking));
        } catch (Exception e) {
            logger.severe("Error updating booking status: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/admin/bookings/{id}/approve")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable Integer id) {
        try {
            // Xác nhận booking bằng cách set status = 2 (Đã xác nhận)
            Booking updatedBooking = bookingService.updateBookingStatus(id, (byte) 2, null);
            logger.info("Booking confirmed with ID: " + id);
            
            // Tự động tạo hóa đơn cho booking đã xác nhận
            Invoice invoice = null;
            try {
                // Kiểm tra xem đã có hóa đơn chưa
                invoice = invoiceService.getInvoiceByBookingId(id);
                if (invoice == null) {
                    invoice = invoiceService.createInvoice(id);
                    logger.info("Automatically created invoice with ID: " + invoice.getId() + " for confirmed booking: " + id);
                } else {
                    logger.info("Invoice already exists for booking: " + id + ", invoice ID: " + invoice.getId());
                }
            } catch (Exception e) {
                logger.warning("Error creating invoice for booking ID: " + id + ": " + e.getMessage());
                // Tiếp tục xử lý ngay cả khi tạo hóa đơn thất bại
            }
            
            // Trả về thông tin booking và hóa đơn
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking đã được xác nhận thành công");
            response.put("booking", convertToDTO(updatedBooking));
            if (invoice != null) {
                response.put("invoiceId", invoice.getId());
                response.put("invoiceCreated", true);
            } else {
                response.put("invoiceCreated", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error confirming booking: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi xác nhận booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Kiểm tra tính khả dụng của khung giờ cho ngày đã chọn (cho frontend gọi trực tiếp)
    @GetMapping("/bookings/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkTimeSlotAvailabilityDirect(
            @RequestParam Integer courtId,
            @RequestParam Integer timeSlotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        logger.info("Checking availability (direct endpoint) for court: " + courtId + ", timeSlot: " + timeSlotId + ", date: " + date);
        
        try {
            boolean isAvailable = !bookingService.isTimeSlotBooked(courtId, timeSlotId, date);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", isAvailable);
            
            logger.info("Availability result for court: " + courtId + ", timeSlot: " + timeSlotId + ", date: " + date + " is: " + isAvailable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error checking availability: " + e.getMessage());
            e.printStackTrace();
            
            // Trả về lỗi với thông tin cụ thể
            Map<String, Boolean> errorResponse = new HashMap<>();
            errorResponse.put("available", false);
            errorResponse.put("error", true);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/admin/bookings")
    public ResponseEntity<BookingDTO> createBooking(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Integer courtId = (Integer) request.get("courtId");
            Integer timeSlotId = (Integer) request.get("timeSlotId");
            String bookingDateStr = (String) request.get("bookingDate");
            LocalDate bookingDate = LocalDate.parse(bookingDateStr);
            Boolean isWalkIn = (Boolean) request.getOrDefault("isWalkIn", false);
            String notes = (String) request.getOrDefault("notes", "");
            
            logger.info("Creating booking for user: " + userId + ", court: " + courtId + 
                       ", timeSlot: " + timeSlotId + ", date: " + bookingDate + 
                       ", isWalkIn: " + isWalkIn);
            
            // Kiểm tra trước nếu khung giờ đã được đặt
            boolean isTimeSlotAvailable = !bookingService.isTimeSlotBooked(courtId, timeSlotId, bookingDate);
            if (!isTimeSlotAvailable) {
                logger.warning("Time slot is already booked for court: " + courtId + 
                      ", timeSlot: " + timeSlotId + ", date: " + bookingDate);
                return ResponseEntity.badRequest().build();
            }
            
            // Tạo booking mới
            Booking booking = bookingService.createBooking(userId, courtId, timeSlotId, bookingDate);
            
            // Nếu là đặt tại quầy, cập nhật trạng thái thành "Đã xác nhận" (ID = 2)
            if (isWalkIn) {
                booking = bookingService.updateBookingStatus(booking.getId(), (byte) 2, null);
                logger.info("Walk-in booking set to confirmed status for booking ID: " + booking.getId());
                
                // Cập nhật ghi chú nếu có
                if (notes != null && !notes.isEmpty()) {
                    booking.setNotes(notes);
                    // Lưu lại booking sau khi cập nhật notes
                    booking = bookingService.saveBooking(booking);
                    logger.info("Notes added to booking ID: " + booking.getId());
                }
            }
            
            // Tự động tạo hóa đơn cho booking
            try {
                Invoice invoice = invoiceService.createInvoice(booking.getId());
                logger.info("Automatically created invoice with ID: " + invoice.getId() + " for booking: " + booking.getId());
            } catch (Exception e) {
                logger.warning("Error creating invoice for booking ID: " + booking.getId() + ": " + e.getMessage());
                // Vẫn tiếp tục xử lý ngay cả khi tạo hóa đơn thất bại
            }
            
            BookingDTO dto = convertToDTO(booking);
            logger.info("Booking created successfully with ID: " + dto.getId());
            return ResponseEntity.ok(dto);
        } catch (ResourceNotFoundException e) {
            logger.severe("Resource not found: " + e.getMessage());
            return ResponseEntity.status(404).build();
        } catch (IllegalArgumentException e) {
            logger.severe("Invalid argument: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.severe("Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setUserPhone(booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "N/A");
        dto.setCourtName(booking.getCourt().getName());
        dto.setCourtLocation(booking.getCourt().getDescription());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getTimeSlot().getStartTime().toString());
        dto.setEndTime(booking.getTimeSlot().getEndTime().toString());
        dto.setStatus(booking.getStatus().getId().toString());
        dto.setTotalAmount(booking.getTimeSlot().getPrice().doubleValue());
        
        // Lấy trạng thái thanh toán từ hóa đơn
        Invoice invoice = invoiceService.getInvoiceByBookingId(booking.getId());
        if (invoice != null && "Paid".equalsIgnoreCase(invoice.getStatus())) {
            dto.setPaymentStatus("paid");
        } else {
            // Kiểm tra payment nếu không có hóa đơn
            List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
            if (!payments.isEmpty() && payments.stream().anyMatch(p -> p.getPaymentStatus().getId() == 2)) {
                dto.setPaymentStatus("paid");
            } else {
                dto.setPaymentStatus("pending");
            }
        }
        
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setNotes(booking.getNotes() != null ? booking.getNotes() : "");
        return dto;
    }
} 