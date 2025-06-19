package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    
    private Integer id;
    private Integer bookingId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate invoiceDate;
    
    // Thông tin loại hóa đơn và kênh đặt
    private String invoiceType;          // ONLINE, COUNTER, PHONE, MOBILE_APP
    private String invoiceTypeDisplay;   // "🌐 Hóa đơn đặt online"
    private String bookingChannel;       // ONLINE, COUNTER, PHONE, MOBILE_APP
    private String bookingChannelDisplay; // "Đặt online"
    private String bookingType;          // ADVANCE, URGENT, RECURRING, WALK_IN
    private String bookingTypeDisplay;   // "Đặt trước"
    
    // Thông tin nhân viên (cho booking tại quầy)
    private Integer counterStaffId;
    private String counterStaffName;
    
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<InvoiceDetailDTO> details;
    
    // Helper methods để hiển thị
    public String getFormattedInvoiceType() {
        return invoiceTypeDisplay != null ? invoiceTypeDisplay : invoiceType;
    }
    
    public boolean isCounterBooking() {
        return "COUNTER".equals(bookingChannel);
    }
    
    public boolean isOnlineBooking() {
        return "ONLINE".equals(bookingChannel);
    }
    
    public boolean hasCounterStaff() {
        return counterStaffId != null && counterStaffId > 0;
    }
}
