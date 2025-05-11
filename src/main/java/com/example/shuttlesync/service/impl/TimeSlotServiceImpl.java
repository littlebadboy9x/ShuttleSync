package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.StatusType;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.repository.CourtRepository;
import com.example.shuttlesync.repository.StatusTypeRepository;
import com.example.shuttlesync.repository.TimeSlotRepository;
import com.example.shuttlesync.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final CourtRepository courtRepository;
    private final StatusTypeRepository statusTypeRepository;

    @Override
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAll();
    }

    @Override
    public TimeSlot getTimeSlotById(Integer id) {
        return timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ với ID: " + id));
    }

    @Override
    public List<TimeSlot> getTimeSlotsByCourt(Integer courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));

        return timeSlotRepository.findByCourtOrderBySlotIndexAsc(court);
    }

    @Override
    public List<TimeSlot> getAvailableTimeSlotsByCourt(Integer courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));

        StatusType trongStatus = statusTypeRepository.findByName("Trống")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        return timeSlotRepository.findByCourtAndStatus(court, trongStatus);
    }

    @Override
    public List<TimeSlot> getAvailableTimeSlotsByCourtAndDate(Integer courtId, LocalDate date) {
        return timeSlotRepository.findAvailableTimeSlotsByCourtAndDate(courtId, date);
    }

    @Override
    public List<TimeSlot> getTimeSlotsByTimeRange(LocalTime startTime, LocalTime endTime) {
        return timeSlotRepository.findByTimeRange(startTime, endTime);
    }

    @Override
    public TimeSlot createTimeSlot(TimeSlot timeSlot) {
        return timeSlotRepository.save(timeSlot);
    }

    @Override
    public TimeSlot updateTimeSlot(Integer id, TimeSlot timeSlotDetails) {
        TimeSlot timeSlot = getTimeSlotById(id);

        timeSlot.setCourt(timeSlotDetails.getCourt());
        timeSlot.setSlotIndex(timeSlotDetails.getSlotIndex());
        timeSlot.setStartTime(timeSlotDetails.getStartTime());
        timeSlot.setEndTime(timeSlotDetails.getEndTime());
        timeSlot.setStatus(timeSlotDetails.getStatus());

        return timeSlotRepository.save(timeSlot);
    }

    @Override
    public void deleteTimeSlot(Integer id) {
        TimeSlot timeSlot = getTimeSlotById(id);
        timeSlotRepository.delete(timeSlot);
    }
}
