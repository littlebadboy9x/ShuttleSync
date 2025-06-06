package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.PriceSetting;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.PriceSettingRepository;
import com.example.shuttlesync.service.HolidayDateService;
import com.example.shuttlesync.service.PriceSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PriceSettingServiceImpl implements PriceSettingService {

    private final PriceSettingRepository priceSettingRepository;
    private final HolidayDateService holidayDateService;

    @Override
    public List<PriceSetting> getAllPriceSettings() {
        return priceSettingRepository.findAll();
    }

    @Override
    public Optional<PriceSetting> getPriceSettingById(Integer id) {
        return priceSettingRepository.findById(id);
    }

    @Override
    public List<PriceSetting> getActivePriceSettings() {
        return priceSettingRepository.findByIsActiveTrue();
    }

    @Override
    public List<PriceSetting> getPriceSettingsByCourt(Integer courtId) {
        return priceSettingRepository.findByCourtId(courtId);
    }

    @Override
    public List<PriceSetting> getPriceSettingsByDayType(PriceSetting.DayType dayType) {
        return priceSettingRepository.findByDayType(dayType);
    }

    @Override
    public BigDecimal getPriceForCourtAndDate(Integer courtId, LocalDate date, Integer timeSlotIndex) {
        // Xác định loại ngày (thường, cuối tuần, lễ)
        PriceSetting.DayType dayType = determineDayType(date);
        
        // Tìm cấu hình giá phù hợp
        Optional<PriceSetting> priceSetting = priceSettingRepository.findByCourtIdAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
                courtId, timeSlotIndex, dayType, date, date,
                courtId, timeSlotIndex, dayType, date);
        
        if (priceSetting.isPresent()) {
            return priceSetting.get().getPrice();
        }
        
        // Nếu không tìm thấy cấu hình cụ thể cho sân và khung giờ, tìm cấu hình chung cho loại ngày
        Optional<PriceSetting> generalPriceSetting = priceSettingRepository.findByCourtIdIsNullAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdIsNullAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
                timeSlotIndex, dayType, date, date,
                timeSlotIndex, dayType, date);
        
        if (generalPriceSetting.isPresent()) {
            return generalPriceSetting.get().getPrice();
        }
        
        // Nếu không tìm thấy cấu hình cho khung giờ cụ thể, tìm cấu hình chung cho tất cả khung giờ
        Optional<PriceSetting> defaultPriceSetting = priceSettingRepository.findByCourtIdIsNullAndTimeSlotIndexIsNullAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdIsNullAndTimeSlotIndexIsNullAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
                dayType, date, date,
                dayType, date);
        
        return defaultPriceSetting.map(PriceSetting::getPrice)
                .orElseThrow(() -> new RuntimeException("No price setting found for the given criteria"));
    }

    @Override
    public PriceSetting createPriceSetting(Integer courtId, Integer timeSlotIndex, PriceSetting.DayType dayType, 
                                         BigDecimal price, LocalDate effectiveFrom, LocalDate effectiveTo, User updatedBy) {
        PriceSetting priceSetting = new PriceSetting();
        priceSetting.setCourtId(courtId);
        priceSetting.setTimeSlotIndex(timeSlotIndex);
        priceSetting.setDayType(dayType);
        priceSetting.setPrice(price);
        priceSetting.setIsActive(true);
        priceSetting.setEffectiveFrom(effectiveFrom);
        priceSetting.setEffectiveTo(effectiveTo);
        priceSetting.setCreatedAt(LocalDateTime.now());
        priceSetting.setUpdatedAt(LocalDateTime.now());
        priceSetting.setUpdatedBy(updatedBy);
        
        return priceSettingRepository.save(priceSetting);
    }

    @Override
    public PriceSetting updatePriceSetting(Integer id, Integer courtId, Integer timeSlotIndex, PriceSetting.DayType dayType, 
                                         BigDecimal price, LocalDate effectiveFrom, LocalDate effectiveTo, User updatedBy) {
        PriceSetting priceSetting = priceSettingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price setting not found with id: " + id));
        
        priceSetting.setCourtId(courtId);
        priceSetting.setTimeSlotIndex(timeSlotIndex);
        priceSetting.setDayType(dayType);
        priceSetting.setPrice(price);
        priceSetting.setEffectiveFrom(effectiveFrom);
        priceSetting.setEffectiveTo(effectiveTo);
        priceSetting.setUpdatedAt(LocalDateTime.now());
        priceSetting.setUpdatedBy(updatedBy);
        
        return priceSettingRepository.save(priceSetting);
    }

    @Override
    public void deactivatePriceSetting(Integer id, User updatedBy) {
        PriceSetting priceSetting = priceSettingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price setting not found with id: " + id));
        
        // Đặt isActive = false và ngày kết thúc là ngày hôm nay
        priceSetting.setIsActive(false);
        priceSetting.setEffectiveTo(LocalDate.now());
        priceSetting.setUpdatedAt(LocalDateTime.now());
        priceSetting.setUpdatedBy(updatedBy);
        
        priceSettingRepository.save(priceSetting);
    }
    
    private PriceSetting.DayType determineDayType(LocalDate date) {
        // Kiểm tra xem có phải ngày lễ không
        if (holidayDateService.isHoliday(date)) {
            return PriceSetting.DayType.holiday;
        }
        
        // Kiểm tra xem có phải cuối tuần không (thứ 7 hoặc chủ nhật)
        int dayOfWeek = date.getDayOfWeek().getValue();
        if (dayOfWeek == 6 || dayOfWeek == 7) {
            return PriceSetting.DayType.weekend;
        }
        
        // Ngày thường
        return PriceSetting.DayType.weekday;
    }
} 