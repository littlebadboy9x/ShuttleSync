package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.MomoPayment;
import com.example.shuttlesync.service.MomoPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerMomoPaymentController {

    private final MomoPaymentService momoPaymentService;

    @GetMapping("/payments/momo/status/{orderId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String orderId) {
        try {
            MomoPayment payment = momoPaymentService.checkPaymentStatus(orderId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", payment.getOrderId(),
                "status", payment.getPaymentStatus(),
                "message", payment.getMessage() != null ? payment.getMessage() : "",
                "transactionId", payment.getTransactionId()
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

    @GetMapping("/payments/momo/return")
    public RedirectView handleMomoReturn(
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String requestId,
            @RequestParam(required = false) String amount,
            @RequestParam(required = false) String orderInfo,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) String transId,
            @RequestParam(required = false) String resultCode,
            @RequestParam(required = false) String message,
            @RequestParam(required = false) String payType,
            @RequestParam(required = false) String responseTime,
            @RequestParam(required = false, defaultValue = "") String extraData,
            @RequestParam(required = false) String signature
    ) {
        try {
            log.info("Momo return callback - orderId: {}, resultCode: {}, extraData: {}", orderId, resultCode, extraData);
            
            // Xử lý callback nếu có đủ thông tin
            if (orderId != null && resultCode != null) {
                momoPaymentService.handleCallback(
                    orderId, requestId != null ? requestId : "", 
                    amount != null ? amount : "0", 
                    orderInfo != null ? orderInfo : "",
                    orderType != null ? orderType : "",
                    transId != null ? transId : "",
                    resultCode, 
                    message != null ? message : "",
                    payType != null ? payType : "",
                    responseTime != null ? responseTime : "",
                    extraData, 
                    signature != null ? signature : ""
                );
            }
            
            // Kiểm tra extraData để xác định admin hay customer payment
            String redirectUrl;
            if (extraData != null && extraData.contains("admin")) {
                // Redirect về admin invoice detail với thông báo
                if ("0".equals(resultCode)) {
                    redirectUrl = String.format("http://localhost:3000/admin/invoices?paymentSuccess=true&orderId=%s&message=Thanh%%20toán%%20MoMo%%20thành%%20công", 
                        orderId != null ? orderId : ""
                    );
                } else {
                    redirectUrl = String.format("http://localhost:3000/admin/invoices?paymentSuccess=false&orderId=%s&message=Thanh%%20toán%%20MoMo%%20thất%%20bại", 
                        orderId != null ? orderId : ""
                    );
                }
            } else {
                // Redirect về customer payment page
                redirectUrl = String.format("http://localhost:3000/customer/payment?orderId=%s&resultCode=%s", 
                    orderId != null ? orderId : "", 
                    resultCode != null ? resultCode : ""
                );
            }
            
            return new RedirectView(redirectUrl);
        } catch (Exception e) {
            log.error("Error handling Momo return callback", e);
            // Chuyển hướng về frontend với lỗi
            return new RedirectView("http://localhost:3000/customer/payment?error=true");
        }
    }
} 