package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.HolidayDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayDateRepository extends JpaRepository<HolidayDate, Integer> {
    
    @Query(value = "SELECT h.* FROM HolidayDates h WHERE h.HolidayDate = :date", nativeQuery = true)
    Optional<HolidayDate> findByDate(@Param("date") LocalDate date);
    
    @Query(value = "SELECT h.* FROM HolidayDates h WHERE " +
           "YEAR(h.HolidayDate) = :year OR " +
           "(h.IsRecurringYearly = 1 AND MONTH(h.HolidayDate) = MONTH(DATEADD(YEAR, :year - YEAR(h.HolidayDate), h.HolidayDate)) " +
           "AND DAY(h.HolidayDate) = DAY(DATEADD(YEAR, :year - YEAR(h.HolidayDate), h.HolidayDate)))", 
           nativeQuery = true)
    List<HolidayDate> findByYear(@Param("year") Integer year);
    
    @Query(value = "SELECT h.* FROM HolidayDates h WHERE h.IsRecurringYearly = 1", nativeQuery = true)
    List<HolidayDate> findByIsRecurringYearlyTrue();
    
    @Query(value = "SELECT CASE WHEN COUNT(h) > 0 THEN 1 ELSE 0 END FROM HolidayDates h WHERE " +
           "h.HolidayDate = :date OR " +
           "(h.IsRecurringYearly = 1 AND MONTH(h.HolidayDate) = MONTH(:date) " +
           "AND DAY(h.HolidayDate) = DAY(:date))", 
           nativeQuery = true)
    boolean isHoliday(@Param("date") LocalDate date);
} 