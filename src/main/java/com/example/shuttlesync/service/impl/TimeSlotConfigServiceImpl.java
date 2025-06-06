package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.TimeSlotConfig;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.TimeSlotConfigRepository;
import com.example.shuttlesync.service.TimeSlotConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimeSlotConfigServiceImpl implements TimeSlotConfigService {

    private final TimeSlotConfigRepository timeSlotConfigRepository;

    @Override
    public List<TimeSlotConfig> getAllConfigs() {
        return timeSlotConfigRepository.findAll();
    }

    @Override
    public Optional<TimeSlotConfig> getConfigById(Integer id) {
        return timeSlotConfigRepository.findById(id);
    }

    @Override
    public TimeSlotConfig getActiveConfig() {
        LocalDate today = LocalDate.now();
        return timeSlotConfigRepository.findActiveConfigForDate(today)
                .orElseThrow(() -> new RuntimeException("No active time slot configuration found"));
    }

    @Override
    public TimeSlotConfig createConfig(Integer slotDurationMinutes, LocalTime startTimeFirstSlot, LocalTime endTimeLastSlot,
                                     Integer maxSlotsPerDay, LocalDate effectiveFrom, LocalDate effectiveTo, User updatedBy) {
        // Validate input
        validateTimeSlotConfig(slotDurationMinutes, startTimeFirstSlot, endTimeLastSlot, maxSlotsPerDay);
        
        TimeSlotConfig config = new TimeSlotConfig();
        config.setSlotDurationMinutes(slotDurationMinutes);
        config.setStartTimeFirstSlot(startTimeFirstSlot);
        config.setEndTimeLastSlot(endTimeLastSlot);
        config.setMaxSlotsPerDay(maxSlotsPerDay);
        config.setIsActive(true);
        config.setEffectiveFrom(effectiveFrom);
        config.setEffectiveTo(effectiveTo);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(updatedBy);
        
        return timeSlotConfigRepository.save(config);
    }

    @Override
    public TimeSlotConfig updateConfig(Integer id, Integer slotDurationMinutes, LocalTime startTimeFirstSlot, LocalTime endTimeLastSlot,
                                     Integer maxSlotsPerDay, LocalDate effectiveFrom, LocalDate effectiveTo, User updatedBy) {
        // Validate input
        validateTimeSlotConfig(slotDurationMinutes, startTimeFirstSlot, endTimeLastSlot, maxSlotsPerDay);
        
        TimeSlotConfig config = timeSlotConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time slot configuration not found with id: " + id));
        
        config.setSlotDurationMinutes(slotDurationMinutes);
        config.setStartTimeFirstSlot(startTimeFirstSlot);
        config.setEndTimeLastSlot(endTimeLastSlot);
        config.setMaxSlotsPerDay(maxSlotsPerDay);
        config.setEffectiveFrom(effectiveFrom);
        config.setEffectiveTo(effectiveTo);
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(updatedBy);
        
        return timeSlotConfigRepository.save(config);
    }

    @Override
    public void deactivateConfig(Integer id, User updatedBy) {
        TimeSlotConfig config = timeSlotConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time slot configuration not found with id: " + id));
        
        // Đặt isActive = false và ngày kết thúc là ngày hôm nay
        config.setIsActive(false);
        config.setEffectiveTo(LocalDate.now());
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(updatedBy);
        
        timeSlotConfigRepository.save(config);
    }
    
    private void validateTimeSlotConfig(Integer slotDurationMinutes, LocalTime startTimeFirstSlot, LocalTime endTimeLastSlot, Integer maxSlotsPerDay) {
        if (slotDurationMinutes <= 0) {
            throw new IllegalArgumentException("Slot duration must be positive");
        }
        
        if (startTimeFirstSlot.isAfter(endTimeLastSlot)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        if (maxSlotsPerDay <= 0) {
            throw new IllegalArgumentException("Max slots per day must be positive");
        }
        
        // Tính tổng thời gian từ slot đầu tiên đến slot cuối cùng (tính bằng phút)
        int totalMinutes = (endTimeLastSlot.getHour() - startTimeFirstSlot.getHour()) * 60 + 
                           (endTimeLastSlot.getMinute() - startTimeFirstSlot.getMinute());
        
        // Kiểm tra xem tổng thời gian có đủ cho số lượng slot không
        if (totalMinutes < slotDurationMinutes * maxSlotsPerDay) {
            throw new IllegalArgumentException("Time range is not sufficient for the specified number of slots");
        }
    }
} 