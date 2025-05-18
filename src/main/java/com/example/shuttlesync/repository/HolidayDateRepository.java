package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.HolidayDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayDateRepository extends JpaRepository<HolidayDate, Integer> {
    
    @Query("""
        SELECT h FROM HolidayDate h 
        WHERE h.holidayDate = :date 
        OR (h.isRecurringYearly = true AND MONTH(h.holidayDate) = MONTH(:date) AND DAY(h.holidayDate) = DAY(:date))
    """)
    List<HolidayDate> findHolidaysForDate(@Param("date") LocalDate date);
    
    @Query("""
        SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
        FROM HolidayDate h 
        WHERE h.holidayDate = :date 
        OR (h.isRecurringYearly = true AND MONTH(h.holidayDate) = MONTH(:date) AND DAY(h.holidayDate) = DAY(:date))
    """)
    boolean isHoliday(@Param("date") LocalDate date);
} 