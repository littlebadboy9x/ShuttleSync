package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.MomoPaymentDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.MomoPayment;
import com.example.shuttlesync.model.MomoPaymentResponse;
import com.example.shuttlesync.repository.MomoPaymentRepository;
import com.example.shuttlesync.service.BookingServiceService;
import com.example.shuttlesync.service.MomoPaymentService;
import com.example.shuttlesync.service.PaymentService;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.service.InvoiceService;
import com.example.shuttlesync.service.impl.MomoPaymentServiceImpl;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class MomoPaymentController {

    private static final Logger logger = Logger.getLogger(MomoPaymentController.class.getName());
    private final MomoPaymentService momoPaymentService;
    private final PaymentService paymentService;
    private final BookingServiceService bookingServiceService;
    private final MomoPaymentRepository momoPaymentRepository;
    private final InvoiceService invoiceService;

    @PostMapping("/payments/momo/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Object invoiceIdObj = request.get("invoiceId");
            if (invoiceIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invoice ID is required"
                ));
            }
            
            Long invoiceId;
            if (invoiceIdObj instanceof Number) {
                invoiceId = ((Number) invoiceIdObj).longValue();
            } else if (invoiceIdObj instanceof String) {
                try {
                    invoiceId = Long.parseLong((String) invoiceIdObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid invoice ID format"
                    ));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid invoice ID type"
                ));
            }
            
            // Lấy source để phân biệt admin vs customer (mặc định là admin)
            String source = (String) request.getOrDefault("source", "admin");
            
            Invoice invoice = invoiceService.getInvoiceById(invoiceId);
            MomoPayment payment = momoPaymentService.createPayment(invoice, source);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payUrl", payment.getPayUrl() != null ? payment.getPayUrl() : "");
            response.put("orderId", payment.getOrderId() != null ? payment.getOrderId() : "");
            response.put("requestId", payment.getRequestId() != null ? payment.getRequestId() : "");
            response.put("message", payment.getMessage() != null ? payment.getMessage() : "");
            response.put("resultCode", payment.getResultCode() != null ? payment.getResultCode() : "");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @GetMapping("/payments/momo/status/{orderId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String orderId) {
        try {
            MomoPayment payment = momoPaymentService.checkPaymentStatus(orderId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", payment.getOrderId() != null ? payment.getOrderId() : "");
            response.put("status", payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "");
            response.put("message", payment.getMessage() != null ? payment.getMessage() : "");
            response.put("transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "");
            
            // Thêm invoiceId để frontend có thể redirect về đúng trang
            if (payment.getPayment() != null && payment.getPayment().getInvoice() != null) {
                response.put("invoiceId", payment.getPayment().getInvoice().getId());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking MoMo payment status", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @PostMapping("/payments/momo/notify")
    public ResponseEntity<?> handleCallback(
            @RequestParam String orderId,
            @RequestParam String requestId,
            @RequestParam String amount,
            @RequestParam String orderInfo,
            @RequestParam String orderType,
            @RequestParam String transId,
            @RequestParam String resultCode,
            @RequestParam String message,
            @RequestParam String payType,
            @RequestParam String responseTime,
            @RequestParam(defaultValue = "") String extraData,
            @RequestParam String signature
    ) {
        try {
            momoPaymentService.handleCallback(
                orderId, requestId, amount, orderInfo, orderType,
                transId, resultCode, message, payType, responseTime,
                extraData, signature
            );
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            log.error("Error handling MoMo callback", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint mô phỏng thanh toán thành công cho môi trường test
     */
    @PostMapping("/payments/momo/simulate-success/{orderId}")
    public ResponseEntity<?> simulateSuccessfulPayment(@PathVariable String orderId) {
        try {
            // Cast service để gọi method simulateSuccessfulPayment
            if (momoPaymentService instanceof MomoPaymentServiceImpl) {
                ((MomoPaymentServiceImpl) momoPaymentService).simulateSuccessfulPayment(orderId);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã mô phỏng thanh toán thành công cho orderId: " + orderId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Chức năng mô phỏng không khả dụng"
                ));
            }
        } catch (Exception e) {
            log.error("Error simulating successful payment", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint lấy danh sách tất cả thanh toán Momo
     */
    @GetMapping("/payments/momo/all")
    public ResponseEntity<?> getAllMomoPayments() {
        try {
            List<MomoPayment> payments = momoPaymentRepository.findAll();
            List<Map<String, Object>> response = payments.stream().map(payment -> {
                Map<String, Object> paymentMap = new HashMap<>();
                paymentMap.put("id", payment.getId());
                paymentMap.put("orderId", payment.getOrderId());
                paymentMap.put("amount", payment.getAmount());
                paymentMap.put("status", payment.getPaymentStatus());
                paymentMap.put("payUrl", payment.getPayUrl() != null ? payment.getPayUrl() : "");
                paymentMap.put("message", payment.getMessage() != null ? payment.getMessage() : "");
                paymentMap.put("createdAt", payment.getCreatedAt());
                return paymentMap;
            }).collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting all MoMo payments", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}