package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.StatusType;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.CourtService;
import com.example.shuttlesync.service.StatusTypeService;
import com.example.shuttlesync.service.TimeSlotService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin/courts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class CourtManagementController {

    private final CourtService courtService;
    private final TimeSlotService timeSlotService;
    private final StatusTypeService statusTypeService;
    private final UserService userService;

    // Quản lý sân
    @GetMapping
    public ResponseEntity<List<Court>> getAllCourts() {
        log.info("Fetching all courts");
        return ResponseEntity.ok(courtService.getAllCourts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourtById(@PathVariable Integer id) {
        log.info("Fetching court with id: {}", id);
        try {
            Court court = courtService.getCourtById(id);
            return ResponseEntity.ok(court);
        } catch (Exception e) {
            log.error("Error fetching court with id: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Court>> getAvailableCourts() {
        log.info("Fetching available courts");
        return ResponseEntity.ok(courtService.getAvailableCourts());
    }

    @PostMapping
    public ResponseEntity<Court> createCourt(@RequestBody Court court) {
        log.info("Creating new court: {}", court.getName());
        try {
            Court newCourt = courtService.createCourt(court);
            return ResponseEntity.ok(newCourt);
        } catch (Exception e) {
            log.error("Error creating court: {}", court.getName(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(@PathVariable Integer id, @RequestBody Court court) {
        log.info("Updating court with id: {}", id);
        try {
            Court updatedCourt = courtService.updateCourt(id, court);
            return ResponseEntity.ok(updatedCourt);
        } catch (Exception e) {
            log.error("Error updating court with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourt(@PathVariable Integer id) {
        log.info("Deleting court with id: {}", id);
        try {
            courtService.deleteCourt(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting court with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Court> toggleCourtStatus(@PathVariable Integer id) {
        log.info("Toggling status for court with id: {}", id);
        try {
            Court updatedCourt = courtService.toggleCourtStatus(id);
            return ResponseEntity.ok(updatedCourt);
        } catch (Exception e) {
            log.error("Error toggling status for court with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Quản lý khung giờ
    @GetMapping("/{courtId}/timeslots")
    public ResponseEntity<List<TimeSlot>> getTimeSlotsByCourt(@PathVariable Integer courtId) {
        log.info("Fetching time slots for court id: {}", courtId);
        try {
            List<TimeSlot> timeSlots = timeSlotService.getAllTimeSlotsByCourt(courtId);
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            log.error("Error fetching time slots for court id: {}", courtId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{courtId}/timeslots/available")
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @PathVariable Integer courtId,
            @RequestParam LocalDate date) {
        log.info("Fetching available time slots for court id: {} on date: {}", courtId, date);
        try {
            List<TimeSlot> availableSlots = timeSlotService.getAvailableTimeSlots(courtId, date);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            log.error("Error fetching available time slots for court id: {} on date: {}", courtId, date, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/timeslots/day-type")
    public ResponseEntity<Map<String, String>> getDayType(@RequestParam LocalDate date) {
        log.info("Checking day type for date: {}", date);
        try {
            String dayType = timeSlotService.getDayType(date);
            Map<String, String> response = new HashMap<>();
            response.put("date", date.toString());
            response.put("dayType", dayType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking day type for date: {}", date, e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Các endpoint khác có thể được thêm vào tùy theo nhu cầu

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
