package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.BookingDTO;
import com.example.shuttlesync.dto.BookingServiceDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.BookingService;
import com.example.shuttlesync.service.BookingServiceService;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AdminBookingController {

    private static final Logger logger = Logger.getLogger(AdminBookingController.class.getName());
    private final BookingService bookingService;
    private final InvoiceService invoiceService;
    private final TimeSlotService timeSlotService;
    private final BookingServiceService bookingServiceService;

    @PostMapping("/admin/bookings/counter")
    public ResponseEntity<Map<String, Object>> createBookingAtCounter(@RequestBody Map<String, Object> request) {
        try {
            // Lấy thông tin từ request
            Integer userId = (Integer) request.get("userId");
            Integer courtId = (Integer) request.get("courtId");
            Integer timeSlotId = (Integer) request.get("timeSlotId");
            String bookingDateStr = (String) request.get("bookingDate");
            LocalDate bookingDate = LocalDate.parse(bookingDateStr);

            logger.info("Tạo đặt sân tại quầy cho userId: " + userId +
                    ", courtId: " + courtId +
                    ", timeSlotId: " + timeSlotId +
                    ", bookingDate: " + bookingDate);

            // Tạo booking
            Booking booking = bookingService.createBooking(userId, courtId, timeSlotId, bookingDate);

            // Tự động xác nhận booking
            booking = bookingService.updateBookingStatus(booking.getId(), (byte) 2, null); // Status 2: Đã xác nhận

            // Tạo hóa đơn tự động
            Invoice invoice = invoiceService.createInvoice(booking.getId());

            // Trả về kết quả
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", booking.getId());
            response.put("invoiceId", invoice.getId());
            response.put("message", "Đã tạo đặt sân và hóa đơn thành công");

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            logger.warning("Lỗi dữ liệu: " + e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo đặt sân tại quầy: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoiceByBookingId(@PathVariable Integer bookingId) {
        try {
            logger.info("Lấy thông tin hóa đơn cho booking ID: " + bookingId);

            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                // Nếu chưa có hóa đơn, tạo mới
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Đã tạo hóa đơn mới cho booking ID: " + bookingId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("invoiceId", invoice.getId());
            response.put("status", invoice.getStatus());
            response.put("originalAmount", invoice.getOriginalAmount());
            response.put("discountAmount", invoice.getDiscountAmount());
            response.put("finalAmount", invoice.getFinalAmount());
            response.put("invoiceDate", invoice.getInvoiceDate());
            response.put("createdAt", invoice.getCreatedAt());

            // Thêm thông tin khách hàng
            if (invoice.getBooking() != null && invoice.getBooking().getUser() != null) {
                User user = invoice.getBooking().getUser();
                response.put("customerName", user.getFullName());
                response.put("customerEmail", user.getEmail());
                response.put("customerPhone", user.getPhone() != null ? user.getPhone() : "");
            } else {
                response.put("customerName", "N/A");
                response.put("customerEmail", "N/A");
                response.put("customerPhone", "N/A");
            }

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Lỗi khi lấy thông tin hóa đơn: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/details")
    public ResponseEntity<Map<String, Object>> getBookingDetails(@PathVariable Integer bookingId) {
        try {
            logger.info("Lấy thông tin chi tiết đặt sân ID: " + bookingId);

            // Lấy thông tin booking
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Lấy thông tin hóa đơn
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                // Nếu chưa có hóa đơn, tạo mới
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Đã tạo hóa đơn mới cho booking ID: " + bookingId);
            }

            // Lấy danh sách dịch vụ đã đặt
            List<BookingServiceDTO> services = bookingServiceService.getServicesByBookingId(bookingId);

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", convertToDTO(booking));
            response.put("invoiceId", invoice.getId());
            response.put("invoiceStatus", invoice.getStatus());
            response.put("originalAmount", invoice.getOriginalAmount());
            response.put("discountAmount", invoice.getDiscountAmount());
            response.put("finalAmount", invoice.getFinalAmount());
            response.put("invoiceDate", invoice.getInvoiceDate());
            response.put("invoiceCreatedAt", invoice.getCreatedAt());
            response.put("services", services);

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Lỗi khi lấy thông tin chi tiết đặt sân: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/view-button")
    public ResponseEntity<Map<String, Object>> getBookingViewButton(@PathVariable Integer bookingId) {
        try {
            logger.info("Tạo nút xem chi tiết cho đặt sân ID: " + bookingId);

            // Kiểm tra booking có tồn tại không
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Tạo URL để chuyển đến trang chi tiết
            String viewUrl = "/admin/bookings/" + bookingId + "/details";

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", bookingId);
            response.put("viewUrl", viewUrl);
            response.put("buttonText", "Xem chi tiết");
            response.put("buttonIcon", "eye");

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo nút xem chi tiết: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/add-service-button")
    public ResponseEntity<Map<String, Object>> getAddServiceButton(@PathVariable Integer bookingId) {
        try {
            logger.info("Tạo nút thêm dịch vụ cho đặt sân ID: " + bookingId);

            // Kiểm tra booking có tồn tại không
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Tạo URL để chuyển đến trang thêm dịch vụ
            String addServiceUrl = "/admin/bookings/" + bookingId + "/services/add";

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", bookingId);
            response.put("addServiceUrl", addServiceUrl);
            response.put("buttonText", "Thêm dịch vụ");
            response.put("buttonIcon", "plus");

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo nút thêm dịch vụ: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/payment-button")
    public ResponseEntity<Map<String, Object>> getPaymentButton(@PathVariable Integer bookingId) {
        try {
            logger.info("Tạo nút thanh toán cho đặt sân ID: " + bookingId);

            // Kiểm tra booking có tồn tại không
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Lấy thông tin hóa đơn
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                // Nếu chưa có hóa đơn, tạo mới
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Đã tạo hóa đơn mới cho booking ID: " + bookingId);
            }

            // Tạo URL để chuyển đến trang thanh toán
            String paymentUrl = "/admin/bookings/" + bookingId + "/payment";

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", bookingId);
            response.put("invoiceId", invoice.getId());
            response.put("paymentUrl", paymentUrl);
            response.put("buttonText", "Thanh toán");
            response.put("buttonIcon", "credit-card");
            response.put("amount", invoice.getFinalAmount());

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo nút thanh toán: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/admin/bookings/{bookingId}/action-buttons")
    public ResponseEntity<Map<String, Object>> getActionButtons(@PathVariable Integer bookingId) {
        try {
            logger.info("Tạo các nút thao tác cho đặt sân ID: " + bookingId);

            // Kiểm tra booking có tồn tại không
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Lấy thông tin hóa đơn
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                // Nếu chưa có hóa đơn, tạo mới
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Đã tạo hóa đơn mới cho booking ID: " + bookingId);
            }

            // Tạo các URL
            String viewUrl = "/admin/bookings/" + bookingId + "/details";
            String addServiceUrl = "/admin/bookings/" + bookingId + "/services/add";
            String paymentUrl = "/admin/bookings/" + bookingId + "/payment";

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", bookingId);
            response.put("invoiceId", invoice.getId());

            // Nút xem chi tiết
            Map<String, Object> viewButton = new HashMap<>();
            viewButton.put("url", viewUrl);
            viewButton.put("text", "Xem chi tiết");
            viewButton.put("icon", "eye");
            viewButton.put("color", "primary");

            // Nút thêm dịch vụ
            Map<String, Object> addServiceButton = new HashMap<>();
            addServiceButton.put("url", addServiceUrl);
            addServiceButton.put("text", "Thêm dịch vụ");
            addServiceButton.put("icon", "plus");
            addServiceButton.put("color", "success");

            // Nút thanh toán
            Map<String, Object> paymentButton = new HashMap<>();
            paymentButton.put("url", paymentUrl);
            paymentButton.put("text", "Thanh toán");
            paymentButton.put("icon", "credit-card");
            paymentButton.put("color", "warning");
            paymentButton.put("amount", invoice.getFinalAmount());

            // Thêm tất cả nút vào response
            response.put("viewButton", viewButton);
            response.put("addServiceButton", addServiceButton);
            response.put("paymentButton", paymentButton);

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo các nút thao tác: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setUserPhone(booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "N/A");
        dto.setCourtName(booking.getCourt().getName());
        dto.setCourtLocation(booking.getCourt().getDescription());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getTimeSlot().getStartTime().toString());
        dto.setEndTime(booking.getTimeSlot().getEndTime().toString());
        dto.setStatus(booking.getStatus().getId().toString());
        dto.setTotalAmount(booking.getTimeSlot().getPrice().doubleValue());

        // Cập nhật trạng thái thanh toán dựa trên hóa đơn
        Invoice invoice = invoiceService.getInvoiceByBookingId(booking.getId());
        if (invoice != null && "Paid".equalsIgnoreCase(invoice.getStatus())) {
            dto.setPaymentStatus("paid");
        } else {
            dto.setPaymentStatus("pending");
        }

        dto.setCreatedAt(booking.getCreatedAt());
        dto.setNotes(booking.getNotes() != null ? booking.getNotes() : "");
        return dto;
    }
}