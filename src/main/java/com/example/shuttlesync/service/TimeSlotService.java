package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.TimeSlotConfig;
import com.example.shuttlesync.model.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TimeSlotService {
    
    List<TimeSlot> getAllTimeSlotsByCourt(Integer courtId);
    
    List<TimeSlot> getAvailableTimeSlots(Integer courtId, LocalDate date);
    
    void generateTimeSlots(TimeSlotConfig config, User admin);
    
    void updateSlotPrice(Integer courtId, Integer slotIndex, LocalDate date);
    
    boolean isTimeSlotAvailable(Court court, TimeSlot timeSlot, LocalDate bookingDate);
    
    String getDayType(LocalDate date);
    
    /**
     * Reset trạng thái của tất cả khung giờ trong ngày đã qua về "Trống"
     * 
     * @param date Ngày cần reset khung giờ
     * @return Số lượng khung giờ đã được cập nhật
     */
    int resetPastTimeSlots(LocalDate date);
    
    /**
     * Reset trạng thái của các khung giờ đã hết hạn (đã qua) trong ngày hiện tại về "Trống"
     * 
     * @param date Ngày cần kiểm tra
     * @param currentTime Thời gian hiện tại để so sánh
     * @return Số lượng khung giờ đã được cập nhật
     */
    int resetExpiredTimeSlots(LocalDate date, LocalTime currentTime);
}