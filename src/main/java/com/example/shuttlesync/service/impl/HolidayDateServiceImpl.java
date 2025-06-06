package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.HolidayDate;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.HolidayDateRepository;
import com.example.shuttlesync.service.HolidayDateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HolidayDateServiceImpl implements HolidayDateService {

    private final HolidayDateRepository holidayDateRepository;

    @Override
    public List<HolidayDate> getAllHolidays() {
        return holidayDateRepository.findAll();
    }

    @Override
    public Optional<HolidayDate> getHolidayById(Integer id) {
        return holidayDateRepository.findById(id);
    }

    @Override
    public Optional<HolidayDate> getHolidayByDate(LocalDate date) {
        return holidayDateRepository.findByDate(date);
    }

    @Override
    public HolidayDate createHoliday(LocalDate date, String holidayName, String description, Boolean isRecurringYearly, User updatedBy) {
        HolidayDate holidayDate = new HolidayDate();
        holidayDate.setDate(date);
        holidayDate.setHolidayName(holidayName);
        holidayDate.setDescription(description);
        holidayDate.setIsRecurringYearly(isRecurringYearly);
        holidayDate.setCreatedBy(updatedBy);
        
        return holidayDateRepository.save(holidayDate);
    }

    @Override
    public HolidayDate updateHoliday(Integer id, String holidayName, String description, Boolean isRecurringYearly, User updatedBy) {
        HolidayDate holidayDate = holidayDateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Holiday not found with id: " + id));
        
        holidayDate.setHolidayName(holidayName);
        holidayDate.setDescription(description);
        holidayDate.setIsRecurringYearly(isRecurringYearly);
        // Không cập nhật createdBy vì đây là trường không thay đổi
        
        return holidayDateRepository.save(holidayDate);
    }

    @Override
    public void deleteHoliday(Integer id) {
        holidayDateRepository.deleteById(id);
    }

    @Override
    public List<HolidayDate> getHolidaysByYear(Integer year) {
        return holidayDateRepository.findByYear(year);
    }

    @Override
    public List<HolidayDate> getRecurringHolidays() {
        return holidayDateRepository.findByIsRecurringYearlyTrue();
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        return holidayDateRepository.isHoliday(date);
    }
} 