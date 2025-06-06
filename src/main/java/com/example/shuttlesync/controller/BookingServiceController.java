package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.BookingServiceDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.BookingService;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.service.BookingServiceService;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.ServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class BookingServiceController {

    private static final Logger logger = Logger.getLogger(BookingServiceController.class.getName());
    private final BookingServiceService bookingServiceService;
    private final ServiceService serviceService;
    private final InvoiceService invoiceService;

    @GetMapping("/admin/bookings/{bookingId}/services")
    public ResponseEntity<List<BookingServiceDTO>> getServicesByBookingId(@PathVariable Integer bookingId) {
        try {
            logger.info("Fetching services for booking ID: " + bookingId);
            List<BookingServiceDTO> services = bookingServiceService.getServicesByBookingId(bookingId);
            return ResponseEntity.ok(services);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error fetching services for booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/bookings/{bookingId}/services")
    public ResponseEntity<Map<String, Object>> addServiceToBooking(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer serviceId = (Integer) request.get("serviceId");
            Integer quantity = (Integer) request.getOrDefault("quantity", 1);
            String notes = (String) request.getOrDefault("notes", "");
            
            logger.info("Adding service ID: " + serviceId + " to booking ID: " + bookingId + 
                       " with quantity: " + quantity);
            
            // Thêm dịch vụ vào booking
            BookingServiceDTO addedService = bookingServiceService.addServiceToBooking(
                bookingId, serviceId, quantity, notes);
            
            // Kiểm tra và tạo hóa đơn nếu chưa có
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Created new invoice for booking ID: " + bookingId);
            }
            
            // Lấy thông tin dịch vụ
            Optional<Service> serviceOpt = serviceService.getServiceById(serviceId);
            if (serviceOpt.isEmpty()) {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceId);
            }
            Service service = serviceOpt.get();
            
            // Thêm chi tiết dịch vụ vào hóa đơn
            invoiceService.addInvoiceDetail(
                invoice.getId(),
                null, // không phải timeslot
                serviceId,
                service.getServiceName(),
                quantity,
                service.getUnitPrice()
            );
            logger.info("Added service to invoice ID: " + invoice.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("service", addedService);
            response.put("invoiceId", invoice.getId());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error adding service to booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/admin/bookings/{bookingId}/services/{bookingServiceId}")
    public ResponseEntity<Map<String, Boolean>> removeServiceFromBooking(
            @PathVariable Integer bookingId,
            @PathVariable Integer bookingServiceId) {
        try {
            logger.info("Removing booking service ID: " + bookingServiceId + " from booking ID: " + bookingId);
            bookingServiceService.removeServiceFromBooking(bookingId, bookingServiceId);
            
            // Lấy thông tin hóa đơn
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice != null) {
                // Cập nhật lại hóa đơn (xóa dịch vụ tương ứng)
                // Trong thực tế, cần có cách để xác định chính xác InvoiceDetail nào cần xóa
                // Có thể cần thêm trường để liên kết BookingService và InvoiceDetail
                logger.info("Invoice should be updated to remove the service");
            }
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error removing service from booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/admin/bookings/{bookingId}/services/{bookingServiceId}")
    public ResponseEntity<BookingServiceDTO> updateBookingService(
            @PathVariable Integer bookingId,
            @PathVariable Integer bookingServiceId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer quantity = (Integer) request.getOrDefault("quantity", 1);
            String notes = (String) request.getOrDefault("notes", "");
            
            logger.info("Updating booking service ID: " + bookingServiceId + 
                       " for booking ID: " + bookingId + 
                       " with quantity: " + quantity);
            
            BookingServiceDTO updatedService = bookingServiceService.updateBookingService(
                bookingId, bookingServiceId, quantity, notes);
            
            // Cập nhật hóa đơn nếu có
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice != null) {
                // Cập nhật lại hóa đơn (cập nhật số lượng dịch vụ)
                // Trong thực tế, cần có cách để xác định chính xác InvoiceDetail nào cần cập nhật
                logger.info("Invoice should be updated with new quantity");
            }
            
            return ResponseEntity.ok(updatedService);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error updating booking service: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/total")
    public ResponseEntity<Map<String, Object>> calculateBookingTotal(@PathVariable Integer bookingId) {
        try {
            logger.info("Calculating total for booking ID: " + bookingId);
            BigDecimal courtPrice = bookingServiceService.getCourtPrice(bookingId);
            BigDecimal servicesTotal = bookingServiceService.calculateServicesTotal(bookingId);
            BigDecimal grandTotal = courtPrice.add(servicesTotal);
            
            // Kiểm tra và tạo hóa đơn nếu chưa có
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Created new invoice for booking ID: " + bookingId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("courtPrice", courtPrice);
            response.put("servicesTotal", servicesTotal);
            response.put("grandTotal", grandTotal);
            response.put("invoiceId", invoice.getId());
            response.put("invoiceStatus", invoice.getStatus());
            response.put("invoiceFinalAmount", invoice.getFinalAmount());
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error calculating booking total: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 