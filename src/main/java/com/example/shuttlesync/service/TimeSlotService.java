package com.example.shuttlesync.service;

import com.example.shuttlesync.model.TimeSlot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TimeSlotService {

    List<TimeSlot> getAllTimeSlots();

    TimeSlot getTimeSlotById(Integer id);

    List<TimeSlot> getTimeSlotsByCourt(Integer courtId);

    List<TimeSlot> getAvailableTimeSlotsByCourt(Integer courtId);

    List<TimeSlot> getAvailableTimeSlotsByCourtAndDate(Integer courtId, LocalDate date);

    List<TimeSlot> getTimeSlotsByTimeRange(LocalTime startTime, LocalTime endTime);

    TimeSlot createTimeSlot(TimeSlot timeSlot);

    TimeSlot updateTimeSlot(Integer id, TimeSlot timeSlot);

    void deleteTimeSlot(Integer id);
}