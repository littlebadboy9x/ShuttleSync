package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.BookingDTO;
import com.example.shuttlesync.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private static final Logger logger = Logger.getLogger(BookingController.class.getName());
    private final BookingService bookingService;

    @GetMapping("/recent")
    public ResponseEntity<List<BookingDTO>> getRecentBookings() {
        logger.info("Gọi API get recent bookings");
        List<BookingDTO> bookings = bookingService.getRecentBookings();
        logger.info("Số lượng đặt sân trả về: " + (bookings != null ? bookings.size() : "null"));
        if (bookings != null && !bookings.isEmpty()) {
            logger.info("Đặt sân đầu tiên: " + bookings.get(0).toString());
        }
        return ResponseEntity.ok(bookings);
    }
} 