package com.example.shuttlesync.service;
import com.example.shuttlesync.dto.BookingDto;
import com.example.shuttlesync.model.Booking;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    List<Booking> getAllBookings();

    Booking getBookingById(Integer id);

    List<Booking> getBookingsByUser(Integer userId);

    List<Booking> getBookingsByUserAndStatus(Integer userId, String status);

    List<Booking> getBookingsByDate(LocalDate date);

    List<Booking> getBookingsBetweenDates(LocalDate startDate, LocalDate endDate);

    List<Booking> getBookingsByCourtAndDate(Integer courtId, LocalDate date);

    Booking createBooking(BookingDto bookingDto);

    Booking updateBookingStatus(Integer id, String status);

    void deleteBooking(Integer id);

    Long countConfirmedBookingsByUser(Integer userId);
}