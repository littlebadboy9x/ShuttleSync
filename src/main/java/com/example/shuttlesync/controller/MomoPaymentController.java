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
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Long> request) {
        Long invoiceId = request.get("invoiceId");
        if (invoiceId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invoice ID is required"
            ));
        }
        try {
            Invoice invoice = invoiceService.getInvoiceById(invoiceId);
            MomoPayment payment = momoPaymentService.createPayment(invoice);
            return ResponseEntity.ok(Map.of(
                "payUrl", payment.getPayUrl(),
                "orderId", payment.getOrderId(),
                "requestId", payment.getRequestId(),
                "message", payment.getMessage(),
                "resultCode", payment.getResultCode()
            ));
        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/payments/momo/status/{orderId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String orderId) {
        try {
            MomoPayment payment = momoPaymentService.checkPaymentStatus(orderId);
            return ResponseEntity.ok(Map.of(
                "orderId", payment.getOrderId(),
                "status", payment.getPaymentStatus(),
                "message", payment.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error checking MoMo payment status", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
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
} 