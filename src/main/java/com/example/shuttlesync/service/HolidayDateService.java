package com.example.shuttlesync.service;

import com.example.shuttlesync.model.HolidayDate;
import com.example.shuttlesync.model.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayDateService {
    
    List<HolidayDate> getAllHolidays();
    
    Optional<HolidayDate> getHolidayById(Integer id);
    
    Optional<HolidayDate> getHolidayByDate(LocalDate date);
    
    HolidayDate createHoliday(LocalDate date, String holidayName, String description, Boolean isRecurringYearly, User updatedBy);
    
    HolidayDate updateHoliday(Integer id, String holidayName, String description, Boolean isRecurringYearly, User updatedBy);
    
    void deleteHoliday(Integer id);
    
    List<HolidayDate> getHolidaysByYear(Integer year);
    
    List<HolidayDate> getRecurringHolidays();
    
    boolean isHoliday(LocalDate date);
} 