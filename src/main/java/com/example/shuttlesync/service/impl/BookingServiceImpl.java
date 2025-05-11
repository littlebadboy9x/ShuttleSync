package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.BookingDto;
import com.example.shuttlesync.exeption.BadRequestException;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.TimeSlot;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.CourtRepository;
import com.example.shuttlesync.repository.TimeSlotRepository;
import com.example.shuttlesync.repository.UserRepository;
import com.example.shuttlesync.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(Integer id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + id));
    }

    @Override
    public List<Booking> getBookingsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        return bookingRepository.findByUser(user);
    }

    @Override
    public List<Booking> getBookingsByUserAndStatus(Integer userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        return bookingRepository.findByUserAndStatus(user, status);
    }

    @Override
    public List<Booking> getBookingsByDate(LocalDate date) {
        return bookingRepository.findBookingsByDate(date);
    }

    @Override
    public List<Booking> getBookingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findBookingsBetweenDates(startDate, endDate);
    }

    @Override
    public List<Booking> getBookingsByCourtAndDate(Integer courtId, LocalDate date) {
        return bookingRepository.findBookingsByCourtAndDate(courtId, date);
    }

    @Override
    @Transactional
    public Booking createBooking(BookingDto bookingDto) {
        User user = userRepository.findById(bookingDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + bookingDto.getUserId()));

        Court court = courtRepository.findById(bookingDto.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + bookingDto.getCourtId()));

        TimeSlot timeSlot = timeSlotRepository.findById(bookingDto.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ với ID: " + bookingDto.getTimeSlotId()));

        // Kiểm tra xem khung giờ đã được đặt chưa
        boolean isBooked = bookingRepository.existsByCourtAndBookingDateAndTimeSlotAndStatusNot(
                court, bookingDto.getBookingDate(), timeSlot, "cancelled");

        if (isBooked) {
            throw new BadRequestException("Khung giờ này đã được đặt");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setBookingDate(bookingDto.getBookingDate());
        booking.setTimeSlot(timeSlot);
        booking.setStatus("pending");

        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking updateBookingStatus(Integer id, String status) {
        Booking booking = getBookingById(id);

        if (!status.equals("pending") && !status.equals("confirmed") && !status.equals("cancelled")) {
            throw new BadRequestException("Trạng thái không hợp lệ. Chỉ chấp nhận: pending, confirmed, cancelled");
        }

        booking.setStatus(status);

        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void deleteBooking(Integer id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }

    @Override
    public Long countConfirmedBookingsByUser(Integer userId) {
        return bookingRepository.countConfirmedBookingsByUser(userId);
    }
}
