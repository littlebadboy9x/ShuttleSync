package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.TimeSlotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TimeSlotConfigRepository extends JpaRepository<TimeSlotConfig, Integer> {
    
    @Query("SELECT t FROM TimeSlotConfig t WHERE t.isActive = true")
    Optional<TimeSlotConfig> findActiveConfig();
    
    @Query("SELECT t FROM TimeSlotConfig t WHERE :date BETWEEN t.effectiveFrom AND COALESCE(t.effectiveTo, '9999-12-31') ORDER BY t.effectiveFrom DESC")
    Optional<TimeSlotConfig> findConfigForDate(@Param("date") LocalDate date);
} 