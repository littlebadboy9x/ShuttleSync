package com.example.shuttlesync.service;

import com.example.shuttlesync.model.TimeSlotConfig;
import com.example.shuttlesync.model.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TimeSlotConfigService {
    
    List<TimeSlotConfig> getAllConfigs();
    
    Optional<TimeSlotConfig> getConfigById(Integer id);
    
    TimeSlotConfig getActiveConfig();
    
    TimeSlotConfig createConfig(
            Integer slotDurationMinutes, 
            LocalTime startTimeFirstSlot, 
            LocalTime endTimeLastSlot, 
            Integer maxSlotsPerDay, 
            LocalDate effectiveFrom, 
            LocalDate effectiveTo, 
            User updatedBy);
    
    TimeSlotConfig updateConfig(
            Integer id, 
            Integer slotDurationMinutes, 
            LocalTime startTimeFirstSlot, 
            LocalTime endTimeLastSlot, 
            Integer maxSlotsPerDay, 
            LocalDate effectiveFrom, 
            LocalDate effectiveTo, 
            User updatedBy);
    
    void deactivateConfig(Integer id, User updatedBy);
} 