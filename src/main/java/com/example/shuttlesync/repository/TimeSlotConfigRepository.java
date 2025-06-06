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
    
    @Query("SELECT t FROM TimeSlotConfig t WHERE " +
           "(t.effectiveFrom <= :date AND t.effectiveTo >= :date) OR " +
           "(t.effectiveFrom <= :date AND t.effectiveTo IS NULL) " +
           "ORDER BY t.effectiveFrom DESC")
    Optional<TimeSlotConfig> findActiveConfigForDate(@Param("date") LocalDate date);
} 