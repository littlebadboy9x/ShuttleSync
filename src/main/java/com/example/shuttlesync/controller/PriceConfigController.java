package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.HolidayDate;
import com.example.shuttlesync.model.PriceSetting;
import com.example.shuttlesync.model.TimeSlotConfig;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.HolidayDateService;
import com.example.shuttlesync.service.PriceSettingService;
import com.example.shuttlesync.service.TimeSlotConfigService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/admin/price-config")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class PriceConfigController {

    private final PriceSettingService priceSettingService;
    private final TimeSlotConfigService timeSlotConfigService;
    private final HolidayDateService holidayDateService;
    private final UserService userService;

    // Quản lý cấu hình khung giờ
    @GetMapping("/timeslot-configs")
    public ResponseEntity<List<TimeSlotConfig>> getAllTimeSlotConfigs() {
        log.info("Fetching all time slot configurations");
        return ResponseEntity.ok(timeSlotConfigService.getAllConfigs());
    }

    @GetMapping("/timeslot-configs/{id}")
    public ResponseEntity<TimeSlotConfig> getTimeSlotConfigById(@PathVariable Integer id) {
        log.info("Fetching time slot configuration with id: {}", id);
        return timeSlotConfigService.getConfigById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/timeslot-configs/active")
    public ResponseEntity<TimeSlotConfig> getActiveTimeSlotConfig() {
        log.info("Fetching active time slot configuration");
        try {
            TimeSlotConfig activeConfig = timeSlotConfigService.getActiveConfig();
            return ResponseEntity.ok(activeConfig);
        } catch (Exception e) {
            log.error("Error fetching active time slot configuration", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/timeslot-configs")
    public ResponseEntity<TimeSlotConfig> createTimeSlotConfig(
            @RequestParam Integer slotDurationMinutes,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTimeFirstSlot,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTimeLastSlot,
            @RequestParam Integer maxSlotsPerDay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveTo) {
        log.info("Creating new time slot configuration");
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            TimeSlotConfig newConfig = timeSlotConfigService.createConfig(
                    slotDurationMinutes, startTimeFirstSlot, endTimeLastSlot, maxSlotsPerDay,
                    effectiveFrom, effectiveTo, currentUser);
            return ResponseEntity.ok(newConfig);
        } catch (Exception e) {
            log.error("Error creating time slot configuration", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/timeslot-configs/{id}")
    public ResponseEntity<TimeSlotConfig> updateTimeSlotConfig(
            @PathVariable Integer id,
            @RequestParam Integer slotDurationMinutes,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTimeFirstSlot,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTimeLastSlot,
            @RequestParam Integer maxSlotsPerDay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveTo) {
        log.info("Updating time slot configuration with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            TimeSlotConfig updatedConfig = timeSlotConfigService.updateConfig(
                    id, slotDurationMinutes, startTimeFirstSlot, endTimeLastSlot, maxSlotsPerDay,
                    effectiveFrom, effectiveTo, currentUser);
            return ResponseEntity.ok(updatedConfig);
        } catch (Exception e) {
            log.error("Error updating time slot configuration with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/timeslot-configs/{id}/deactivate")
    public ResponseEntity<Void> deactivateTimeSlotConfig(@PathVariable Integer id) {
        log.info("Deactivating time slot configuration with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            timeSlotConfigService.deactivateConfig(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deactivating time slot configuration with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Quản lý cấu hình giá
    @GetMapping("/price-settings")
    public ResponseEntity<List<PriceSetting>> getAllPriceSettings() {
        log.info("Fetching all price settings");
        return ResponseEntity.ok(priceSettingService.getAllPriceSettings());
    }

    @GetMapping("/price-settings/{id}")
    public ResponseEntity<PriceSetting> getPriceSettingById(@PathVariable Integer id) {
        log.info("Fetching price setting with id: {}", id);
        return priceSettingService.getPriceSettingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/price-settings/active")
    public ResponseEntity<List<PriceSetting>> getActivePriceSettings() {
        log.info("Fetching active price settings");
        return ResponseEntity.ok(priceSettingService.getActivePriceSettings());
    }

    @PostMapping("/price-settings")
    public ResponseEntity<PriceSetting> createPriceSetting(
            @RequestParam(required = false) Integer courtId,
            @RequestParam(required = false) Integer timeSlotIndex,
            @RequestParam PriceSetting.DayType dayType,
            @RequestParam BigDecimal price,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveTo) {
        log.info("Creating new price setting");
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            PriceSetting newPriceSetting = priceSettingService.createPriceSetting(
                    courtId, timeSlotIndex, dayType, price, effectiveFrom, effectiveTo, currentUser);
            return ResponseEntity.ok(newPriceSetting);
        } catch (Exception e) {
            log.error("Error creating price setting", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/price-settings/{id}")
    public ResponseEntity<PriceSetting> updatePriceSetting(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer courtId,
            @RequestParam(required = false) Integer timeSlotIndex,
            @RequestParam PriceSetting.DayType dayType,
            @RequestParam BigDecimal price,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveTo) {
        log.info("Updating price setting with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            PriceSetting updatedPriceSetting = priceSettingService.updatePriceSetting(
                    id, courtId, timeSlotIndex, dayType, price, effectiveFrom, effectiveTo, currentUser);
            return ResponseEntity.ok(updatedPriceSetting);
        } catch (Exception e) {
            log.error("Error updating price setting with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/price-settings/{id}/deactivate")
    public ResponseEntity<Void> deactivatePriceSetting(@PathVariable Integer id) {
        log.info("Deactivating price setting with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            priceSettingService.deactivatePriceSetting(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deactivating price setting with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/price-settings/court/{courtId}")
    public ResponseEntity<List<PriceSetting>> getPriceSettingsByCourt(@PathVariable Integer courtId) {
        log.info("Fetching price settings for court id: {}", courtId);
        return ResponseEntity.ok(priceSettingService.getPriceSettingsByCourt(courtId));
    }

    @GetMapping("/price-settings/day-type/{dayType}")
    public ResponseEntity<List<PriceSetting>> getPriceSettingsByDayType(@PathVariable PriceSetting.DayType dayType) {
        log.info("Fetching price settings for day type: {}", dayType);
        return ResponseEntity.ok(priceSettingService.getPriceSettingsByDayType(dayType));
    }

    @GetMapping("/price-settings/price")
    public ResponseEntity<Map<String, Object>> getPriceForCourtAndDate(
            @RequestParam Integer courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Integer timeSlotIndex) {
        log.info("Fetching price for court id: {}, date: {}, time slot index: {}", courtId, date, timeSlotIndex);
        try {
            BigDecimal price = priceSettingService.getPriceForCourtAndDate(courtId, date, timeSlotIndex);
            Map<String, Object> response = new HashMap<>();
            response.put("courtId", courtId);
            response.put("date", date.toString());
            response.put("timeSlotIndex", timeSlotIndex);
            response.put("price", price);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching price for court id: {}, date: {}, time slot index: {}", courtId, date, timeSlotIndex, e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Quản lý ngày lễ
    @GetMapping("/holidays")
    public ResponseEntity<List<HolidayDate>> getAllHolidays() {
        log.info("Fetching all holidays");
        return ResponseEntity.ok(holidayDateService.getAllHolidays());
    }

    @GetMapping("/holidays/{id}")
    public ResponseEntity<HolidayDate> getHolidayById(@PathVariable Integer id) {
        log.info("Fetching holiday with id: {}", id);
        return holidayDateService.getHolidayById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/holidays/date/{date}")
    public ResponseEntity<HolidayDate> getHolidayByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching holiday for date: {}", date);
        return holidayDateService.getHolidayByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/holidays")
    public ResponseEntity<HolidayDate> createHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String holidayName,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "false") Boolean isRecurringYearly) {
        log.info("Creating new holiday: {} on date: {}", holidayName, date);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            HolidayDate newHoliday = holidayDateService.createHoliday(
                    date, holidayName, description, isRecurringYearly, currentUser);
            return ResponseEntity.ok(newHoliday);
        } catch (Exception e) {
            log.error("Error creating holiday: {} on date: {}", holidayName, date, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<HolidayDate> updateHoliday(
            @PathVariable Integer id,
            @RequestParam String holidayName,
            @RequestParam(required = false) String description,
            @RequestParam Boolean isRecurringYearly) {
        log.info("Updating holiday with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            HolidayDate updatedHoliday = holidayDateService.updateHoliday(
                    id, holidayName, description, isRecurringYearly, currentUser);
            return ResponseEntity.ok(updatedHoliday);
        } catch (Exception e) {
            log.error("Error updating holiday with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Integer id) {
        log.info("Deleting holiday with id: {}", id);
        try {
            holidayDateService.deleteHoliday(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting holiday with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/holidays/year/{year}")
    public ResponseEntity<List<HolidayDate>> getHolidaysByYear(@PathVariable Integer year) {
        log.info("Fetching holidays for year: {}", year);
        return ResponseEntity.ok(holidayDateService.getHolidaysByYear(year));
    }

    @GetMapping("/holidays/recurring")
    public ResponseEntity<List<HolidayDate>> getRecurringHolidays() {
        log.info("Fetching recurring holidays");
        return ResponseEntity.ok(holidayDateService.getRecurringHolidays());
    }

    @GetMapping("/holidays/check")
    public ResponseEntity<Map<String, Object>> checkIsHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Checking if date is a holiday: {}", date);
        boolean isHoliday = holidayDateService.isHoliday(date);
        Map<String, Object> response = new HashMap<>();
        response.put("date", date.toString());
        response.put("isHoliday", isHoliday);
        return ResponseEntity.ok(response);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
} 