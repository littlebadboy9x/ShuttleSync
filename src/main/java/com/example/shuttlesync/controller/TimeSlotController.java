package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.TimeSlotRequest;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.StatusTypeRepository;
import com.example.shuttlesync.service.CourtService;
import com.example.shuttlesync.service.TimeSlotService;
import com.example.shuttlesync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/time-slots")
@CrossOrigin(origins = "http://localhost:3000")
public class TimeSlotController {

    @Autowired
    TimeSlotService timeSlotService;

    @Autowired
    UserService userService;

    @Autowired
    CourtService courtService;

    @Autowired
    StatusTypeRepository statusTypeRepository;

    //Lấy tất cả các khung giờ
    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<TimeSlot>> getAllTimeSlotsByCourt(@PathVariable Integer courtId) {
        try {
            List<TimeSlot> timeSlots = timeSlotService.getAllTimeSlotsByCourt(courtId);
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    //danh sách slot còn trống theo ngày
    @GetMapping("/available")
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @RequestParam Integer courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TimeSlot> availableSlots = timeSlotService.getAvailableTimeSlots(courtId, date);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    //Cập nhật giá cho 1 slot theo ngày
    @PutMapping("/price/{courtId}/{slotIndex}")
    public ResponseEntity<?> updateSlotPrice(
            @PathVariable Integer courtId,
            @PathVariable Integer slotIndex,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            timeSlotService.updateSlotPrice(courtId, slotIndex, date);
            return ResponseEntity.ok().body("Price updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    //Xác định loại ngày
    @GetMapping("/day-type")
    public ResponseEntity<String> getDayType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            String dayType = timeSlotService.getDayType(date);
            return ResponseEntity.ok(dayType);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateTimeSlots(
            @RequestBody TimeSlotConfig config,
            @RequestParam Integer adminId) {
        try {
            User admin = userService.getUserById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found with ID: " + adminId));;
            timeSlotService.generateTimeSlots(config, admin);
            return ResponseEntity.status(HttpStatus.CREATED).body("Time slots generated successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

//    @PostMapping("/check-availability")
//    public ResponseEntity<Boolean> checkAvailability(
//            @RequestBody TimeSlotRequest request,
//            @RequestParam Integer courtId,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//
//        Court court = courtService.getCourtById(courtId);
//        if (court == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false);
//        }
//
//        StatusType emptyStatus = statusTypeRepository.findByName("Trống")
//                .orElseThrow(() -> new RuntimeException("StatusType 'Trống' not found"));
//
//        TimeSlot timeSlot = new TimeSlot();
//        timeSlot.setSlotIndex(request.getSlotIndex());
//        timeSlot.setStartTime(request.getStartTime());
//        timeSlot.setEndTime(request.getEndTime());
//        timeSlot.setCourt(court);
//        timeSlot.setStatus(emptyStatus);
//
//        boolean isAvailable = timeSlotService.isTimeSlotAvailable(court, timeSlot, date);
//        return ResponseEntity.ok(isAvailable);
//    }



}