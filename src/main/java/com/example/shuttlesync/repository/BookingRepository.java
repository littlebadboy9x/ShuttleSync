package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.BookingStatusType;
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

    List<Booking> findByUserAndStatus(User user, BookingStatusType status);

    List<Booking> findByCourtAndBookingDateAndTimeSlot(Court court, LocalDate bookingDate, TimeSlot timeSlot);

    boolean existsByCourtAndBookingDateAndTimeSlotAndStatusNot(Court court, LocalDate bookingDate, TimeSlot timeSlot, BookingStatusType status);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date ORDER BY b.timeSlot.startTime ASC")
    List<Booking> findBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    List<Booking> findBookingsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId AND b.bookingDate = :date")
    List<Booking> findBookingsByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status.id = 2")
    Long countConfirmedBookingsByUser(@Param("userId") Integer userId);

    List<Booking> findByUserId(Integer userId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.court.id = :courtId
        AND b.bookingDate = :date
        AND b.status.id IN (1, 2)
    """)
    List<Booking> findActiveBookingsByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
        FROM Booking b
        WHERE b.court = :court
        AND b.timeSlot = :timeSlot
        AND b.bookingDate = :bookingDate
        AND b.status.id IN (1, 2)
    """)
    boolean isTimeSlotBooked(
            @Param("court") Court court, 
            @Param("timeSlot") TimeSlot timeSlot, 
            @Param("bookingDate") LocalDate bookingDate);

    @Query("SELECT b FROM Booking b WHERE b.status.id = :statusId")
    List<Booking> findByStatusId(@Param("statusId") Byte statusId);
}