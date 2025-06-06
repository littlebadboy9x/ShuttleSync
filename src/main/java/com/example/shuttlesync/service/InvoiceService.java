package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceService {
    
    List<Invoice> getAllInvoices();
    
    Optional<Invoice> getInvoiceById(Integer id);
    
    Invoice getInvoiceByBookingId(Integer bookingId);
    
    List<Invoice> getInvoicesByStatus(String status);
    
    Invoice createInvoice(Integer bookingId);
    
    Invoice updateInvoiceStatus(Integer invoiceId, String newStatus, User changedBy);
    
    Invoice addInvoiceDetail(Integer invoiceId, Integer timeSlotId, Integer serviceId, 
                           String itemName, Integer quantity, BigDecimal unitPrice);
    
    Invoice removeInvoiceDetail(Integer invoiceId, Integer detailId);
    
    Invoice applyDiscount(Integer invoiceId, Integer discountId);
    
    Invoice removeDiscount(Integer invoiceId);
    
    List<Invoice> getInvoicesByDate(LocalDate date);
    
    List<Invoice> getInvoicesBetweenDates(LocalDate startDate, LocalDate endDate);
    
    BigDecimal calculateTotalAmount(Integer invoiceId);
    
    void generateInvoicePDF(Integer invoiceId);

    Invoice getInvoiceById(Long id);
    Invoice updateStatus(Long id, String status);
    
    /**
     * Áp dụng voucher vào hóa đơn
     * 
     * @param invoiceId ID của hóa đơn
     * @param voucherId ID của voucher
     * @param user Người dùng thực hiện thao tác
     * @return Hóa đơn đã được cập nhật
     */
    Invoice applyVoucherToInvoice(Integer invoiceId, Integer voucherId, User user);
} 