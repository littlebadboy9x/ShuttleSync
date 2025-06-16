package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.User;
import com.example.shuttlesync.security.AuthenticationFacade;
import com.example.shuttlesync.service.CustomerHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/customer/history")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerHistoryController {

    @Autowired
    private CustomerHistoryService historyService;

    @Autowired
    private AuthenticationFacade authenticationFacade;

    /**
     * Lấy thống kê tổng quan lịch sử booking
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getHistoryStats() {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> stats = historyService.getHistoryStats(currentUser.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy danh sách booking history với filter
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookingHistory(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String period,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            List<Map<String, Object>> bookings = historyService.getBookingHistory(
                    currentUser.getId(), status, period, search, page, size);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy chi tiết booking trong lịch sử
     */
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBookingDetail(@PathVariable Integer bookingId) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> booking = historyService.getBookingDetail(bookingId, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Không tìm thấy booking");
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Thêm đánh giá cho booking
     */
    @PostMapping("/bookings/{bookingId}/review")
    public ResponseEntity<Map<String, String>> addReview(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, Object> reviewData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            historyService.addReview(bookingId, currentUser.getId(), reviewData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đánh giá đã được thêm thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể thêm đánh giá: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật đánh giá
     */
    @PutMapping("/bookings/{bookingId}/review")
    public ResponseEntity<Map<String, String>> updateReview(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, Object> reviewData) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            historyService.updateReview(bookingId, currentUser.getId(), reviewData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đánh giá đã được cập nhật thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể cập nhật đánh giá: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Đặt lại booking (book again)
     */
    @PostMapping("/bookings/{bookingId}/rebook")
    public ResponseEntity<Map<String, Object>> rebookFromHistory(@PathVariable Integer bookingId) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> result = historyService.rebookFromHistory(bookingId, currentUser.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Không thể đặt lại booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xuất báo cáo lịch sử booking
     */
    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportHistory(
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            User currentUser = authenticationFacade.getCurrentUser();
            Map<String, Object> exportData = historyService.exportHistory(
                    currentUser.getId(), format, startDate, endDate);
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Không thể xuất báo cáo");
            return ResponseEntity.badRequest().body(error);
        }
    }
} 