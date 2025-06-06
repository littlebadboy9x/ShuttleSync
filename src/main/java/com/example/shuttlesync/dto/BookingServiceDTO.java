package com.example.shuttlesync.dto;

import com.example.shuttlesync.model.BookingService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingServiceDTO {
    private Integer id;
    private Integer bookingId;
    private Integer serviceId;
    private String serviceName;
    private String serviceType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime createdAt;

    // Constructor để chuyển đổi từ entity sang DTO
    public BookingServiceDTO(BookingService bookingService) {
        this.id = bookingService.getId();
        this.bookingId = bookingService.getBooking().getId();
        this.serviceId = bookingService.getService().getId();
        this.serviceName = bookingService.getService().getServiceName();
        this.serviceType = bookingService.getService().getServiceTypeName();
        this.quantity = bookingService.getQuantity();
        this.unitPrice = bookingService.getUnitPrice();
        this.totalPrice = bookingService.getTotalPrice();
        this.notes = bookingService.getNotes();
        this.createdAt = bookingService.getCreatedAt();
    }
} 