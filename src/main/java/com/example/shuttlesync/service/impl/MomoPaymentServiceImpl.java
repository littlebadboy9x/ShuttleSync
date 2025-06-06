package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.exeption.BadRequestException;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.MomoPayment;
import com.example.shuttlesync.model.MomoPaymentRequest;
import com.example.shuttlesync.model.MomoPaymentResponse;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.InvoiceRepository;
import com.example.shuttlesync.repository.MomoPaymentRepository;
import com.example.shuttlesync.repository.PaymentRepository;
import com.example.shuttlesync.service.MomoPaymentService;
import com.example.shuttlesync.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.HmacUtils;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentServiceImpl implements MomoPaymentService {

    private static final Logger logger = Logger.getLogger(MomoPaymentServiceImpl.class.getName());
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final MomoPaymentRepository momoPaymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

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
    public MomoPaymentResponse createMomoPayment(Integer bookingId, Integer paymentId, BigDecimal amount, String orderInfo) {
        try {
            // Kiểm tra payment
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));
            
            // Kiểm tra booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));

            // Tạo requestId và orderId
            String requestId = UUID.randomUUID().toString();
            String orderId = "SHUTTLE_" + paymentId + "_" + System.currentTimeMillis();

            // Tạo request
            MomoPaymentRequest request = new MomoPaymentRequest();
            request.setPartnerCode(partnerCode);
            request.setPartnerName("ShuttleSync");
            request.setStoreId("ShuttleSyncStore");
            request.setRequestId(requestId);
            request.setAmount(amount.toString());
            request.setOrderId(orderId);
            request.setOrderInfo(orderInfo);
            request.setRedirectUrl(returnUrl);
            request.setIpnUrl(notifyUrl);
            request.setLang("vi");
            request.setExtraData("");
            request.setRequestType("captureWallet");
            
            // Thêm thông tin bổ sung
            request.setBookingId(bookingId.toString());
            request.setPaymentId(paymentId.toString());

            // Tạo signature
            String signature = createSignature(request);
            request.setSignature(signature);

            // Gửi request đến Momo API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<MomoPaymentRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<MomoPaymentResponse> response = restTemplate.postForEntity(apiEndpoint, entity, MomoPaymentResponse.class);
            MomoPaymentResponse momoResponse = response.getBody();

            // Lưu thông tin thanh toán vào cơ sở dữ liệu
            if (momoResponse != null) {
                MomoPayment momoPayment = new MomoPayment();
                momoPayment.setPayment(payment);
                momoPayment.setBooking(booking);
                momoPayment.setRequestId(requestId);
                momoPayment.setOrderId(orderId);
                momoPayment.setAmount(amount);
                
                if ("0".equals(momoResponse.getResultCode())) {
                    momoPayment.setPayUrl(momoResponse.getPayUrl());
                    momoPayment.setQrCodeUrl(momoResponse.getQrCodeUrl());
                    momoPayment.setDeeplink(momoResponse.getDeeplink());
                    momoPayment.setPaymentStatus("PENDING");
                    
                    // Cập nhật payment
                    payment.setPaymentMethod("Momo");
                    paymentRepository.save(payment);
                } else {
                    momoPayment.setPaymentStatus("FAILED");
                }
                
                momoPayment.setResultCode(momoResponse.getResultCode());
                momoPayment.setMessage(momoResponse.getMessage());
                
                momoPaymentRepository.save(momoPayment);
            }

            return momoResponse;
        } catch (Exception e) {
            logger.severe("Lỗi khi tạo thanh toán Momo: " + e.getMessage());
            throw new BadRequestException("Không thể tạo thanh toán Momo: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyMomoPayment(String requestId, String orderId, String amount) {
        // Kiểm tra thông tin thanh toán
        Optional<MomoPayment> momoPaymentOpt = momoPaymentRepository.findByOrderId(orderId);
        
        if (momoPaymentOpt.isPresent()) {
            MomoPayment momoPayment = momoPaymentOpt.get();
            return momoPayment.getRequestId().equals(requestId) && 
                   momoPayment.getAmount().toString().equals(amount);
        }
        
        return false;
    }

    @Override
    @Transactional
    public void processMomoPaymentCallback(String orderId, String requestId, String amount, String resultCode) {
        try {
            Optional<MomoPayment> momoPaymentOpt = momoPaymentRepository.findByOrderId(orderId);
            
            if (momoPaymentOpt.isPresent()) {
                MomoPayment momoPayment = momoPaymentOpt.get();
                
                if ("0".equals(resultCode)) {
                    // Thanh toán thành công
                    momoPayment.setPaymentStatus("SUCCESS");
                    momoPayment.setResultCode(resultCode);
                    momoPayment.setTransactionId(requestId);
                    momoPaymentRepository.save(momoPayment);
                    
                    // Xử lý thanh toán
                    paymentService.processPayment(momoPayment.getPayment().getId(), "Momo");

                    // Cập nhật trạng thái hóa đơn thành "Paid"
                    Payment payment = momoPayment.getPayment();
                    if (payment.getInvoice() != null) {
                        Invoice invoice = payment.getInvoice();
                        invoice.setStatus("Paid");
                        invoiceRepository.save(invoice);
                        logger.info("Cập nhật trạng thái hóa đơn thành Paid cho invoice ID: " + invoice.getId());
                    }

                    logger.info("Xử lý thanh toán Momo thành công cho payment ID: " + momoPayment.getPayment().getId());
                } else {
                    // Thanh toán thất bại
                    momoPayment.setPaymentStatus("FAILED");
                    momoPayment.setResultCode(resultCode);
                    momoPaymentRepository.save(momoPayment);
                    logger.warning("Thanh toán Momo thất bại với resultCode: " + resultCode);
                }
            } else {
                logger.warning("Không tìm thấy thông tin thanh toán Momo với orderId: " + orderId);
            }
        } catch (Exception e) {
            logger.severe("Lỗi khi xử lý callback từ Momo: " + e.getMessage());
            throw new BadRequestException("Không thể xử lý callback từ Momo: " + e.getMessage());
        }
    }

    private String createSignature(MomoPaymentRequest request) {
        try {
            String rawSignature = "accessKey=" + accessKey + 
                    "&amount=" + request.getAmount() + 
                    "&extraData=" + request.getExtraData() + 
                    "&ipnUrl=" + request.getIpnUrl() + 
                    "&orderId=" + request.getOrderId() + 
                    "&orderInfo=" + request.getOrderInfo() + 
                    "&partnerCode=" + request.getPartnerCode() + 
                    "&redirectUrl=" + request.getRedirectUrl() + 
                    "&requestId=" + request.getRequestId() + 
                    "&requestType=" + request.getRequestType();

            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(rawSignature.getBytes(StandardCharsets.UTF_8));
            return toHexString(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.severe("Lỗi khi tạo chữ ký: " + e.getMessage());
            throw new RuntimeException("Không thể tạo chữ ký", e);
        }
    }

    private String toHexString(byte[] bytes) {
        try (Formatter formatter = new Formatter()) {
            for (byte b : bytes) {
                formatter.format("%02x", b);
            }
            return formatter.toString();
        }
    }

    @Override
    public MomoPayment createPayment(Invoice invoice) {
        // Tạo payment record
        Payment payment = new Payment();
        payment.setBooking(invoice.getBooking());
        payment.setInvoice(invoice);
        payment.setAmount(invoice.getFinalAmount());
        payment.setPaymentMethod("MOMO");
        payment.setPaymentStatus(1); // 1: Chưa thanh toán
        payment = paymentRepository.save(payment);

        // Tạo MomoPayment record
        String orderId = String.format("HD%06d", invoice.getId());
        String requestId = UUID.randomUUID().toString();

        MomoPayment momoPayment = new MomoPayment();
        momoPayment.setPayment(payment);
        momoPayment.setBooking(invoice.getBooking());
        momoPayment.setRequestId(requestId);
        momoPayment.setOrderId(orderId);
        momoPayment.setAmount(invoice.getFinalAmount());
        momoPayment = momoPaymentRepository.save(momoPayment);

        // Chuẩn bị request cho MoMo
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", invoice.getFinalAmount().longValue());
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", "Thanh toan hoa don #" + invoice.getId());
        requestBody.put("redirectUrl", returnUrl);
        requestBody.put("ipnUrl", notifyUrl);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("extraData", "");
        requestBody.put("lang", "vi");

        // Tạo chữ ký
        String rawSignature = String.format("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey,
                invoice.getFinalAmount().longValue(),
                "",
                notifyUrl,
                orderId,
                "Thanh toan hoa don #" + invoice.getId(),
                partnerCode,
                returnUrl,
                requestId,
                "captureWallet"
        );

        String signature = new HmacUtils("HmacSHA256", secretKey).hmacHex(rawSignature);
        requestBody.put("signature", signature);

        // Gọi API MoMo
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(apiEndpoint, entity, Map.class);

            if (response != null) {
                momoPayment.setPayUrl((String) response.get("payUrl"));
                momoPayment.setQrCodeUrl((String) response.get("qrCodeUrl"));
                momoPayment.setDeeplink((String) response.get("deeplink"));
                momoPayment.setResultCode((String) response.get("resultCode"));
                momoPayment.setMessage((String) response.get("message"));

                if ("0".equals(response.get("resultCode"))) {
                    momoPayment.setPaymentStatus("PENDING");
                } else {
                    momoPayment.setPaymentStatus("FAILED");
                }

                return momoPaymentRepository.save(momoPayment);
            }
        } catch (Exception e) {
            momoPayment.setPaymentStatus("FAILED");
            momoPayment.setMessage("Error: " + e.getMessage());
            momoPaymentRepository.save(momoPayment);
            throw new RuntimeException("Lỗi khi tạo thanh toán MoMo: " + e.getMessage());
        }

        return momoPayment;
    }

    @Override
    public void handleCallback(String orderId, String requestId, String amount, String orderInfo,
                             String orderType, String transId, String resultCode, String message,
                             String payType, String responseTime, String extraData, String signature) {
        // Verify signature
        String rawSignature = String.format("accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                accessKey,
                amount,
                extraData,
                message,
                orderId,
                orderInfo,
                orderType,
                partnerCode,
                payType,
                requestId,
                responseTime,
                resultCode,
                transId
        );

        String calculatedSignature = new HmacUtils("HmacSHA256", secretKey).hmacHex(rawSignature);
        if (!calculatedSignature.equals(signature)) {
            throw new RuntimeException("Invalid signature");
        }

        // Cập nhật trạng thái thanh toán
        MomoPayment momoPayment = momoPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với orderId: " + orderId));

        if ("0".equals(resultCode)) {
            momoPayment.setPaymentStatus("COMPLETED");
            momoPayment.setTransactionId(transId);

            // Cập nhật payment
            Payment payment = momoPayment.getPayment();
            payment.setPaymentStatus(2); // 2: Đã thanh toán
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Cập nhật invoice status
            Invoice invoice = payment.getInvoice();
            invoice.setStatus("Paid");
            // invoiceRepository.save(invoice);
        } else {
            momoPayment.setPaymentStatus("FAILED");
        }

        momoPayment.setResultCode(resultCode);
        momoPayment.setMessage(message);
        momoPaymentRepository.save(momoPayment);
    }

    @Override
    public MomoPayment checkPaymentStatus(String orderId) {
        return momoPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với orderId: " + orderId));
    }
} 