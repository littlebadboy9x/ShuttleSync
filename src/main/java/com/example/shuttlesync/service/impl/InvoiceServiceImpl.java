package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.InvoiceDTO;
import com.example.shuttlesync.dto.InvoiceDetailDTO;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.util.PDFGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ServiceRepository serviceRepository;
    private final SystemChangeLogRepository systemChangeLogRepository;
    private final BookingStatusTypeRepository bookingStatusTypeRepository;
    private final DiscountRepository discountRepository;

    @Override
    public List<Invoice> getAllInvoices() {
        log.info("Fetching all invoices");
        return invoiceRepository.findAll();
    }

    @Override
    public Optional<Invoice> getInvoiceById(Integer id) {
        log.info("Fetching invoice with id: {}", id);
        return invoiceRepository.findById(id);
    }

    @Override
    public Invoice getInvoiceById(Long id) {
        log.info("Fetching invoice with id: {}", id);
        return invoiceRepository.findById(id.intValue())
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));
    }

    @Override
    public Invoice getInvoiceByBookingId(Integer bookingId) {
        log.info("Fetching invoice for booking id: {}", bookingId);
        return invoiceRepository.findByBookingId(bookingId);
    }

    @Override
    public List<Invoice> getInvoicesByStatus(String status) {
        log.info("Fetching invoices with status: {}", status);
        return invoiceRepository.findByStatus(status);
    }

    @Override
    public Invoice createInvoice(Integer bookingId) {
        log.info("Creating invoice for booking id: {}", bookingId);
        
        // Check if invoice already exists for this booking
        Invoice existingInvoice = invoiceRepository.findByBookingId(bookingId);
        if (existingInvoice != null) {
            throw new IllegalStateException("Invoice already exists for booking id: " + bookingId);
        }
        
        // Find the booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + bookingId));
        
        // Create new invoice
        Invoice invoice = new Invoice();
        invoice.setBooking(booking);
        invoice.setStatus("Pending");
        invoice.setOriginalAmount(BigDecimal.ZERO);
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setFinalAmount(BigDecimal.ZERO);
        
        // Create invoice detail for the time slot
        TimeSlot timeSlot = booking.getTimeSlot();
        InvoiceDetail detail = new InvoiceDetail();
        detail.setInvoice(invoice);
        detail.setTimeSlot(timeSlot);
        detail.setItemName("Thuê sân " + booking.getCourt().getName() + 
                          " Khung giờ " + timeSlot.getSlotIndex() + 
                          " (" + timeSlot.getStartTime() + "-" + timeSlot.getEndTime() + ")");
        detail.setBookingDate(booking.getBookingDate());
        detail.setStartTime(timeSlot.getStartTime());
        detail.setEndTime(timeSlot.getEndTime());
        detail.setCourtName(booking.getCourt().getName());
        detail.setQuantity(1);
        detail.setUnitPrice(timeSlot.getPrice());
        detail.setAmount(timeSlot.getPrice());
        
        invoice.getInvoiceDetails().add(detail);
        
        // Calculate amounts
        invoice.setOriginalAmount(timeSlot.getPrice());
        invoice.setFinalAmount(timeSlot.getPrice().subtract(invoice.getDiscountAmount()));
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        log.info("Created invoice with id: {} for booking: {}", savedInvoice.getId(), bookingId);
        return savedInvoice;
    }

    @Override
    public Invoice updateInvoiceStatus(Integer invoiceId, String newStatus, User changedBy) {
        log.info("Updating invoice {} status to: {}", invoiceId, newStatus);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        String oldStatus = invoice.getStatus();
        invoice.setStatus(newStatus);
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        
        // Log the change
        if (changedBy != null) {
            SystemChangeLog changeLog = new SystemChangeLog();
            changeLog.setTableName("Invoices");
            changeLog.setRecordId(invoiceId);
            changeLog.setChangeType("UPDATE");
            changeLog.setChangedFields("{\"Status\":\"" + oldStatus + " -> " + newStatus + "\"}");
            changeLog.setChangedBy(changedBy);
            systemChangeLogRepository.save(changeLog);
        }
        
        log.info("Updated invoice {} status from {} to {}", invoiceId, oldStatus, newStatus);
        return updatedInvoice;
    }

    @Override
    public Invoice addInvoiceDetail(Integer invoiceId, Integer timeSlotId, Integer serviceId, 
                                  String itemName, Integer quantity, BigDecimal unitPrice) {
        log.info("Adding detail to invoice: {}", invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        InvoiceDetail detail = new InvoiceDetail();
        detail.setInvoice(invoice);
        detail.setItemName(itemName);
        detail.setQuantity(quantity);
        detail.setUnitPrice(unitPrice);
        detail.setAmount(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        
        if (timeSlotId != null) {
            TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new IllegalArgumentException("TimeSlot not found with id: " + timeSlotId));
            detail.setTimeSlot(timeSlot);
            detail.setStartTime(timeSlot.getStartTime());
            detail.setEndTime(timeSlot.getEndTime());
        }
        
        if (serviceId != null) {
            com.example.shuttlesync.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            detail.setService(service);
        }
        
        invoice.getInvoiceDetails().add(detail);
        
        // Recalculate amounts
        BigDecimal newOriginalAmount = calculateTotalAmount(invoiceId);
        invoice.setOriginalAmount(newOriginalAmount);
        invoice.setFinalAmount(newOriginalAmount.subtract(invoice.getDiscountAmount()));
        
        return invoiceRepository.save(invoice);
    }

    @Override
    public Invoice removeInvoiceDetail(Integer invoiceId, Integer detailId) {
        log.info("Removing detail {} from invoice: {}", detailId, invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        invoice.getInvoiceDetails().removeIf(detail -> detail.getId().equals(detailId));
        
        // Recalculate amounts
        BigDecimal newOriginalAmount = calculateTotalAmount(invoiceId);
        invoice.setOriginalAmount(newOriginalAmount);
        invoice.setFinalAmount(newOriginalAmount.subtract(invoice.getDiscountAmount()));
        
        return invoiceRepository.save(invoice);
    }

    @Override
    public Invoice applyDiscount(Integer invoiceId, Integer discountId) {
        log.info("Applying discount {} to invoice: {}", discountId, invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        // For now, just apply a fixed discount amount
        // In a real implementation, you would look up the discount and apply percentage
        BigDecimal discountAmount = BigDecimal.valueOf(50000); // 50,000 VND discount
        
        invoice.setDiscountAmount(discountAmount);
        invoice.setFinalAmount(invoice.getOriginalAmount().subtract(discountAmount));
        
        return invoiceRepository.save(invoice);
    }

    @Override
    public Invoice removeDiscount(Integer invoiceId) {
        log.info("Removing discount from invoice: {}", invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setFinalAmount(invoice.getOriginalAmount());
        
        return invoiceRepository.save(invoice);
    }

    @Override
    public List<Invoice> getInvoicesByDate(LocalDate date) {
        log.info("Fetching invoices for date: {}", date);
        return invoiceRepository.findByDate(date);
    }

    @Override
    public List<Invoice> getInvoicesBetweenDates(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching invoices between {} and {}", startDate, endDate);
        return invoiceRepository.findBetweenDates(startDate, endDate);
    }

    @Override
    public BigDecimal calculateTotalAmount(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        return invoice.getInvoiceDetails().stream()
            .map(InvoiceDetail::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public void generateInvoicePDF(Integer invoiceId) {
        log.info("Generating PDF for invoice: {}", invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        
        // Logic to generate PDF would go here
        // For now, just log that it's been called
        log.info("PDF generation for invoice {} would happen here", invoiceId);
    }
    
    @Override
    @Transactional
    public Invoice applyVoucherToInvoice(Integer invoiceId, Integer voucherId, User user) {
        log.info("Applying voucher {} to invoice: {}", voucherId, invoiceId);
        
        // Tìm hóa đơn
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với ID: " + invoiceId));
            
        // Kiểm tra nếu hóa đơn đã thanh toán
        if ("Paid".equalsIgnoreCase(invoice.getStatus())) {
            throw new IllegalStateException("Không thể áp dụng voucher cho hóa đơn đã thanh toán");
        }
        
        try {
            // Tìm voucher trong cơ sở dữ liệu
            Discount voucher = discountRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher với ID: " + voucherId));
                
            // Kiểm tra tính hợp lệ của voucher
            LocalDate today = LocalDate.now();
            
            if (voucher.getStatus() != Discount.DiscountStatus.ACTIVE) {
                throw new IllegalStateException("Voucher không còn hoạt động");
            }
            
            if (voucher.getValidFrom().isAfter(today)) {
                throw new IllegalStateException("Voucher chưa có hiệu lực");
            }
            
            if (voucher.getValidTo() != null && voucher.getValidTo().isBefore(today)) {
                throw new IllegalStateException("Voucher đã hết hạn");
            }
            
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new IllegalStateException("Voucher đã hết lượt sử dụng");
            }
            
            // Kiểm tra giá trị đơn hàng tối thiểu
            if (voucher.getMinOrderAmount() != null && 
                invoice.getOriginalAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
                throw new IllegalStateException("Giá trị đơn hàng không đủ để áp dụng voucher này. " +
                    "Yêu cầu tối thiểu: " + voucher.getMinOrderAmount());
            }
            
            // Tính toán giá trị giảm giá
            BigDecimal discountAmount;
            
            if (voucher.getType() == Discount.DiscountType.PERCENTAGE) {
                // Giảm giá theo phần trăm
                discountAmount = invoice.getOriginalAmount()
                    .multiply(voucher.getValue().divide(new BigDecimal(100)))
                    .setScale(0, BigDecimal.ROUND_DOWN);
                
                // Áp dụng giới hạn giảm tối đa nếu có
                if (voucher.getMaxDiscountAmount() != null && 
                    discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                    discountAmount = voucher.getMaxDiscountAmount();
                }
            } else {
                // Giảm giá cố định
                discountAmount = voucher.getValue();
                
                // Đảm bảo giảm giá không vượt quá giá trị đơn hàng
                if (discountAmount.compareTo(invoice.getOriginalAmount()) > 0) {
                    discountAmount = invoice.getOriginalAmount();
                }
            }
            
            // Cập nhật hóa đơn
            invoice.setDiscountAmount(discountAmount);
            invoice.setFinalAmount(invoice.getOriginalAmount().subtract(discountAmount));
            
            // Tăng số lần sử dụng voucher
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            discountRepository.save(voucher);
            
            // Thêm ghi chú về voucher đã sử dụng
            String voucherNote = "Đã áp dụng voucher: " + voucher.getCode();
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                invoice.setNotes(invoice.getNotes() + "; " + voucherNote);
            } else {
                invoice.setNotes(voucherNote);
            }
            
            Invoice savedInvoice = invoiceRepository.save(invoice);
            
            // Ghi log thay đổi
            if (user != null) {
                SystemChangeLog changeLog = new SystemChangeLog();
                changeLog.setTableName("Invoices");
                changeLog.setRecordId(invoiceId);
                changeLog.setChangeType("UPDATE");
                changeLog.setChangedFields("{\"DiscountAmount\":\"" + discountAmount + 
                                         "\",\"VoucherId\":\"" + voucherId + "\"}");
                changeLog.setChangedBy(user);
                systemChangeLogRepository.save(changeLog);
            }
            
            log.info("Successfully applied voucher {} to invoice {}. Discount amount: {}", 
                    voucherId, invoiceId, discountAmount);
            return savedInvoice;
            
        } catch (Exception e) {
            log.error("Error applying voucher to invoice: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public Invoice updateStatus(Long id, String status) {
        log.info("Updating invoice {} status to: {}", id, status);
        
        Invoice invoice = getInvoiceById(id);
        String oldStatus = invoice.getStatus();
        invoice.setStatus(status);
        
        // Cập nhật trạng thái booking nếu hóa đơn đã thanh toán
        if ("Paid".equals(status)) {
            Booking booking = invoice.getBooking();
            if (booking != null) {
                // Lấy BookingStatusType cho trạng thái "Đã xác nhận"
                BookingStatusType confirmedStatus = bookingStatusTypeRepository.findByName("Đã xác nhận")
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy trạng thái Đã xác nhận"));
                booking.setStatus(confirmedStatus);
                bookingRepository.save(booking);
                log.info("Updated booking {} status to Đã xác nhận", booking.getId());
            }
        }
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        log.info("Updated invoice {} status from {} to {}", id, oldStatus, status);
        return updatedInvoice;
    }
    
    // Phương thức chuyển đổi từ Invoice sang InvoiceDTO
    private InvoiceDTO convertToDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        
        if (invoice.getBooking() != null) {
            dto.setBookingId(invoice.getBooking().getId());
            
            if (invoice.getBooking().getUser() != null) {
                dto.setCustomerName(invoice.getBooking().getUser().getFullName());
                dto.setCustomerEmail(invoice.getBooking().getUser().getEmail());
                dto.setCustomerPhone(invoice.getBooking().getUser().getPhone() != null ? invoice.getBooking().getUser().getPhone() : "N/A");
            } else {
                dto.setCustomerName("N/A");
                dto.setCustomerEmail("N/A");
                dto.setCustomerPhone("N/A");
            }
        } else {
            dto.setBookingId(0);
            dto.setCustomerName("N/A");
            dto.setCustomerEmail("N/A");
            dto.setCustomerPhone("N/A");
        }
        
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setOriginalAmount(invoice.getOriginalAmount());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setFinalAmount(invoice.getFinalAmount());
        dto.setStatus(invoice.getStatus());
        dto.setNotes(invoice.getNotes());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        
        // Chuyển đổi chi tiết hóa đơn
        if (invoice.getInvoiceDetails() != null) {
            List<InvoiceDetailDTO> detailDTOs = invoice.getInvoiceDetails().stream()
                    .map(this::convertDetailToDTO)
                    .collect(Collectors.toList());
            dto.setDetails(detailDTOs);
        } else {
            dto.setDetails(new ArrayList<>());
        }
        
        return dto;
    }
    
    private InvoiceDetailDTO convertDetailToDTO(InvoiceDetail detail) {
        InvoiceDetailDTO dto = new InvoiceDetailDTO();
        dto.setId(detail.getId());
        dto.setItemName(detail.getItemName() != null ? detail.getItemName() : "N/A");
        dto.setBookingDate(detail.getBookingDate());
        dto.setStartTime(detail.getStartTime());
        dto.setEndTime(detail.getEndTime());
        dto.setCourtName(detail.getCourtName() != null ? detail.getCourtName() : "N/A");
        dto.setQuantity(detail.getQuantity());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setAmount(detail.getAmount());
        dto.setNotes(detail.getNotes());
        return dto;
    }
} 