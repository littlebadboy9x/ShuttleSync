package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.InvoiceDTO;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.security.AuthenticationFacade;
import com.example.shuttlesync.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer/invoices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class CustomerInvoiceController {

    private final InvoiceService invoiceService;
    private final AuthenticationFacade authenticationFacade;

    /**
     * Lấy hóa đơn theo booking ID - Chỉ user owner mới được xem
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getInvoiceByBookingId(@PathVariable Integer bookingId) {
        try {
            log.info("Getting invoice for booking: {}", bookingId);
            
            // Get current authenticated user
            User currentUser = authenticationFacade.getCurrentUser();
            log.info("Current user: {}", currentUser.getId());
            
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                log.warn("No invoice found for booking: {}", bookingId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy hóa đơn cho booking này");
                return ResponseEntity.ok(response);
            }

            // Kiểm tra xem booking có user không
            if (invoice.getBooking() == null || invoice.getBooking().getUser() == null) {
                log.error("Invoice or booking or user is null for invoice: {}", invoice.getId());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Dữ liệu hóa đơn không hợp lệ");
                return ResponseEntity.status(500).body(response);
            }

            // Kiểm tra quyền ownership - chỉ user owner mới được xem hóa đơn
            if (!invoice.getBooking().getUser().getId().equals(currentUser.getId())) {
                log.warn("User {} trying to access invoice {} owned by user {}", 
                    currentUser.getId(), invoice.getId(), invoice.getBooking().getUser().getId());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Bạn không có quyền xem hóa đơn này");
                return ResponseEntity.status(403).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("invoice", convertToSimpleDTO(invoice));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting invoice for booking: " + bookingId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi lấy thông tin hóa đơn: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Lấy danh sách hóa đơn của user hiện tại
     */
    @GetMapping("/my-invoices")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyInvoices() {
        try {
            log.info("Getting invoices for current user");
            
            // Get current authenticated user
            User currentUser = authenticationFacade.getCurrentUser();
            log.info("Current user ID: {}", currentUser.getId());
            
            // Lấy tất cả hóa đơn và filter theo user
            List<Invoice> allInvoices = invoiceService.getAllInvoices();
            log.info("Total invoices found: {}", allInvoices.size());
            
            List<Invoice> userInvoices = allInvoices.stream()
                    .filter(invoice -> {
                        try {
                            return invoice.getBooking() != null 
                                && invoice.getBooking().getUser() != null
                                && invoice.getBooking().getUser().getId().equals(currentUser.getId());
                        } catch (Exception e) {
                            log.warn("Error filtering invoice: {}", invoice.getId(), e);
                            return false;
                        }
                    })
                    .collect(Collectors.toList());
            
            log.info("User invoices found: {}", userInvoices.size());

            List<Map<String, Object>> invoiceDTOs = userInvoices.stream()
                    .map(invoice -> {
                        try {
                            return convertToSimpleDTO(invoice);
                        } catch (Exception e) {
                            log.error("Error converting invoice {} to DTO", invoice.getId(), e);
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("invoices", invoiceDTOs);
            response.put("total", invoiceDTOs.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting user invoices", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi lấy danh sách hóa đơn: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Đếm số hóa đơn chưa thanh toán của user
     */
    @GetMapping("/pending-count/{userId}")
    public ResponseEntity<Map<String, Object>> getPendingInvoicesCount(@PathVariable Integer userId) {
        try {
            log.info("Getting pending invoices count for user: {}", userId);
            
            // Lấy tất cả hóa đơn và filter theo user và status
            List<Invoice> allInvoices = invoiceService.getAllInvoices();
            
            long pendingCount = allInvoices.stream()
                    .filter(invoice -> {
                        try {
                            return invoice.getBooking() != null 
                                && invoice.getBooking().getUser() != null
                                && invoice.getBooking().getUser().getId().equals(userId)
                                && "Pending".equals(invoice.getStatus());
                        } catch (Exception e) {
                            log.warn("Error filtering invoice: {}", invoice.getId(), e);
                            return false;
                        }
                    })
                    .count();
            
            log.info("Pending invoices count for user {}: {}", userId, pendingCount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pendingCount", pendingCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting pending invoices count for user " + userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi đếm hóa đơn chưa thanh toán: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Xem chi tiết hóa đơn theo ID - Chỉ user owner mới được xem
     */
    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getInvoiceDetails(@PathVariable Integer invoiceId) {
        try {
            // Get current authenticated user
            User currentUser = authenticationFacade.getCurrentUser();
            
            Invoice invoice = invoiceService.getInvoiceById(invoiceId).orElse(null);
            if (invoice == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy hóa đơn");
                return ResponseEntity.notFound().build();
            }

            // Kiểm tra quyền ownership
            if (!invoice.getBooking().getUser().getId().equals(currentUser.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Bạn không có quyền xem hóa đơn này");
                return ResponseEntity.status(403).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("invoice", convertToDetailDTO(invoice));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting invoice details: " + invoiceId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi lấy chi tiết hóa đơn");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Convert Invoice to simple DTO for list view
     */
    private Map<String, Object> convertToSimpleDTO(Invoice invoice) {
        try {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", invoice.getId());
            
            // Safely get booking data
            if (invoice.getBooking() != null) {
                dto.put("bookingId", invoice.getBooking().getId());
                dto.put("bookingDate", invoice.getBooking().getBookingDate());
                
                // Thêm thông tin booking channel
                if (invoice.getBooking().getBookingChannel() != null) {
                    dto.put("bookingChannel", invoice.getBooking().getBookingChannel().name());
                    dto.put("bookingChannelDisplay", invoice.getBooking().getBookingChannel().getDescription());
                } else {
                    dto.put("bookingChannel", null);
                    dto.put("bookingChannelDisplay", null);
                }
                
                if (invoice.getBooking().getBookingType() != null) {
                    dto.put("bookingType", invoice.getBooking().getBookingType().name());
                    dto.put("bookingTypeDisplay", invoice.getBooking().getBookingType().getDescription());
                } else {
                    dto.put("bookingType", null);
                    dto.put("bookingTypeDisplay", null);
                }
                
                if (invoice.getBooking().getCounterStaffId() != null) {
                    dto.put("counterStaffId", invoice.getBooking().getCounterStaffId());
                } else {
                    dto.put("counterStaffId", null);
                }
                
                // Safely get court data
                if (invoice.getBooking().getCourt() != null) {
                    dto.put("courtName", invoice.getBooking().getCourt().getName());
                } else {
                    dto.put("courtName", "N/A");
                }
                
                // Safely get time slot data
                if (invoice.getBooking().getTimeSlot() != null) {
                    dto.put("startTime", invoice.getBooking().getTimeSlot().getStartTime());
                    dto.put("endTime", invoice.getBooking().getTimeSlot().getEndTime());
                } else {
                    dto.put("startTime", "N/A");
                    dto.put("endTime", "N/A");
                }
            } else {
                dto.put("bookingId", null);
                dto.put("bookingDate", null);
                dto.put("bookingChannel", null);
                dto.put("bookingChannelDisplay", null);
                dto.put("bookingType", null);
                dto.put("bookingTypeDisplay", null);
                dto.put("counterStaffId", null);
                dto.put("courtName", "N/A");
                dto.put("startTime", "N/A");
                dto.put("endTime", "N/A");
            }
            
            // Thêm thông tin invoice type
            if (invoice.getInvoiceType() != null) {
                dto.put("invoiceType", invoice.getInvoiceType().name());
                dto.put("invoiceTypeDisplay", invoice.getInvoiceType().getDisplayName());
            } else {
                dto.put("invoiceType", null);
                dto.put("invoiceTypeDisplay", null);
            }
            
            dto.put("invoiceDate", invoice.getInvoiceDate());
            dto.put("originalAmount", invoice.getOriginalAmount() != null ? invoice.getOriginalAmount() : BigDecimal.ZERO);
            dto.put("discountAmount", invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO);
            dto.put("finalAmount", invoice.getFinalAmount() != null ? invoice.getFinalAmount() : BigDecimal.ZERO);
            dto.put("status", invoice.getStatus() != null ? invoice.getStatus() : "Unknown");
            dto.put("createdAt", invoice.getCreatedAt());
            
            return dto;
        } catch (Exception e) {
            log.error("Error converting invoice {} to simple DTO", invoice.getId(), e);
            throw new RuntimeException("Error converting invoice to DTO", e);
        }
    }

    /**
     * Convert Invoice to detailed DTO
     */
    private Map<String, Object> convertToDetailDTO(Invoice invoice) {
        Map<String, Object> dto = convertToSimpleDTO(invoice);
        dto.put("notes", invoice.getNotes());
        
        // Thêm thông tin khách hàng chi tiết
        if (invoice.getBooking() != null && invoice.getBooking().getUser() != null) {
            User customer = invoice.getBooking().getUser();
            dto.put("customerName", customer.getFullName() != null ? customer.getFullName() : "N/A");
            dto.put("customerEmail", customer.getEmail() != null ? customer.getEmail() : "N/A");
            dto.put("customerPhone", customer.getPhone() != null ? customer.getPhone() : "N/A");
        } else {
            dto.put("customerName", "N/A");
            dto.put("customerEmail", "N/A");
            dto.put("customerPhone", "N/A");
        }
        
        // Thêm thông tin booking chi tiết
        if (invoice.getBooking() != null) {
            dto.put("bookingNotes", invoice.getBooking().getNotes());
        }
        
        // Thêm thông tin chi tiết hóa đơn từ InvoiceDetail entities
        if (invoice.getInvoiceDetails() != null && !invoice.getInvoiceDetails().isEmpty()) {
            List<Map<String, Object>> details = invoice.getInvoiceDetails().stream()
                    .map(detail -> {
                        Map<String, Object> detailMap = new HashMap<>();
                        detailMap.put("id", detail.getId());
                        detailMap.put("itemName", detail.getItemName());
                        detailMap.put("quantity", detail.getQuantity());
                        detailMap.put("unitPrice", detail.getUnitPrice());
                        detailMap.put("amount", detail.getAmount());
                        
                        // Thêm thông tin time slot nếu có (court booking)
                        if (detail.getTimeSlot() != null) {
                            detailMap.put("bookingDate", detail.getBookingDate());
                            detailMap.put("startTime", detail.getStartTime());
                            detailMap.put("endTime", detail.getEndTime());
                            detailMap.put("courtName", detail.getCourtName());
                            detailMap.put("type", "court"); // Đánh dấu là đặt sân
                        }
                        
                        // Thêm thông tin service nếu có
                        if (detail.getService() != null) {
                            detailMap.put("serviceId", detail.getService().getId());
                            detailMap.put("serviceName", detail.getService().getServiceName());
                            detailMap.put("serviceDescription", detail.getService().getDescription());
                            detailMap.put("type", "service"); // Đánh dấu là dịch vụ
                        }
                        
                        return detailMap;
                    })
                    .collect(Collectors.toList());
            dto.put("details", details);
        } else {
            dto.put("details", List.of());
        }
        
        return dto;
    }
} 