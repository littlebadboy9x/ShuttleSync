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

    @Query("SELECT ts FROM TimeSlot ts WHERE ts.court.id = :courtId AND ts.id NOT IN " +
            "(SELECT b.timeSlot.id FROM Booking b WHERE b.court.id = :courtId AND b.bookingDate = :date AND b.status != 'cancelled')")
    List<TimeSlot> findAvailableTimeSlotsByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);

    @Query("SELECT ts FROM TimeSlot ts WHERE ts.startTime >= :startTime AND ts.endTime <= :endTime")
    List<TimeSlot> findByTimeRange(@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
}