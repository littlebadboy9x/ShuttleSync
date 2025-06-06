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
import org.springframework.transaction.annotation.Propagation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentStatusTypeRepository paymentStatusTypeRepository;
    private final DiscountRepository discountRepository;
    private final InvoiceRepository invoiceRepository;
    private final BookingStatusTypeRepository bookingStatusTypeRepository;
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

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
    public Payment createPayment(Integer bookingId, Integer invoiceId, BigDecimal amount, String paymentMethod) {
        log.info("Creating payment for booking id: {} with invoiceId: {}, amount: {}, method: {}", 
                bookingId, invoiceId, amount, paymentMethod);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        log.info("Found booking {} with status: {}", bookingId, 
                booking.getStatus() != null ? booking.getStatus().getName() : "null");
        
        Invoice invoice = null;
        if (invoiceId != null) {
            invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));
            log.info("Found invoice {} with status: {}", invoiceId, invoice.getStatus());
        }
        
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        
        // Thiết lập trạng thái mặc định là "Chưa thanh toán"
        PaymentStatusType unpaidStatus = paymentStatusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Chưa thanh toán'"));
        payment.setPaymentStatus(unpaidStatus);
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created payment {} with booking: {}, invoice: {}, status: {}", 
                savedPayment.getId(), 
                savedPayment.getBooking() != null ? savedPayment.getBooking().getId() : "null",
                savedPayment.getInvoice() != null ? savedPayment.getInvoice().getId() : "null",
                savedPayment.getPaymentStatus() != null ? savedPayment.getPaymentStatus().getName() : "null");
        
        return savedPayment;
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

        // Kiểm tra trạng thái và thời hạn giảm giá
        LocalDate today = LocalDate.now();
        if (discount.getStatus() != Discount.DiscountStatus.ACTIVE) {
            throw new BadRequestException("Mã giảm giá không còn hoạt động");
        }
        
        if (today.isBefore(discount.getValidFrom()) || 
            (discount.getValidTo() != null && today.isAfter(discount.getValidTo()))) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }
        
        // Tính toán số tiền giảm giá
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if (discount.getType() == Discount.DiscountType.PERCENTAGE) {
            discountAmount = payment.getAmount()
                    .multiply(discount.getValue())
                    .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
            
            // Áp dụng giới hạn giảm tối đa nếu có
            if (discount.getMaxDiscountAmount() != null && discountAmount.compareTo(discount.getMaxDiscountAmount()) > 0) {
                discountAmount = discount.getMaxDiscountAmount();
            }
        } else if (discount.getType() == Discount.DiscountType.FIXED) {
            discountAmount = discount.getValue();
        }
        
        // Giảm giá không thể vượt quá số tiền gốc
        if (discountAmount.compareTo(payment.getAmount()) > 0) {
            discountAmount = payment.getAmount();
        }
        
        // Cập nhật số tiền thanh toán
        payment.setAmount(payment.getAmount().subtract(discountAmount));
        
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment removeDiscountFromPayment(Integer paymentId, Integer discountId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + discountId));

        // Tính toán số tiền giảm giá đã áp dụng (tương tự logic add)
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if (discount.getType() == Discount.DiscountType.PERCENTAGE) {
            // Tính theo số tiền hiện tại sau khi đã giảm
            BigDecimal originalAmount = payment.getAmount().divide(
                    BigDecimal.ONE.subtract(discount.getValue().divide(BigDecimal.valueOf(100))), 
                    2, BigDecimal.ROUND_HALF_UP);
            
            discountAmount = originalAmount.subtract(payment.getAmount());
            
            // Áp dụng giới hạn giảm tối đa nếu có
            if (discount.getMaxDiscountAmount() != null && discountAmount.compareTo(discount.getMaxDiscountAmount()) > 0) {
                discountAmount = discount.getMaxDiscountAmount();
            }
        } else if (discount.getType() == Discount.DiscountType.FIXED) {
            discountAmount = discount.getValue();
        }

        // Cập nhật số tiền thanh toán (cộng lại số tiền đã giảm)
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
    @Transactional(propagation = Propagation.REQUIRED)
    public void processPayment(Integer paymentId, String paymentMethod) {
        // Lấy thông tin payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment với ID: " + paymentId));

        try {
            // Kiểm tra liên kết với booking
            Booking booking = payment.getBooking();
            if (booking == null) {
                log.error("Payment {} không có liên kết với booking nào", paymentId);
                throw new RuntimeException("Payment không có liên kết với booking");
            }
            log.info("Payment {} được liên kết với booking {}", paymentId, booking.getId());
            log.info("Trạng thái hiện tại của booking {}: {}", booking.getId(), 
                    booking.getStatus() != null ? booking.getStatus().getName() : "null");

            // Cập nhật trạng thái thanh toán
            PaymentStatusType paidStatus = paymentStatusTypeRepository.findById((byte)2)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã thanh toán'"));
            payment.setPaymentStatus(paidStatus);
            payment.setPaymentMethod(paymentMethod);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Đã cập nhật trạng thái payment thành 'Đã thanh toán' cho payment ID: {}", paymentId);

            // Cập nhật trạng thái hóa đơn
            Invoice invoice = payment.getInvoice();
            if (invoice != null) {
                invoice.setStatus("Paid");
                invoice = invoiceRepository.save(invoice);
                log.info("Đã cập nhật trạng thái invoice thành 'Paid' cho invoice ID: {}", invoice.getId());
            }

            // Cập nhật trạng thái booking
            BookingStatusType paidBookingStatus = bookingStatusTypeRepository.findById((byte)2)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã xác nhận' cho booking"));
            log.info("Tìm thấy trạng thái 'Đã xác nhận' với ID: {}, tên: {}", 
                    paidBookingStatus.getId(), paidBookingStatus.getName());

            booking.setStatus(paidBookingStatus);
            booking = bookingRepository.save(booking);
            log.info("Đã cập nhật trạng thái booking {} thành: {}", 
                    booking.getId(), booking.getStatus().getName());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý thanh toán: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xử lý thanh toán: " + e.getMessage());
        }
    }

    @Override
    public BigDecimal getTotalPaidAmount() {
        return paymentRepository.getTotalPaidAmount();
    }

    @Override
    @Transactional
    public Payment createPayment(Integer bookingId, BigDecimal amount, String paymentMethod) {
        // Gọi phương thức mới với invoiceId là null
        return createPayment(bookingId, null, amount, paymentMethod);
    }
}
