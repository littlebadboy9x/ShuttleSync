package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.BookingServiceDTO;
import com.example.shuttlesync.model.BookingService;

import java.math.BigDecimal;
import java.util.List;

public interface BookingServiceService {
    
    List<BookingServiceDTO> getServicesByBookingId(Integer bookingId);
    
    BookingServiceDTO addServiceToBooking(Integer bookingId, Integer serviceId, Integer quantity, String notes);
    
    void removeServiceFromBooking(Integer bookingId, Integer bookingServiceId);
    
    BookingServiceDTO updateBookingService(Integer bookingId, Integer bookingServiceId, Integer quantity, String notes);
    
    BigDecimal calculateServicesTotal(Integer bookingId);
    
    BigDecimal getCourtPrice(Integer bookingId);
    
    Long countServicesByBookingId(Integer bookingId);
} 