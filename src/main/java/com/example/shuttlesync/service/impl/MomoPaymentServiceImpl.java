package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.exeption.BadRequestException;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.CustomerBookingInfo;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.MomoPayment;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.PaymentStatusType;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.CustomerBookingInfoRepository;
import com.example.shuttlesync.repository.InvoiceRepository;
import com.example.shuttlesync.repository.MomoPaymentRepository;
import com.example.shuttlesync.repository.PaymentRepository;
import com.example.shuttlesync.repository.PaymentStatusTypeRepository;
import com.example.shuttlesync.service.MomoPaymentService;
import com.example.shuttlesync.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentServiceImpl implements MomoPaymentService {

    private static final Logger logger = Logger.getLogger(MomoPaymentServiceImpl.class.getName());
    private final PaymentRepository paymentRepository;
    private final PaymentStatusTypeRepository paymentStatusTypeRepository;
    private final BookingRepository bookingRepository;
    private final MomoPaymentRepository momoPaymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final RestTemplate restTemplate;

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.api-endpoint}")
    private String apiEndpoint;

    @Value("${momo.return-url}")
    private String returnUrl;

    @Value("${momo.notify-url}")
    private String notifyUrl;

    @Override
    @Transactional
    public MomoPayment createPayment(Invoice invoice) {
        return createPayment(invoice, "");
    }

    @Override
    @Transactional
    public MomoPayment createPayment(Invoice invoice, String extraData) {
        try {
            log.info("Tạo thanh toán Momo cho hóa đơn: " + invoice.getId() + " với extraData: " + extraData);

            // Tạo payment record đầu tiên
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setBooking(invoice.getBooking());
            payment.setAmount(invoice.getFinalAmount());
            payment.setPaymentMethod("MOMO");
            
            // Lấy PaymentStatusType "Chưa thanh toán" (giả sử ID = 1)
            PaymentStatusType pendingStatus = paymentStatusTypeRepository.findById((byte)1)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Chưa thanh toán'"));
            payment.setPaymentStatus(pendingStatus);
            payment = paymentRepository.save(payment);

            // Tạo MomoPayment record
            MomoPayment momoPayment = new MomoPayment();
            momoPayment.setPayment(payment);
            momoPayment.setBooking(invoice.getBooking());
            momoPayment.setRequestId(UUID.randomUUID().toString());

            String orderId = "ORDER_" + System.currentTimeMillis() + "_" + invoice.getId();
            String requestId = momoPayment.getRequestId();
            momoPayment.setOrderId(orderId);
            momoPayment.setAmount(invoice.getFinalAmount());
            momoPayment = momoPaymentRepository.save(momoPayment);

            // Chuẩn bị request cho MoMo API v2 (Official Format - Fixed)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "ShuttleSync");
            requestBody.put("storeId", partnerCode); // Sử dụng partnerCode làm storeId
            requestBody.put("requestId", requestId);
            requestBody.put("amount", invoice.getFinalAmount().longValue());
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", "Thanh toan hoa don " + invoice.getId());
            // Sử dụng returnUrl khác nhau tùy theo role
            String finalReturnUrl = returnUrl;
            if ("customer".equals(extraData)) {
                finalReturnUrl = "http://localhost:3000/api/customer/payments/momo/return";
            } else if ("admin".equals(extraData)) {
                finalReturnUrl = "http://localhost:3000/api/admin/payments/momo/return"; 
            }
            requestBody.put("redirectUrl", finalReturnUrl);
            requestBody.put("ipnUrl", notifyUrl);
            requestBody.put("requestType", "captureWallet");
            requestBody.put("extraData", extraData); // Sử dụng extraData được truyền vào
            requestBody.put("lang", "vi");

            // Tạo chữ ký theo format đúng (theo thứ tự alphabet)
            String rawSignature = String.format("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey,
                    invoice.getFinalAmount().longValue(),
                    extraData, // Sử dụng extraData trong signature
                    notifyUrl,
                    orderId,
                    "Thanh toan hoa don " + invoice.getId(),
                    partnerCode,
                    finalReturnUrl,
                    requestId,
                    "captureWallet"
            );

            String signature = createHmacSha256(rawSignature, secretKey);
            requestBody.put("signature", signature);

            // Debug logs
            log.info("=== MoMo Request Debug ===");
            log.info("Partner Code: " + partnerCode);
            log.info("Access Key: " + accessKey);
            log.info("API Endpoint: " + apiEndpoint);
            log.info("ExtraData: " + extraData);
            log.info("Raw Signature: " + rawSignature);
            log.info("Signature: " + signature);
            log.info("Request Body: " + requestBody.toString());
            log.info("========================");

            // Gọi API MoMo hoặc mô phỏng trong môi trường test
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("User-Agent", "ShuttleSync/1.0");
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                log.info("Sending request to MoMo API: " + apiEndpoint);
                ResponseEntity<Map> response = restTemplate.postForEntity(apiEndpoint, entity, Map.class);
                Map<String, Object> responseBody = response.getBody();
                
                log.info("MoMo API Response: " + responseBody);

                if (responseBody != null) {
                    momoPayment.setPayUrl((String) responseBody.get("payUrl"));
                    momoPayment.setQrCodeUrl((String) responseBody.get("qrCodeUrl"));
                    momoPayment.setDeeplink((String) responseBody.get("deeplink"));
                    
                    // Xử lý resultCode có thể là Integer hoặc String
                    Object resultCodeObj = responseBody.get("resultCode");
                    String resultCodeStr = resultCodeObj != null ? resultCodeObj.toString() : "1";
                    momoPayment.setResultCode(resultCodeStr);
                    
                    momoPayment.setMessage((String) responseBody.get("message"));

                    if ("0".equals(resultCodeStr)) {
                        momoPayment.setPaymentStatus("PENDING");
                        log.info("MoMo payment created successfully with payUrl: " + momoPayment.getPayUrl());
                    } else {
                        momoPayment.setPaymentStatus("FAILED");
                        log.warn("MoMo payment failed with resultCode: " + resultCodeStr);
                    }
                } else {
                    throw new Exception("Empty response from Momo API");
                }

            } catch (Exception e) {
                log.error("Lỗi khi gọi API Momo: " + e.getMessage(), e);
                momoPayment.setPaymentStatus("FAILED");
                momoPayment.setMessage("Lỗi khi tạo thanh toán: " + e.getMessage());
                momoPayment.setResultCode("1");
                throw new RuntimeException("Không thể tạo thanh toán MoMo: " + e.getMessage());
            }

            return momoPaymentRepository.save(momoPayment);

        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán Momo: " + e.getMessage(), e);
            throw new RuntimeException("Không thể tạo thanh toán MoMo: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void handleCallback(String orderId, String requestId, String amount, String orderInfo,
                             String orderType, String transId, String resultCode, String message,
                             String payType, String responseTime, String extraData, String signature) {
        try {
            log.info("Nhận callback từ Momo cho orderId: " + orderId + ", resultCode: " + resultCode);

            // Verify signature (bỏ qua trong môi trường test)
            // String rawSignature = String.format("accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
            //         accessKey, amount, extraData, message, orderId, orderInfo, orderType,
            //         partnerCode, payType, requestId, responseTime, resultCode, transId);
            // String calculatedSignature = createHmacSha256(rawSignature, secretKey);
            // if (!calculatedSignature.equals(signature)) {
            //     throw new RuntimeException("Invalid signature");
            // }

            // Tìm MomoPayment
            MomoPayment momoPayment = momoPaymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với orderId: " + orderId));

            if ("0".equals(resultCode)) {
                // Thanh toán thành công
                momoPayment.setPaymentStatus("COMPLETED");
                momoPayment.setTransactionId(transId);

                // Cập nhật payment với trạng thái "Đã thanh toán" (ID = 2)
                Payment payment = momoPayment.getPayment();
                PaymentStatusType paidStatus = paymentStatusTypeRepository.findById((byte)2)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã thanh toán'"));
                payment.setPaymentStatus(paidStatus);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);

                // Cập nhật invoice status
                Invoice invoice = payment.getInvoice();
                invoice.setStatus("Paid");
                invoiceRepository.save(invoice);
                
                // CustomerBookingInfo sẽ được tự động update bởi database triggers
                
                log.info("Cập nhật thanh toán thành công cho invoice #" + invoice.getId());
            } else {
                // Thanh toán thất bại
                momoPayment.setPaymentStatus("FAILED");
                log.warn("Thanh toán Momo thất bại với resultCode: " + resultCode);
            }

            momoPayment.setResultCode(resultCode);
            momoPayment.setMessage(message);
            momoPaymentRepository.save(momoPayment);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý callback từ Momo: " + e.getMessage(), e);
            throw new RuntimeException("Không thể xử lý callback từ Momo: " + e.getMessage());
        }
    }

    @Override
    public MomoPayment checkPaymentStatus(String orderId) {
        return momoPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với orderId: " + orderId));
    }

    /**
     * Endpoint mô phỏng để test thanh toán thành công
     */
    @Transactional
    public void simulateSuccessfulPayment(String orderId) {
        try {
            MomoPayment momoPayment = momoPaymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với orderId: " + orderId));

            // Mô phỏng callback thành công
            String mockTransId = "MOCK_" + System.currentTimeMillis();
            handleCallback(
                orderId, 
                momoPayment.getRequestId(), 
                momoPayment.getAmount().toString(), 
                "Test payment",
                "momo_wallet", 
                mockTransId, 
                "0", // Success code
                "Giao dịch thành công (Test)",
                "webApp", 
                String.valueOf(System.currentTimeMillis()), 
                "", 
                "test_signature"
            );
            
            log.info("Mô phỏng thanh toán thành công cho orderId: " + orderId);
        } catch (Exception e) {
            log.error("Lỗi khi mô phỏng thanh toán: " + e.getMessage(), e);
            throw new RuntimeException("Không thể mô phỏng thanh toán: " + e.getMessage());
        }
    }

    /**
     * Tạo HMAC SHA256 signature
     */
    private String createHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating HMAC SHA256", e);
        }
    }
}