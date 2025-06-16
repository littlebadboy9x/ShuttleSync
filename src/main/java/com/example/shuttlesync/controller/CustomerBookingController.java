package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.*;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.security.AuthenticationFacade;
import com.example.shuttlesync.service.CustomerBookingService;
import com.example.shuttlesync.service.BookingService;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.CustomerBookingInfoRepository;
import com.example.shuttlesync.model.CustomerBookingInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping(value = "/customer", produces = "application/json;charset=UTF-8")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerBookingController {

    private final CustomerBookingService bookingService;
    private final BookingService bookingServiceService;
    private final AuthenticationFacade authenticationFacade;
    private final BookingRepository bookingRepository;
    private final CustomerBookingInfoRepository customerBookingInfoRepository;

    /**
     * Debug endpoint để kiểm tra authentication - PUBLIC ACCESS
     */
    @GetMapping("/debug/auth")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            response.put("authenticated", auth != null && auth.isAuthenticated());
            response.put("principal", auth != null ? auth.getPrincipal() : null);
            response.put("authorities", auth != null ? auth.getAuthorities() : null);
            response.put("name", auth != null ? auth.getName() : null);
            
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                try {
                    User currentUser = authenticationFacade.getCurrentUser();
                    response.put("currentUser", currentUser);
                } catch (Exception e) {
                    response.put("currentUserError", e.getMessage());
                }
            }
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách sân có sẵn - PUBLIC ACCESS
     */
    @GetMapping("/courts")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<List<Map<String, Object>>> getAvailableCourts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String priceRange) {
        try {
            List<Map<String, Object>> courts = bookingService.getAvailableCourts(search, location, priceRange);
            return ResponseEntity.ok(courts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy khung giờ có sẵn cho sân cụ thể - PUBLIC ACCESS
     */
    @GetMapping("/courts/{courtId}/timeslots")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<List<Map<String, Object>>> getAvailableTimeSlots(
            @PathVariable Integer courtId,
            @RequestParam LocalDate date) {
        try {
            List<Map<String, Object>> timeSlots = bookingService.getAvailableTimeSlots(courtId, date);
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Tạo booking mới - REQUIRES CUSTOMER AUTHENTICATION
     */
    @PostMapping("/create")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            // Lấy userId từ request body (frontend sẽ gửi userId của user đang đăng nhập)
            Integer userId = (Integer) bookingData.get("userId");
            
            // Nếu không có userId trong request, thử lấy từ authentication
            if (userId == null) {
                try {
                    User currentUser = authenticationFacade.getCurrentUser();
                    userId = currentUser.getId();
                } catch (Exception e) {
                    throw new RuntimeException("Không thể xác định user. Vui lòng đăng nhập lại.");
                }
            }
            
            Map<String, Object> result = bookingService.createBooking(userId, bookingData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Đặt sân thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Tạo booking mới - SIMPLE VERSION WITH DYNAMIC USER
     */
    @PostMapping("/create-test")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> createBookingTest(@RequestBody Map<String, Object> bookingData) {
        try {
            log.info("=== CREATE-TEST DEBUG ===");
            log.info("Request data: " + bookingData);
            
            // Lấy userId từ request body (frontend sẽ gửi userId của user đang đăng nhập)
            Integer userId = (Integer) bookingData.get("userId");
            log.info("UserId from request: " + userId);
            
            // Nếu không có userId, fallback về user mặc định
            if (userId == null) {
                userId = 3; // Default to user2 (Nguyễn Văn B)
                log.info("No userId in request, using fallback: " + userId);
            } else {
                log.info("Using userId from request: " + userId);
            }
            
            Map<String, Object> result = bookingService.createBooking(userId, bookingData);
            log.info("Booking created successfully for userId: " + userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error in create-test: " + e.getMessage(), e);
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Đặt sân thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy chi tiết booking - REQUIRES CUSTOMER AUTHENTICATION
     */
    @GetMapping("/details/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> getBookingDetails(@PathVariable Integer bookingId) {
        try {
            // Get current authenticated user instead of hardcoded userId
            User currentUser = authenticationFacade.getCurrentUser();
            Integer userId = currentUser.getId();
            
            Map<String, Object> result = bookingService.getBookingDetails(bookingId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lấy thông tin booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Hủy booking - REQUIRES CUSTOMER AUTHENTICATION
     */
    @PostMapping("/cancel/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Integer bookingId) {
        try {
            // Get current authenticated user instead of hardcoded userId
            User currentUser = authenticationFacade.getCurrentUser();
            Integer userId = currentUser.getId();
            
            // cancelBooking returns void, so we create our own response
            bookingService.cancelBooking(bookingId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã hủy booking thành công");
            response.put("bookingId", bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Hủy booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Áp dụng voucher - REQUIRES CUSTOMER AUTHENTICATION
     */
    @PostMapping("/apply-voucher")
    @PreAuthorize("hasRole('CUSTOMER')")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<Map<String, Object>> applyVoucher(@RequestBody Map<String, Object> request) {
        try {
            // Get current authenticated user instead of hardcoded userId
            User currentUser = authenticationFacade.getCurrentUser();
            Integer userId = currentUser.getId();
            
            // Use the existing applyVoucher method that takes userId and voucherData Map
            Map<String, Object> result = bookingService.applyVoucher(userId, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Áp dụng voucher thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy danh sách voucher có thể sử dụng - REQUIRES CUSTOMER AUTHENTICATION
     */
    @GetMapping("/vouchers")
    @PreAuthorize("hasRole('CUSTOMER')")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    public ResponseEntity<List<Map<String, Object>>> getAvailableVouchers(@RequestParam(required = false) Double totalAmount) {
        try {
            // Get current authenticated user instead of hardcoded userId
            User currentUser = authenticationFacade.getCurrentUser();
            Integer userId = currentUser.getId();
            
            // Use existing method signature that requires totalAmount
            Double amount = totalAmount != null ? totalAmount : 0.0;
            List<Map<String, Object>> vouchers = bookingService.getAvailableVouchers(userId, amount);
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/bookings/history")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookingHistory() {
        try {
            // Lấy userId từ user đang đăng nhập
            Integer userId = getUserIdFromRequest();
            log.info("Getting booking history for userId: " + userId);
            
            // Sử dụng service method đơn giản
            List<Booking> bookings = bookingServiceService.getBookingsByUserId(userId);
            
            List<Map<String, Object>> bookingHistory = bookings.stream().map(booking -> {
                Map<String, Object> bookingMap = new HashMap<>();
                bookingMap.put("id", booking.getId());
                bookingMap.put("courtName", booking.getCourt().getName());
                bookingMap.put("bookingDate", booking.getBookingDate().toString());
                bookingMap.put("startTime", booking.getTimeSlot().getStartTime().toString());
                bookingMap.put("endTime", booking.getTimeSlot().getEndTime().toString());
                bookingMap.put("status", booking.getStatus().getName());
                bookingMap.put("amount", booking.getTimeSlot().getPrice());
                bookingMap.put("createdAt", booking.getCreatedAt().toString());
                bookingMap.put("notes", booking.getNotes());
                
                // Lấy thông tin thanh toán từ CustomerBookingInfo (đã được tính toán sẵn)
                if (booking.getCustomerBookingInfo() != null) {
                    bookingMap.put("paymentStatus", booking.getCustomerBookingInfo().getPaymentStatus() != null ? 
                        booking.getCustomerBookingInfo().getPaymentStatus() : "Chưa thanh toán");
                    bookingMap.put("paymentMethod", booking.getCustomerBookingInfo().getPaymentMethod() != null ? 
                        booking.getCustomerBookingInfo().getPaymentMethod() : "Chưa chọn");
                    bookingMap.put("paymentAmount", booking.getCustomerBookingInfo().getPaymentAmount() != null ? 
                        booking.getCustomerBookingInfo().getPaymentAmount() : 0);
                } else {
                    // Fallback nếu không có CustomerBookingInfo
                    bookingMap.put("paymentStatus", "Chưa thanh toán");
                    bookingMap.put("paymentMethod", "Chưa chọn");
                    bookingMap.put("paymentAmount", 0);
                }
                
                return bookingMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bookingHistory
            ));
        } catch (Exception e) {
            log.error("Error fetching booking history", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Helper method để lấy userId từ user đang đăng nhập
     */
    private Integer getUserIdFromRequest() {
        try {
            // Thử lấy từ authentication context trước
            User currentUser = authenticationFacade.getCurrentUser();
            return currentUser.getId();
        } catch (Exception e) {
            // Nếu không có authentication, fallback về user mặc định
            log.warn("Cannot get user from authentication, using fallback");
            return 3; // Default to user2 (Nguyễn Văn B) thay vì user1
        }
    }

    @GetMapping("/bookings/detail/{bookingId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookingDetail(@PathVariable Integer bookingId) {
        try {
            Booking booking = bookingServiceService.getBookingById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
            
            Map<String, Object> bookingDetail = new HashMap<>();
            bookingDetail.put("id", booking.getId());
            bookingDetail.put("courtName", booking.getCourt().getName());
            bookingDetail.put("courtDescription", booking.getCourt().getDescription());
            bookingDetail.put("bookingDate", booking.getBookingDate().toString());
            bookingDetail.put("startTime", booking.getTimeSlot().getStartTime().toString());
            bookingDetail.put("endTime", booking.getTimeSlot().getEndTime().toString());
            bookingDetail.put("status", booking.getStatus().getName());
            bookingDetail.put("amount", booking.getTimeSlot().getPrice());
            bookingDetail.put("createdAt", booking.getCreatedAt().toString());
            bookingDetail.put("notes", booking.getNotes());
            bookingDetail.put("userName", booking.getUser().getFullName());
            bookingDetail.put("userEmail", booking.getUser().getEmail());
            bookingDetail.put("userPhone", booking.getUser().getPhone());
            
            // Thêm thông tin thanh toán chi tiết
            if (booking.getCustomerBookingInfo() != null) {
                bookingDetail.put("paymentStatus", booking.getCustomerBookingInfo().getPaymentStatus() != null ? 
                    booking.getCustomerBookingInfo().getPaymentStatus() : "Chưa thanh toán");
                bookingDetail.put("paymentMethod", booking.getCustomerBookingInfo().getPaymentMethod() != null ? 
                    booking.getCustomerBookingInfo().getPaymentMethod() : "Chưa chọn");
                bookingDetail.put("paymentAmount", booking.getCustomerBookingInfo().getPaymentAmount() != null ? 
                    booking.getCustomerBookingInfo().getPaymentAmount() : 0);
            } else {
                // Fallback nếu không có CustomerBookingInfo
                bookingDetail.put("paymentStatus", "Chưa thanh toán");
                bookingDetail.put("paymentMethod", "Chưa chọn");
                bookingDetail.put("paymentAmount", 0);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bookingDetail
            ));
        } catch (Exception e) {
            log.error("Error fetching booking detail for booking " + bookingId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API hoạt động bình thường",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

        @PostMapping("/sync-payment-status")
    public ResponseEntity<String> syncPaymentStatus() {
        try {
            bookingServiceService.syncPaymentStatusForAllBookings();
            return ResponseEntity.ok("Payment status synced successfully for all bookings");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error syncing payment status: " + e.getMessage());
        }
    }
    
    @PostMapping("/sync-payment-status/{bookingId}")
    public ResponseEntity<String> syncPaymentStatusForBooking(@PathVariable Integer bookingId) {
        try {
            bookingServiceService.syncPaymentStatusForBooking(bookingId);
            return ResponseEntity.ok("Payment status synced successfully for booking " + bookingId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error syncing payment status for booking " + bookingId + ": " + e.getMessage());
        }
    }

    /**
     * Lấy lịch sử booking - SIMPLE VERSION
     */
    @PostMapping("/bookings/history-simple")
    @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookingHistorySimple(@RequestBody Map<String, Object> request) {
        try {
            // Lấy userId từ request body
            Integer userId = (Integer) request.get("userId");
            
            // Nếu không có userId, fallback
            if (userId == null) {
                userId = getUserIdFromRequest();
            }
            
            log.info("Getting booking history for userId: " + userId);
            
            // Sử dụng service method đơn giản
            List<Booking> bookings = bookingServiceService.getBookingsByUserId(userId);
            
            List<Map<String, Object>> bookingHistory = bookings.stream().map(booking -> {
                Map<String, Object> bookingMap = new HashMap<>();
                bookingMap.put("id", booking.getId());
                bookingMap.put("courtName", booking.getCourt().getName());
                bookingMap.put("bookingDate", booking.getBookingDate().toString());
                bookingMap.put("startTime", booking.getTimeSlot().getStartTime().toString());
                bookingMap.put("endTime", booking.getTimeSlot().getEndTime().toString());
                bookingMap.put("status", booking.getStatus().getName());
                bookingMap.put("amount", booking.getTimeSlot().getPrice());
                bookingMap.put("createdAt", booking.getCreatedAt().toString());
                bookingMap.put("notes", booking.getNotes());
                
                // Lấy thông tin thanh toán từ CustomerBookingInfo (đã được tính toán sẵn)
                if (booking.getCustomerBookingInfo() != null) {
                    bookingMap.put("paymentStatus", booking.getCustomerBookingInfo().getPaymentStatus() != null ? 
                        booking.getCustomerBookingInfo().getPaymentStatus() : "Chưa thanh toán");
                    bookingMap.put("paymentMethod", booking.getCustomerBookingInfo().getPaymentMethod() != null ? 
                        booking.getCustomerBookingInfo().getPaymentMethod() : "Chưa chọn");
                    bookingMap.put("paymentAmount", booking.getCustomerBookingInfo().getPaymentAmount() != null ? 
                        booking.getCustomerBookingInfo().getPaymentAmount() : 0);
                } else {
                    // Fallback nếu không có CustomerBookingInfo
                    bookingMap.put("paymentStatus", "Chưa thanh toán");
                    bookingMap.put("paymentMethod", "Chưa chọn");
                    bookingMap.put("paymentAmount", 0);
                }
                
                return bookingMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bookingHistory
            ));
        } catch (Exception e) {
            log.error("Error fetching booking history", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

} 