package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.dto.BookingDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface BookingService {
    
    List<Booking> getAllBookings();
    
    Optional<Booking> getBookingById(Integer id);
    
    List<Booking> getBookingsByUserId(Integer userId);
    
    List<Booking> getBookingsByStatus(Byte statusId);
    
    Booking createBooking(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate);
    
    Booking createBooking(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate, Set<Integer> discountIds);
    
    Booking createBookingWithChannel(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate, 
                                   Booking.BookingChannel bookingChannel, Integer counterStaffId);
    
    Booking updateBookingStatus(Integer bookingId, Byte newStatusId, User changedBy);
    
    void cancelBooking(Integer bookingId, User user);
    
    List<Booking> getBookingsByDate(LocalDate date);
    
    List<Booking> getBookingsBetweenDates(LocalDate startDate, LocalDate endDate);
    
    List<Booking> getBookingsByCourtAndDate(Integer courtId, LocalDate date);
    
    Long countConfirmedBookingsByUser(Integer userId);
    
    List<Booking> getActiveBookingsByCourtAndDate(Integer courtId, LocalDate date);
    
    boolean isTimeSlotBooked(Integer courtId, Integer timeSlotId, LocalDate bookingDate);

    List<BookingDTO> getRecentBookings();
    
    Booking saveBooking(Booking booking);
    
    void syncPaymentStatusForAllBookings();
    
    void syncPaymentStatusForBooking(Integer bookingId);
}
