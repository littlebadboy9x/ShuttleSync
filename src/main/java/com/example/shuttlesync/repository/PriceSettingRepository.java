package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.PriceSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceSettingRepository extends JpaRepository<PriceSetting, Integer> {
    
    List<PriceSetting> findByIsActiveTrue();
    
    List<PriceSetting> findByCourtId(Integer courtId);
    
    List<PriceSetting> findByDayType(PriceSetting.DayType dayType);
    
    @Query("SELECT p FROM PriceSetting p WHERE " +
           "(p.effectiveFrom <= :today AND p.effectiveTo >= :today) OR " +
           "(p.effectiveFrom <= :today AND p.effectiveTo IS NULL)")
    List<PriceSetting> findByEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrEffectiveFromLessThanEqualAndEffectiveToIsNull(
            @Param("today") LocalDate today, 
            @Param("today") LocalDate today2, 
            @Param("today") LocalDate today3);
    
    @Query("SELECT p FROM PriceSetting p WHERE " +
           "p.courtId = :courtId AND p.timeSlotIndex = :timeSlotIndex AND p.dayType = :dayType AND " +
           "((p.effectiveFrom <= :date AND p.effectiveTo >= :date) OR " +
           "(p.effectiveFrom <= :date AND p.effectiveTo IS NULL))")
    Optional<PriceSetting> findByCourtIdAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
            @Param("courtId") Integer courtId, 
            @Param("timeSlotIndex") Integer timeSlotIndex, 
            @Param("dayType") PriceSetting.DayType dayType, 
            @Param("date") LocalDate date, 
            @Param("date") LocalDate date2,
            @Param("courtId") Integer courtId2, 
            @Param("timeSlotIndex") Integer timeSlotIndex2, 
            @Param("dayType") PriceSetting.DayType dayType2, 
            @Param("date") LocalDate date3);
    
    @Query("SELECT p FROM PriceSetting p WHERE " +
           "p.courtId IS NULL AND p.timeSlotIndex = :timeSlotIndex AND p.dayType = :dayType AND " +
           "((p.effectiveFrom <= :date AND p.effectiveTo >= :date) OR " +
           "(p.effectiveFrom <= :date AND p.effectiveTo IS NULL))")
    Optional<PriceSetting> findByCourtIdIsNullAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdIsNullAndTimeSlotIndexAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
            @Param("timeSlotIndex") Integer timeSlotIndex, 
            @Param("dayType") PriceSetting.DayType dayType, 
            @Param("date") LocalDate date, 
            @Param("date") LocalDate date2,
            @Param("timeSlotIndex") Integer timeSlotIndex2, 
            @Param("dayType") PriceSetting.DayType dayType2, 
            @Param("date") LocalDate date3);
    
    @Query("SELECT p FROM PriceSetting p WHERE " +
           "p.courtId IS NULL AND p.timeSlotIndex IS NULL AND p.dayType = :dayType AND " +
           "((p.effectiveFrom <= :date AND p.effectiveTo >= :date) OR " +
           "(p.effectiveFrom <= :date AND p.effectiveTo IS NULL))")
    Optional<PriceSetting> findByCourtIdIsNullAndTimeSlotIndexIsNullAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrCourtIdIsNullAndTimeSlotIndexIsNullAndDayTypeAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
            @Param("dayType") PriceSetting.DayType dayType, 
            @Param("date") LocalDate date, 
            @Param("date") LocalDate date2,
            @Param("dayType") PriceSetting.DayType dayType2, 
            @Param("date") LocalDate date3);
} 