package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.PaymentDto;
import com.example.shuttlesync.exeption.BadRequestException;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Booking;
import com.example.shuttlesync.model.BookingStatusType;
import com.example.shuttlesync.model.Payment;
import com.example.shuttlesync.model.PaymentStatusType;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.BookingRepository;
import com.example.shuttlesync.repository.PaymentRepository;
import com.example.shuttlesync.repository.PaymentStatusTypeRepository;
import com.example.shuttlesync.repository.UserRepository;
import com.example.shuttlesync.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment getPaymentById(Integer id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + id));
    }

    @Override
    public Payment getPaymentByBookingId(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId));

        return paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán cho đơn đặt sân với ID: " + bookingId));
    }

    @Override
    public List<Payment> getPaymentsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        return paymentRepository.findByBookingUser(user);
    }

    @Override
    public List<Payment> getPaymentsByStatus(String statusName) {
        // Tìm statusId tương ứng với tên status
        Optional<PaymentStatusType> statusType = paymentStatusTypeRepository.findAll().stream()
            .filter(type -> type.getName().equalsIgnoreCase(statusName))
            .findFirst();
        
        if (statusType.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán: " + statusName);
        }
        
        return paymentRepository.findByStatus(statusType.get());
    }

    @Override
    @Transactional
    public Payment createPayment(PaymentDto paymentDto) {
        Booking booking = bookingRepository.findById(paymentDto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + paymentDto.getBookingId()));

        // Kiểm tra xem đã có thanh toán cho đơn đặt sân này chưa
        Optional<Payment> existingPayment = paymentRepository.findByBooking(booking);
        if (existingPayment.isPresent()) {
            throw new BadRequestException("Đã tồn tại thanh toán cho đơn đặt sân này");
        }

        // Tìm status "Chưa thanh toán" (id = 1)
        PaymentStatusType unpaidStatus = paymentStatusTypeRepository.findById((byte) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán 'Chưa thanh toán'"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(paymentDto.getAmount());
        payment.setPaymentMethod(paymentDto.getPaymentMethod());
        payment.setStatus(unpaidStatus);

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment updatePaymentStatus(Integer id, String statusName) {
        Payment payment = getPaymentById(id);

        byte statusId;
        if (statusName.equalsIgnoreCase("Đã thanh toán")) {
            statusId = 2; // ID cho "Đã thanh toán"
        } else if (statusName.equalsIgnoreCase("Chưa thanh toán")) {
            statusId = 1; // ID cho "Chưa thanh toán"
        } else {
            throw new BadRequestException("Trạng thái không hợp lệ. Chỉ chấp nhận: Đã thanh toán, Chưa thanh toán");
        }

        PaymentStatusType statusType = paymentStatusTypeRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán với ID: " + statusId));
        
        payment.setStatus(statusType);

        if (statusId == 2) { // Đã thanh toán
            payment.setPaidAt(LocalDateTime.now());

            // Cập nhật trạng thái đơn đặt sân thành confirmed (id = 2)
            Booking booking = payment.getBooking();
            BookingStatusType confirmedStatus = new BookingStatusType();
            confirmedStatus.setId((byte) 2); // ID cho "Đã xác nhận"
            booking.setStatus(confirmedStatus);
            bookingRepository.save(booking);
        }

        return paymentRepository.save(payment);
    }

    @Override
    public BigDecimal getTotalPaidAmount() {
        return paymentRepository.getTotalPaidAmount();
    }

    @Override
    public BigDecimal getTotalPaidAmountBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.getTotalPaidAmountBetweenDates(startDate, endDate);
    }
}
