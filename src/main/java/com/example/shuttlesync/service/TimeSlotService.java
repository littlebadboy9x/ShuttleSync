package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.TimeSlotConfig;
import com.example.shuttlesync.model.User;

import java.time.LocalDate;
import java.util.List;

public interface TimeSlotService {
    
    List<TimeSlot> getAllTimeSlotsByCourt(Integer courtId);
    
    List<TimeSlot> getAvailableTimeSlots(Integer courtId, LocalDate date);
    
    void generateTimeSlots(TimeSlotConfig config, User admin);
    
    void updateSlotPrice(Integer courtId, Integer slotIndex, LocalDate date);
    
    boolean isTimeSlotAvailable(Court court, TimeSlot timeSlot, LocalDate bookingDate);
    
    String getDayType(LocalDate date);
}