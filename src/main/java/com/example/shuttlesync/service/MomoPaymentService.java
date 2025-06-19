package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.model.MomoPayment;

public interface MomoPaymentService {
    /**
     * Tạo yêu cầu thanh toán MoMo cho hóa đơn
     */
    MomoPayment createPayment(Invoice invoice);

    /**
     * Tạo yêu cầu thanh toán MoMo cho hóa đơn với extraData
     */
    MomoPayment createPayment(Invoice invoice, String extraData);

    /**
     * Xử lý callback từ MoMo sau khi thanh toán
     */
    void handleCallback(String orderId, String requestId, String amount, String orderInfo,
                       String orderType, String transId, String resultCode, String message,
                       String payType, String responseTime, String extraData, String signature);

    /**
     * Kiểm tra trạng thái thanh toán
     */
    MomoPayment checkPaymentStatus(String orderId);

    /**
     * Mô phỏng thanh toán thành công
     */
    void simulateSuccessfulPayment(String orderId);
}