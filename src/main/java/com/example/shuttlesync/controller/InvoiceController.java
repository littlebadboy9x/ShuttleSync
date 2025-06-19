package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.*;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.InvoiceDetail;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.UserService;
import com.example.shuttlesync.util.PDFGenerator;
import com.itextpdf.text.DocumentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/invoices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching invoices with status: {}, dateFilter: {}", status, dateFilter);

        try {
            List<Invoice> invoices;

            // Apply filters
            if (status != null && !status.equals("all")) {
                invoices = new ArrayList<>(invoiceService.getInvoicesByStatus(status));
            } else if (dateFilter != null && !dateFilter.equals("all")) {
                invoices = new ArrayList<>(getInvoicesByDateFilter(dateFilter));
            } else if (startDate != null && endDate != null) {
                invoices = new ArrayList<>(invoiceService.getInvoicesBetweenDates(startDate, endDate));
            } else {
                invoices = new ArrayList<>(invoiceService.getAllInvoices());
            }

            List<InvoiceDTO> invoiceDTOs = new ArrayList<>();
            for (Invoice invoice : invoices) {
                invoiceDTOs.add(convertToDTO(invoice));
            }

            return ResponseEntity.ok(invoiceDTOs);
        } catch (Exception e) {
            log.error("Error in getAllInvoices: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Integer id) {
        log.info("Fetching invoice with id: {}", id);

        return invoiceService.getInvoiceById(id)
                .map(invoice -> ResponseEntity.ok(convertToDTO(invoice)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody CreateInvoiceRequest request, Authentication authentication) {
        log.info("Creating invoice for booking: {}", request.getBookingId());

        try {
            Invoice invoice = invoiceService.createInvoice(request.getBookingId());

            // Apply additional settings from request
            if (request.getDiscountAmount() != null) {
                invoice.setDiscountAmount(request.getDiscountAmount());
                invoice.setFinalAmount(invoice.getOriginalAmount().subtract(request.getDiscountAmount()));
            }

            if (request.getNotes() != null) {
                invoice.setNotes(request.getNotes());
            }

            if (request.getStatus() != null) {
                invoice.setStatus(request.getStatus());
            }

            Invoice savedInvoice = invoiceService.updateInvoiceStatus(
                    invoice.getId(),
                    invoice.getStatus(),
                    getCurrentUser(authentication)
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedInvoice));
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Error creating invoice: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDTO> updateInvoice(@PathVariable Integer id, @RequestBody CreateInvoiceRequest request, Authentication authentication) {
        log.info("Updating invoice: {}", id);

        return invoiceService.getInvoiceById(id)
                .map(invoice -> {
                    // Update fields
                    if (request.getDiscountAmount() != null) {
                        invoice.setDiscountAmount(request.getDiscountAmount());
                        invoice.setFinalAmount(invoice.getOriginalAmount().subtract(request.getDiscountAmount()));
                    }

                    if (request.getNotes() != null) {
                        invoice.setNotes(request.getNotes());
                    }

                    String statusToUpdate = request.getStatus() != null ? request.getStatus() : invoice.getStatus();
                    Invoice updatedInvoice = invoiceService.updateInvoiceStatus(id, statusToUpdate, getCurrentUser(authentication));

                    return ResponseEntity.ok(convertToDTO(updatedInvoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload
    ) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Status is required"
            ));
        }

        try {
            Invoice invoice = invoiceService.updateStatus(id.longValue(), status);
            return ResponseEntity.ok(convertToDTO(invoice));
        } catch (Exception e) {
            log.error("Error updating invoice status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to update invoice status: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/apply-voucher")
    public ResponseEntity<Map<String, Object>> applyVoucher(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        log.info("Applying voucher to invoice: {}", id);
        
        try {
            Integer voucherId = (Integer) request.get("voucherId");
            if (voucherId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Voucher ID is required"
                ));
            }
            
            User currentUser = getCurrentUser(authentication);
            Invoice updatedInvoice = invoiceService.applyVoucherToInvoice(id, voucherId, currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("discountAmount", updatedInvoice.getDiscountAmount());
            response.put("finalAmount", updatedInvoice.getFinalAmount());
            response.put("message", "Voucher đã được áp dụng thành công");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error applying voucher to invoice: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error applying voucher to invoice: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi áp dụng voucher: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportInvoicePDF(@PathVariable Integer id) {
        log.info("Exporting PDF for invoice: {}", id);

        try {
            return invoiceService.getInvoiceById(id)
                    .map(invoice -> {
                        try {
                            // Chuyển đổi Invoice thành InvoiceDTO
                            InvoiceDTO invoiceDTO = convertToDTO(invoice);

                            // Log thông tin chi tiết
                            log.info("Invoice details - ID: {}, Status: {}, Date: {}, Customer: {}, Email: {}, Phone: {}",
                                    invoiceDTO.getId(),
                                    invoiceDTO.getStatus(),
                                    invoiceDTO.getInvoiceDate(),
                                    invoiceDTO.getCustomerName(),
                                    invoiceDTO.getCustomerEmail(),
                                    invoiceDTO.getCustomerPhone());

                            // Tạo PDF từ InvoiceDTO
                            byte[] pdfBytes = PDFGenerator.generateInvoicePDF(invoiceDTO);

                            // Thiết lập header cho response
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.APPLICATION_PDF);
                            headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
                            headers.setContentLength(pdfBytes.length);

                            return ResponseEntity.ok()
                                    .headers(headers)
                                    .body(pdfBytes);
                        } catch (DocumentException e) {
                            log.error("Error generating PDF for invoice {}: {}", id, e.getMessage());
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<byte[]>body(null);
                        }
                    })
                    .orElse(ResponseEntity.notFound().<byte[]>build());
        } catch (Exception e) {
            log.error("Unexpected error exporting PDF for invoice {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<byte[]>body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Integer id) {
        log.info("Deleting invoice: {}", id);

        return invoiceService.getInvoiceById(id)
                .map(invoice -> {
                    // In a real application, you might want to soft delete or archive instead
                    // For now, we'll just return success
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getInvoiceDetails(@PathVariable Integer id) {
        log.info("Fetching detailed information for invoice: {}", id);

        try {
            return invoiceService.getInvoiceById(id)
                    .map(invoice -> {
                        // Chuyển đổi Invoice thành InvoiceDTO
                        InvoiceDTO invoiceDTO = convertToDTO(invoice);

                        // Log thông tin chi tiết
                        log.info("Invoice details - ID: {}, Status: {}, Date: {}, Customer: {}, Email: {}, Phone: {}",
                                invoiceDTO.getId(),
                                invoiceDTO.getStatus(),
                                invoiceDTO.getInvoiceDate(),
                                invoiceDTO.getCustomerName(),
                                invoiceDTO.getCustomerEmail(),
                                invoiceDTO.getCustomerPhone());

                        // Tạo response
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("invoice", invoiceDTO);

                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Unexpected error fetching invoice details {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private List<Invoice> getInvoicesByDateFilter(String dateFilter) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        log.info("Processing date filter: {}, today is: {}", dateFilter, today);

        switch (dateFilter.toLowerCase()) {
            case "today":
                startDate = today;
                endDate = today;
                break;
            case "week":
                startDate = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                endDate = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
                break;
            case "month":
                startDate = today.with(TemporalAdjusters.firstDayOfMonth());
                endDate = today.with(TemporalAdjusters.lastDayOfMonth());
                break;
            default:
                log.info("Unknown date filter: {}, returning all invoices", dateFilter);
                return invoiceService.getAllInvoices();
        }

        log.info("Date range: {} to {}", startDate, endDate);
        return invoiceService.getInvoicesBetweenDates(startDate, endDate);
    }

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
            
            // Thêm thông tin booking channel từ booking
            if (invoice.getBooking().getBookingChannel() != null) {
                dto.setBookingChannel(invoice.getBooking().getBookingChannel().name());
                dto.setBookingChannelDisplay(invoice.getBooking().getBookingChannel().getDescription());
            }
            
            if (invoice.getBooking().getBookingType() != null) {
                dto.setBookingType(invoice.getBooking().getBookingType().name());
                dto.setBookingTypeDisplay(invoice.getBooking().getBookingType().getDescription());
            }
            
            if (invoice.getBooking().getCounterStaffId() != null) {
                dto.setCounterStaffId(invoice.getBooking().getCounterStaffId());
                // TODO: Load staff name from User table if needed
            }
        } else {
            dto.setBookingId(0);
            dto.setCustomerName("N/A");
            dto.setCustomerEmail("N/A");
            dto.setCustomerPhone("N/A");
        }

        dto.setInvoiceDate(invoice.getInvoiceDate());
        
        // Thêm thông tin invoice type
        if (invoice.getInvoiceType() != null) {
            dto.setInvoiceType(invoice.getInvoiceType().name());
            dto.setInvoiceTypeDisplay(invoice.getInvoiceType().getDisplayName());
        }
        
        // Thêm booking channel từ invoice (backup)
        if (dto.getBookingChannel() == null && invoice.getBookingChannel() != null) {
            dto.setBookingChannel(invoice.getBookingChannel());
        }
        
        if (invoice.getCounterStaffId() != null) {
            dto.setCounterStaffId(invoice.getCounterStaffId());
        }
        
        dto.setOriginalAmount(invoice.getOriginalAmount());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setFinalAmount(invoice.getFinalAmount());
        dto.setStatus(invoice.getStatus());
        dto.setNotes(invoice.getNotes());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());

        // Convert invoice details
        if (invoice.getInvoiceDetails() != null) {
            try {
                List<InvoiceDetailDTO> detailDTOs = invoice.getInvoiceDetails().stream()
                        .map(this::convertDetailToDTO)
                        .collect(Collectors.toList());
                dto.setDetails(detailDTOs);
            } catch (Exception e) {
                log.error("Error converting invoice details: {}", e.getMessage());
                dto.setDetails(new ArrayList<>());
            }
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

    private User getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            return userService.getUserByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }
}