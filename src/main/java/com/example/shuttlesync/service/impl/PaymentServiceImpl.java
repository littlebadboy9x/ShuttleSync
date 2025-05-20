package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.PaymentDto;
import com.example.shuttlesync.exeption.BadRequestException;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import com.example.shuttlesync.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentStatusTypeRepository paymentStatusTypeRepository;
    private final DiscountRepository discountRepository;

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    @Override
    public List<Payment> getPaymentsByBookingId(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId));
        return paymentRepository.findByBookingId(bookingId);
    }

    @Override
    public List<Payment> getPaymentsByStatus(Byte statusId) {
        PaymentStatusType status = paymentStatusTypeRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán với ID: " + statusId));
        return paymentRepository.findByPaymentStatus(status);
    }

    @Override
    @Transactional
    public Payment createPayment(Integer bookingId, BigDecimal amount, String paymentMethod) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId));

        PaymentStatusType unpaidStatus = paymentStatusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Chưa thanh toán'"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(unpaidStatus);
        payment.setCreatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment updatePaymentStatus(Integer paymentId, Byte newStatusId, User changedBy) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));

        PaymentStatusType newStatus = paymentStatusTypeRepository.findById(newStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán với ID: " + newStatusId));

        payment.setPaymentStatus(newStatus);
        if (newStatusId == 2) { // Đã thanh toán
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment addDiscountToPayment(Integer paymentId, Integer discountId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + discountId));

        // Kiểm tra thời hạn giảm giá
        LocalDate today = LocalDate.now();
        if (today.isAfter(discount.getValidFrom()) && 
            (discount.getValidTo() == null || today.isBefore(discount.getValidTo()))) {
            
            // Tính toán số tiền giảm giá
            BigDecimal discountAmount = payment.getAmount()
                    .multiply(BigDecimal.valueOf(discount.getDiscountPercent()))
                    .divide(BigDecimal.valueOf(100));
            
            // Cập nhật số tiền thanh toán
            payment.setAmount(payment.getAmount().subtract(discountAmount));
            
            return paymentRepository.save(payment);
        } else {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }
    }

    @Override
    @Transactional
    public Payment removeDiscountFromPayment(Integer paymentId, Integer discountId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + discountId));

        // Tính toán số tiền giảm giá đã áp dụng
        BigDecimal discountAmount = payment.getAmount()
                .multiply(BigDecimal.valueOf(discount.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100));

        // Cập nhật số tiền thanh toán
        payment.setAmount(payment.getAmount().add(discountAmount));

        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getPaymentsByInvoiceId(Integer invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    @Override
    public BigDecimal calculateTotalAmount(Integer paymentId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));
        return payment.getAmount();
    }

    @Override
    @Transactional
    public void processPayment(Integer paymentId, String paymentMethod) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));
        
        // Kiểm tra trạng thái hiện tại
        PaymentStatusType currentStatus = payment.getPaymentStatus();
        if (currentStatus.getId() == 2) { // Đã thanh toán
            throw new BadRequestException("Thanh toán này đã được xử lý trước đó");
        }
        
        // Cập nhật phương thức thanh toán
        payment.setPaymentMethod(paymentMethod);
        
        // Cập nhật trạng thái thành "Đã thanh toán"
        PaymentStatusType paidStatus = paymentStatusTypeRepository.findById((byte)2)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã thanh toán'"));
        payment.setPaymentStatus(paidStatus);
        
        // Cập nhật thời gian thanh toán
        payment.setPaidAt(LocalDateTime.now());
        
        // Lưu thay đổi
        paymentRepository.save(payment);
        
        // Cập nhật trạng thái đặt sân thành "Đã xác nhận"
        Booking booking = payment.getBooking();
        BookingStatusType confirmedStatus = new BookingStatusType();
        confirmedStatus.setId((byte)2); // ID cho "Đã xác nhận"
        booking.setStatus(confirmedStatus);
        bookingRepository.save(booking);
    }
}
