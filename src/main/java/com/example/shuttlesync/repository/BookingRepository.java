package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByUser(User user);

    List<Booking> findByUserAndStatus(User user, String status);

    List<Booking> findByCourtAndBookingDateAndTimeSlot(Court court, LocalDate bookingDate, TimeSlot timeSlot);

    boolean existsByCourtAndBookingDateAndTimeSlotAndStatusNot(Court court, LocalDate bookingDate, TimeSlot timeSlot, String status);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date ORDER BY b.timeSlot.startTime ASC")
    List<Booking> findBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    List<Booking> findBookingsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId AND b.bookingDate = :date")
    List<Booking> findBookingsByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'confirmed'")
    Long countConfirmedBookingsByUser(@Param("userId") Integer userId);
}