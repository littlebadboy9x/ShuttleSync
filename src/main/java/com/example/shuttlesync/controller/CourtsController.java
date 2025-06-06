package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.service.CourtService;
import com.example.shuttlesync.service.TimeSlotService;
import com.example.shuttlesync.service.ReviewService;
import com.example.shuttlesync.model.TimeSlot;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/courts")
@RequiredArgsConstructor
@Slf4j
public class CourtsController {

    private static final Logger logger = Logger.getLogger(CourtsController.class.getName());
    private final CourtService courtService;
    private final TimeSlotService timeSlotService;
    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Court>> getAllCourts() {
        try {
            logger.info("Fetching all courts");
            List<Court> courts = courtService.getAllCourts();
            logger.info("Found " + courts.size() + " courts");
            return ResponseEntity.ok(courts);
        } catch (Exception e) {
            logger.severe("Error fetching all courts: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourtById(@PathVariable Integer id) {
        try {
            logger.info("Fetching court with id: " + id);
            Court court = courtService.getCourtById(id);
            logger.info("Found court: " + court.getName());
            return ResponseEntity.ok(court);
        } catch (Exception e) {
            logger.severe("Error fetching court with id " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Court>> getAvailableCourts() {
        try {
            logger.info("Fetching available courts");
            List<Court> courts = courtService.getAvailableCourts();
            logger.info("Found " + courts.size() + " available courts");
            return ResponseEntity.ok(courts);
        } catch (Exception e) {
            logger.severe("Error fetching available courts: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/fixed-slots")
    public ResponseEntity<List<Court>> getCourtsWithFixedTimeSlots() {
        try {
            logger.info("Fetching courts with fixed time slots");
            List<Court> courts = courtService.getCourtsWithFixedTimeSlots();
            logger.info("Found " + courts.size() + " courts with fixed time slots");
            return ResponseEntity.ok(courts);
        } catch (Exception e) {
            logger.severe("Error fetching courts with fixed time slots: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/flexible-slots")
    public ResponseEntity<List<Court>> getCourtsWithoutFixedTimeSlots() {
        try {
            logger.info("Fetching courts with flexible time slots");
            List<Court> courts = courtService.getCourtsWithoutFixedTimeSlots();
            logger.info("Found " + courts.size() + " courts with flexible time slots");
            return ResponseEntity.ok(courts);
        } catch (Exception e) {
            logger.severe("Error fetching courts with flexible time slots: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/{id}/time-slots")
    public ResponseEntity<List<TimeSlot>> getTimeSlotsByCourt(@PathVariable Integer id) {
        try {
            logger.info("Fetching time slots for court id: " + id);
            List<TimeSlot> timeSlots = timeSlotService.getAllTimeSlotsByCourt(id);
            logger.info("Found " + timeSlots.size() + " time slots for court " + id);
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            logger.severe("Error fetching time slots for court " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}/available-slots")
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @PathVariable Integer id,
            @RequestParam LocalDate date) {
        try {
            logger.info("Fetching available time slots for court id: " + id + " on date: " + date);
            List<TimeSlot> timeSlots = timeSlotService.getAvailableTimeSlots(id, date);
            logger.info("Found " + timeSlots.size() + " available time slots");
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            logger.severe("Error fetching available time slots for court " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(
            @PathVariable Integer id,
            @Valid @RequestBody Court court) {
        try {
            logger.info("Updating court with id: " + id);
            Court updatedCourt = courtService.updateCourt(id, court);
            logger.info("Updated court: " + updatedCourt.getName());
            return ResponseEntity.ok(updatedCourt);
        } catch (Exception e) {
            logger.severe("Error updating court " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Court> toggleCourtStatus(@PathVariable Integer id) {
        try {
            logger.info("Toggling status for court with id: " + id);
            Court updatedCourt = courtService.toggleCourtStatus(id);
            logger.info("Toggled status for court: " + updatedCourt.getName());
            return ResponseEntity.ok(updatedCourt);
        } catch (Exception e) {
            logger.severe("Error toggling status for court " + id + ": " + e.getMessage());
            throw e;
        }
    }
}
