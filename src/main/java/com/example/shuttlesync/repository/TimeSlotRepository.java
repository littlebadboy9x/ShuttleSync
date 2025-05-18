package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.StatusType;
import com.example.shuttlesync.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {

    List<TimeSlot> findByCourtAndStatus(Court court, StatusType status);

    List<TimeSlot> findByCourt(Court court);

    List<TimeSlot> findByCourtOrderBySlotIndexAsc(Court court);

    List<TimeSlot> findByCourtId(Integer courtId);

    @Query("SELECT t FROM TimeSlot t WHERE t.court = :court AND t.slotIndex = :slotIndex")
    List<TimeSlot> findByCourtAndSlotIndex(@Param("court") Court court, @Param("slotIndex") Integer slotIndex);

    @Query("""
        SELECT t FROM TimeSlot t 
        WHERE t.court.id = :courtId 
        AND t.id NOT IN (
            SELECT b.timeSlot.id FROM Booking b 
            WHERE b.court.id = :courtId 
            AND b.bookingDate = :bookingDate
            AND b.status.id IN (1, 2) 
        )
    """)
    List<TimeSlot> findAvailableTimeSlotsByCourtAndDate(
            @Param("courtId") Integer courtId, 
            @Param("bookingDate") LocalDate bookingDate);

    @Query("SELECT ts FROM TimeSlot ts WHERE ts.startTime >= :startTime AND ts.endTime <= :endTime")
    List<TimeSlot> findByTimeRange(@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
}