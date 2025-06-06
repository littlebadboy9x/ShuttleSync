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

    /**
     * Tìm tất cả các khung giờ đã đặt (không ở trạng thái "Trống") cho một ngày cụ thể
     * 
     * @param date Ngày cần tìm khung giờ
     * @return Danh sách các khung giờ đã đặt
     */
    @Query("SELECT ts FROM TimeSlot ts JOIN Booking b ON b.timeSlot.id = ts.id " +
           "WHERE b.bookingDate = :date AND b.status.id != 3 AND ts.status.id != 1")
    List<TimeSlot> findBookedTimeSlotsForDate(@Param("date") LocalDate date);
    
    /**
     * Tìm tất cả các khung giờ đã hết hạn (thời gian kết thúc nhỏ hơn thời gian hiện tại)
     * và không ở trạng thái "Trống" (id != 1)
     * 
     * @param date Ngày cần tìm khung giờ
     * @param currentTime Thời gian hiện tại để so sánh
     * @return Danh sách các khung giờ đã hết hạn
     */
    @Query("SELECT ts FROM TimeSlot ts JOIN Booking b ON b.timeSlot.id = ts.id " +
           "WHERE b.bookingDate = :date AND ts.endTime <= :currentTime " +
           "AND b.status.id != 3 AND ts.status.id != 1")
    List<TimeSlot> findExpiredTimeSlots(@Param("date") LocalDate date, @Param("currentTime") LocalTime currentTime);
    
    /**
     * Tìm tất cả các khung giờ đã hết hạn (thời gian kết thúc nhỏ hơn thời gian hiện tại)
     * và không ở trạng thái "Trống" (id != 1), không cần quan tâm đến booking
     * 
     * @param currentTime Thời gian hiện tại để so sánh
     * @return Danh sách các khung giờ đã hết hạn
     */
    @Query(value = "SELECT * FROM TimeSlots ts WHERE CAST(ts.EndTime AS time) <= CAST(:currentTime AS time) AND ts.Status = 2", nativeQuery = true)
    List<TimeSlot> findDirectExpiredTimeSlots(@Param("currentTime") LocalTime currentTime);
    
    /**
     * Tìm tất cả các khung giờ đã hết hạn (thời gian kết thúc nhỏ hơn thời gian hiện tại)
     * cho ngày hiện tại, dựa trên các booking đang hoạt động
     * 
     * @param bookingDate Ngày booking
     * @param currentTime Thời gian hiện tại để so sánh
     * @return Danh sách các khung giờ đã hết hạn
     */
    @Query(value = "SELECT ts.* FROM TimeSlots ts " +
                  "INNER JOIN Bookings b ON b.TimeSlotId = ts.id " +
                  "WHERE b.BookingDate = :bookingDate " +
                  "AND CAST(ts.EndTime AS time) <= CAST(:currentTime AS time) " +
                  "AND ts.Status != 1", nativeQuery = true)
    List<TimeSlot> findExpiredTimeSlotsForBookings(@Param("bookingDate") LocalDate bookingDate, @Param("currentTime") LocalTime currentTime);
}