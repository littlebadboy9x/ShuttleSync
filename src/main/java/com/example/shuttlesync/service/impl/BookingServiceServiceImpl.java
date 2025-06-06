package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.BookingServiceDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.BookingService;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.BookingServiceRepository;
import com.example.shuttlesync.repository.ServiceRepository;
import com.example.shuttlesync.service.BookingServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceServiceImpl implements BookingServiceService {

    private final BookingServiceRepository bookingServiceRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public List<BookingServiceDTO> getServicesByBookingId(Integer bookingId) {
        // Kiểm tra booking có tồn tại không
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId);
        }
        
        List<BookingService> services = bookingServiceRepository.findByBookingId(bookingId);
        return services.stream()
                .map(BookingServiceDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingServiceDTO addServiceToBooking(Integer bookingId, Integer serviceId, Integer quantity, String notes) {
        // Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));
        
        // Lấy dịch vụ
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceId));
        
        // Kiểm tra dịch vụ có đang hoạt động không
        if (!service.getIsActive()) {
            throw new IllegalArgumentException("Dịch vụ này hiện không khả dụng");
        }
        
        // Tạo mới BookingService
        BookingService bookingService = new BookingService();
        bookingService.setBooking(booking);
        bookingService.setService(service);
        bookingService.setQuantity(quantity);
        bookingService.setUnitPrice(service.getUnitPrice());
        bookingService.setNotes(notes);
        
        // Tính toán tổng tiền
        BigDecimal totalPrice = service.getUnitPrice().multiply(BigDecimal.valueOf(quantity));
        bookingService.setTotalPrice(totalPrice);
        
        // Lưu vào database
        BookingService savedBookingService = bookingServiceRepository.save(bookingService);
        
        return new BookingServiceDTO(savedBookingService);
    }

    @Override
    @Transactional
    public void removeServiceFromBooking(Integer bookingId, Integer bookingServiceId) {
        // Kiểm tra booking có tồn tại không
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId);
        }
        
        // Kiểm tra booking service có tồn tại không
        BookingService bookingService = bookingServiceRepository.findById(bookingServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ đặt sân với ID: " + bookingServiceId));
        
        // Kiểm tra xem booking service có thuộc về booking này không
        if (!bookingService.getBooking().getId().equals(bookingId)) {
            throw new IllegalArgumentException("Dịch vụ này không thuộc về đặt sân với ID: " + bookingId);
        }
        
        // Xóa booking service
        bookingServiceRepository.deleteById(bookingServiceId);
    }

    @Override
    @Transactional
    public BookingServiceDTO updateBookingService(Integer bookingId, Integer bookingServiceId, Integer quantity, String notes) {
        // Kiểm tra booking có tồn tại không
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId);
        }
        
        // Lấy booking service
        BookingService bookingService = bookingServiceRepository.findById(bookingServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ đặt sân với ID: " + bookingServiceId));
        
        // Kiểm tra xem booking service có thuộc về booking này không
        if (!bookingService.getBooking().getId().equals(bookingId)) {
            throw new IllegalArgumentException("Dịch vụ này không thuộc về đặt sân với ID: " + bookingId);
        }
        
        // Cập nhật thông tin
        bookingService.setQuantity(quantity);
        bookingService.setNotes(notes);
        
        // Tính lại tổng tiền
        BigDecimal totalPrice = bookingService.getUnitPrice().multiply(BigDecimal.valueOf(quantity));
        bookingService.setTotalPrice(totalPrice);
        
        // Lưu vào database
        BookingService updatedBookingService = bookingServiceRepository.save(bookingService);
        
        return new BookingServiceDTO(updatedBookingService);
    }

    @Override
    public BigDecimal calculateServicesTotal(Integer bookingId) {
        // Kiểm tra booking có tồn tại không
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId);
        }
        
        // Tính tổng tiền dịch vụ
        BigDecimal total = bookingServiceRepository.calculateTotalByBookingId(bookingId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getCourtPrice(Integer bookingId) {
        // Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));
        
        // Lấy giá sân từ time slot
        return booking.getTimeSlot().getPrice();
    }

    @Override
    public Long countServicesByBookingId(Integer bookingId) {
        // Kiểm tra booking có tồn tại không
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId);
        }
        
        return bookingServiceRepository.countByBookingId(bookingId);
    }
} 