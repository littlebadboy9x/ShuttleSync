package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.PaymentDto;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.service.BookingServiceService;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private static final Logger logger = Logger.getLogger(PaymentController.class.getName());
    private final PaymentService paymentService;
    private final BookingServiceService bookingServiceService;
    private final InvoiceService invoiceService;

    @GetMapping("/admin/bookings/{bookingId}/payments")
    public ResponseEntity<List<PaymentDto>> getPaymentsByBookingId(@PathVariable Integer bookingId) {
        try {
            logger.info("Fetching payments for booking ID: " + bookingId);
            List<Payment> payments = paymentService.getPaymentsByBookingId(bookingId);

            List<PaymentDto> paymentDtos = payments.stream()
                    .map(PaymentDto::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(paymentDtos);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error fetching payments for booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/bookings/{bookingId}/payments")
    public ResponseEntity<PaymentDto> createPayment(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, Object> request) {
        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String paymentMethod = (String) request.get("paymentMethod");

            logger.info("Creating payment for booking ID: " + bookingId +
                    " with amount: " + amount +
                    " and payment method: " + paymentMethod);

            Payment payment = paymentService.createPayment(bookingId, amount, paymentMethod);
            return ResponseEntity.ok(new PaymentDto(payment));
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error creating payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/payments/{paymentId}/process")
    public ResponseEntity<Map<String, Object>> processPayment(
            @PathVariable Integer paymentId,
            @RequestBody Map<String, Object> request) {
        try {
            String paymentMethod = (String) request.get("paymentMethod");

            logger.info("Processing payment ID: " + paymentId +
                    " with payment method: " + paymentMethod);

            paymentService.processPayment(paymentId, paymentMethod);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thanh toán đã được xử lý thành công");

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error processing payment: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/admin/bookings/{bookingId}/payments/cash")
    public ResponseEntity<Map<String, Object>> processCashPayment(@PathVariable Integer bookingId, @RequestBody Map<String, Object> request) {
        try {
            logger.info("Processing cash payment for booking ID: " + bookingId);

            // Lấy thông tin từ request
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String notes = (String) request.getOrDefault("notes", "");

            // Kiểm tra và tạo hóa đơn nếu chưa có
            Invoice invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice == null) {
                invoice = invoiceService.createInvoice(bookingId);
                logger.info("Created new invoice for booking ID: " + bookingId);
            }

            // Tạo thanh toán tiền mặt
            Payment payment = paymentService.createPayment(bookingId, invoice.getId(), amount, "Tiền mặt");
            logger.info("Created payment with ID: " + payment.getId() + " for booking ID: " + bookingId);

            // Xử lý thanh toán
            paymentService.processPayment(payment.getId(), "Tiền mặt");
            logger.info("Processed payment ID: " + payment.getId() + " successfully");

            // Trả về kết quả
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", payment.getId());
            response.put("invoiceId", invoice.getId());
            response.put("amount", payment.getAmount());
            response.put("paymentMethod", payment.getPaymentMethod());
            response.put("paidAt", payment.getPaidAt());
            response.put("message", "Thanh toán tiền mặt thành công");

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            logger.severe("Error processing cash payment: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/admin/bookings/{bookingId}/payments/full")
    public ResponseEntity<PaymentDto> createFullPayment(@PathVariable Integer bookingId) {
        try {
            logger.info("Creating full payment for booking ID: " + bookingId);

            // Tính tổng tiền (giá sân + giá dịch vụ)
            BigDecimal courtPrice = bookingServiceService.getCourtPrice(bookingId);
            BigDecimal servicesTotal = bookingServiceService.calculateServicesTotal(bookingId);
            BigDecimal totalAmount = courtPrice.add(servicesTotal);

            // Tạo thanh toán với tổng tiền
            Payment payment = paymentService.createPayment(bookingId, totalAmount, "Thanh toán tại quầy");

            // Xử lý thanh toán luôn (đánh dấu đã thanh toán)
            paymentService.processPayment(payment.getId(), "Thanh toán tại quầy");

            return ResponseEntity.ok(new PaymentDto(payment));
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error creating full payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/payments/{paymentId}/discount")
    public ResponseEntity<PaymentDto> addDiscountToPayment(
            @PathVariable Integer paymentId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer discountId = (Integer) request.get("discountId");

            logger.info("Adding discount ID: " + discountId + " to payment ID: " + paymentId);

            Payment payment = paymentService.addDiscountToPayment(paymentId, discountId);
            return ResponseEntity.ok(new PaymentDto(payment));
        } catch (ResourceNotFoundException e) {
            logger.warning(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.severe("Error adding discount to payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}