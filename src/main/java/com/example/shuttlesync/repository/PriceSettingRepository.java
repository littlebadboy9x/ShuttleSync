package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.PriceSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceSettingRepository extends JpaRepository<PriceSetting, Integer> {
    
    List<PriceSetting> findByIsActiveTrue();
    
    @Query("SELECT p FROM PriceSetting p WHERE p.isActive = true AND p.dayType = :dayType AND p.court IS NULL AND p.timeSlotIndex IS NULL")
    Optional<PriceSetting> findDefaultPrice(@Param("dayType") String dayType);
    
    @Query("""
           SELECT p FROM PriceSetting p WHERE p.isActive = true 
           AND p.dayType = :dayType
           AND (p.court.id = :courtId OR p.court IS NULL)
           AND (p.timeSlotIndex = :timeSlotIndex OR p.timeSlotIndex IS NULL)
           AND :date BETWEEN p.effectiveFrom AND COALESCE(p.effectiveTo, '9999-12-31')
           ORDER BY 
               CASE WHEN p.court IS NOT NULL THEN 1 ELSE 0 END DESC,
               CASE WHEN p.timeSlotIndex IS NOT NULL THEN 1 ELSE 0 END DESC,
               p.effectiveFrom DESC
           """)
    List<PriceSetting> findApplicablePrices(
            @Param("courtId") Integer courtId,
            @Param("timeSlotIndex") Integer timeSlotIndex,
            @Param("dayType") String dayType,
            @Param("date") LocalDate date);
    
    @Query(value = """
           SELECT TOP 1 p.Price FROM PriceSettings p WHERE p.IsActive = 1
           AND p.DayType = :dayType
           AND (p.CourtId = :courtId OR p.CourtId IS NULL)
           AND (p.TimeSlotIndex = :timeSlotIndex OR p.TimeSlotIndex IS NULL)
           AND :date BETWEEN p.EffectiveFrom AND ISNULL(p.EffectiveTo, '9999-12-31')
           ORDER BY 
               CASE WHEN p.CourtId IS NOT NULL THEN 1 ELSE 0 END DESC,
               CASE WHEN p.TimeSlotIndex IS NOT NULL THEN 1 ELSE 0 END DESC,
               p.EffectiveFrom DESC
           """, nativeQuery = true)
    Optional<BigDecimal> findMostSpecificPrice(
            @Param("courtId") Integer courtId,
            @Param("timeSlotIndex") Integer timeSlotIndex,
            @Param("dayType") String dayType,
            @Param("date") LocalDate date);
} 