package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.BookingDTO;
import com.example.shuttlesync.dto.DashboardStatsDto;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.BookingService;
import com.example.shuttlesync.service.PaymentService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final UserService userService;

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getBookings(
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) String statusFilter) {
        
        if ((dateFilter == null || dateFilter.equals("all")) && (statusFilter == null || statusFilter.equals("all"))) {
            // Nếu không có bộ lọc, trả về các đặt sân gần đây
            return ResponseEntity.ok(bookingService.getRecentBookings());
        }
        
        // Nếu có bộ lọc, xử lý lọc theo ngày hoặc trạng thái
        List<Booking> bookings;
        
        if (dateFilter != null && !dateFilter.equals("all")) {
            LocalDate date = dateFilter.equals("today") ? LocalDate.now() : LocalDate.now().plusDays(1);
            bookings = bookingService.getBookingsByDate(date);
        } else {
            bookings = bookingService.getAllBookings();
        }

        if (statusFilter != null && !statusFilter.equals("all")) {
            Byte statusId = Byte.parseByte(statusFilter);
            bookings = bookings.stream()
                    .filter(booking -> booking.getStatus().getId().equals(statusId))
                    .toList();
        }

        // Chuyển đổi từ Booking thành BookingDTO
        List<BookingDTO> bookingDTOs = bookings.stream()
                .map(booking -> {
                    BookingDTO dto = new BookingDTO();
                    dto.setId(booking.getId());
                    dto.setUserName(booking.getUser().getFullName());
                    dto.setCourtName(booking.getCourt().getName());
                    dto.setBookingDate(booking.getBookingDate());
                    dto.setStartTime(booking.getTimeSlot().getStartTime().toString());
                    dto.setEndTime(booking.getTimeSlot().getEndTime().toString());
                    dto.setStatus(booking.getStatus().getId().toString());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(bookingDTOs);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // Tổng số đặt sân
        stats.setTotalBookings(bookingService.getAllBookings().size());
        
        // Số đặt sân hôm nay
        stats.setTodayBookings(bookingService.getBookingsByDate(LocalDate.now()).size());
        
        // Tổng số người dùng
        stats.setTotalUsers(userService.getAllUsers().size());
        
        // Tổng doanh thu
        java.math.BigDecimal totalRevenue = paymentService.getTotalPaidAmount();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue.doubleValue() : 0.0);

        return ResponseEntity.ok(stats);
    }
} 