package com.example.shuttlesync.service;

import com.example.shuttlesync.model.PriceSetting;
import com.example.shuttlesync.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PriceSettingService {
    
    List<PriceSetting> getAllPriceSettings();
    
    Optional<PriceSetting> getPriceSettingById(Integer id);
    
    List<PriceSetting> getActivePriceSettings();
    
    List<PriceSetting> getPriceSettingsByCourt(Integer courtId);
    
    List<PriceSetting> getPriceSettingsByDayType(PriceSetting.DayType dayType);
    
    BigDecimal getPriceForCourtAndDate(Integer courtId, LocalDate date, Integer timeSlotIndex);
    
    PriceSetting createPriceSetting(
            Integer courtId, 
            Integer timeSlotIndex, 
            PriceSetting.DayType dayType, 
            BigDecimal price, 
            LocalDate effectiveFrom, 
            LocalDate effectiveTo, 
            User updatedBy);
    
    PriceSetting updatePriceSetting(
            Integer id, 
            Integer courtId, 
            Integer timeSlotIndex, 
            PriceSetting.DayType dayType, 
            BigDecimal price, 
            LocalDate effectiveFrom, 
            LocalDate effectiveTo, 
            User updatedBy);
    
    void deactivatePriceSetting(Integer id, User updatedBy);
} 