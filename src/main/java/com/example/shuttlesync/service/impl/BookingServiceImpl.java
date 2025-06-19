package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.BookingDTO;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import com.example.shuttlesync.service.BookingService;
import com.example.shuttlesync.service.EmailService;
import com.example.shuttlesync.service.NotificationService;
import com.example.shuttlesync.service.SystemChangeLogService;
import com.example.shuttlesync.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final DiscountRepository discountRepository;
    private final NotificationService notificationService;
    private final SystemChangeLogService systemChangeLogService;
    private final BookingStatusTypeRepository bookingStatusTypeRepository;
    private final NotificationRepository notificationRepository;
    private final SystemChangeLogRepository systemChangeLogRepository;
    private final PaymentStatusTypeRepository paymentStatusTypeRepository;
    private final EmailService emailService;
    private final InvoiceService invoiceService;
    
    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    @Override
    public Optional<Booking> getBookingById(Integer id) {
        return bookingRepository.findById(id);
    }
    
    @Override
    public List<Booking> getBookingsByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        return bookingRepository.findByUser(user);
    }
    
    @Override
    public List<Booking> getBookingsByStatus(Byte statusId) {
        BookingStatusType status = bookingStatusTypeRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái đặt sân với ID: " + statusId));
        
        return bookingRepository.findByStatusId(statusId);
    }
    
    @Transactional
    @Override
    public Booking createBooking(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate, Set<Integer> discountIds) {
        // Lấy thông tin người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Lấy thông tin sân
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));
        
        // Lấy thông tin khung giờ
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ với ID: " + timeSlotId));
        
        // Kiểm tra xem khung giờ và sân có khớp nhau không
        if (!timeSlot.getCourt().getId().equals(court.getId())) {
            throw new IllegalArgumentException("Khung giờ không thuộc sân này");
        }
        
        // Kiểm tra xem khung giờ đã được đặt chưa
        if (isTimeSlotBooked(courtId, timeSlotId, bookingDate)) {
            throw new IllegalArgumentException("Khung giờ này đã được đặt cho ngày " + bookingDate);
        }
        
        // Lấy trạng thái "Chờ xác nhận" (ID = 1)
        BookingStatusType waitingStatus = bookingStatusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Chờ xác nhận'"));
        
        // Tạo booking mới
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(bookingDate);
        booking.setStatus(waitingStatus);
        booking.setCreatedAt(LocalDateTime.now());
        
        // Set booking channel và type cho customer booking
        booking.setBookingChannel(Booking.BookingChannel.ONLINE);
        booking.setCounterStaffId(null);
        
        // Set booking type dựa trên thời gian đặt
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingDateTime = bookingDate.atTime(timeSlot.getStartTime());
        if (bookingDateTime.isBefore(now.plusHours(2))) {
            booking.setBookingType(Booking.BookingType.URGENT);
        } else {
            booking.setBookingType(Booking.BookingType.ADVANCE);
        }
        
        // Thêm các discount nếu có
        if (discountIds != null && !discountIds.isEmpty()) {
            Set<Discount> discounts = new HashSet<>();
            for (Integer discountId : discountIds) {
                Discount discount = discountRepository.findById(discountId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + discountId));
                
                // Kiểm tra xem discount có còn hiệu lực không
                LocalDate today = LocalDate.now();
                if (today.isAfter(discount.getValidFrom()) && 
                    (discount.getValidTo() == null || today.isBefore(discount.getValidTo()))) {
                    discounts.add(discount);
                }
            }
            booking.setDiscounts(discounts);
        }
        
        // Lưu booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Tạo invoice tự động cho booking
        try {
            invoiceService.createInvoice(savedBooking.getId());
        } catch (Exception e) {
            // Log lỗi nhưng không làm gián đoạn tạo booking
            System.err.println("Failed to create invoice for booking " + savedBooking.getId() + ": " + e.getMessage());
        }
        
        // Tạo thông báo cho admin
        List<User> admins = userRepository.findByRole("admin");
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setMessage("Có đặt sân mới từ " + user.getFullName() + " đang chờ xác nhận (Đặt online)");
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
        
        // Tạo thông báo cho người dùng
        Notification userNotification = new Notification();
        userNotification.setUser(user);
        userNotification.setMessage("Đặt sân của bạn đang chờ xác nhận");
        userNotification.setIsRead(false);
        notificationRepository.save(userNotification);
        
        // Ghi log thay đổi
        SystemChangeLog log = new SystemChangeLog();
        log.setTableName("Bookings");
        log.setRecordId(savedBooking.getId());
        log.setChangeType("INSERT");
        log.setChangedFields(String.format(
                "{\"UserId\":\"%d\",\"CourtId\":\"%d\",\"TimeSlotId\":\"%d\",\"BookingDate\":\"%s\",\"BookingChannel\":\"ONLINE\"}",
                userId, courtId, timeSlotId, bookingDate));
        log.setChangedBy(user);
        systemChangeLogRepository.save(log);
        
        // CustomerBookingInfo sẽ được tự động tạo bởi database trigger
        
        return savedBooking;
    }
    
    @Transactional
    @Override
    public Booking updateBookingStatus(Integer bookingId, Byte newStatusId, User changedBy) {
        // Lấy thông tin booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));
        
        // Lấy thông tin trạng thái mới
        BookingStatusType newStatus = bookingStatusTypeRepository.findById(newStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái với ID: " + newStatusId));
        
        // Lưu trạng thái cũ để so sánh
        BookingStatusType oldStatus = booking.getStatus();
        
        // Cập nhật trạng thái booking
        booking.setStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Ghi log thay đổi nếu có thông tin người thay đổi
        if (changedBy != null) {
            SystemChangeLog log = new SystemChangeLog();
            log.setTableName("Bookings");
            log.setRecordId(bookingId);
            log.setChangeType("UPDATE");
            log.setChangedFields(String.format(
                    "{\"Status\":{\"from\":\"%d\",\"to\":\"%d\"}}",
                    oldStatus.getId(), newStatusId));
            log.setChangedBy(changedBy);
            systemChangeLogRepository.save(log);
        }
        
        // Tạo thanh toán nếu trạng thái là "Đã xác nhận" (ID = 2)
        if (newStatusId == 2 && !oldStatus.getId().equals(newStatusId)) {
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(booking.getTimeSlot().getPrice());
            payment.setPaymentMethod("Chưa chọn");
            
            // Lấy trạng thái thanh toán từ repository thay vì tạo mới
            PaymentStatusType pendingStatus = paymentStatusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái thanh toán 'Chưa thanh toán'"));
            payment.setPaymentStatus(pendingStatus);
            
            payment.setCreatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // CustomerBookingInfo sẽ được tự động update bởi database triggers
            
            // Thông báo cho người dùng
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setMessage("Đặt sân của bạn đã được xác nhận. Vui lòng tiến hành thanh toán.");
            notification.setIsRead(false);
            notificationRepository.save(notification);
            
            // Gửi email xác nhận đặt sân
            try {
                emailService.sendBookingConfirmationEmail(booking.getUser(), booking);
            } catch (Exception e) {
                // Log lỗi nhưng không làm gián đoạn flow chính
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }
        }
        
        // Nếu trạng thái là "Đã hủy" (ID = 3)
        if (newStatusId == 3 && !oldStatus.getId().equals(newStatusId)) {
            // Thông báo cho người dùng
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setMessage("Đặt sân của bạn đã bị hủy.");
            notification.setIsRead(false);
            notificationRepository.save(notification);
            
            // Gửi email thông báo hủy đặt sân
            try {
                emailService.sendBookingCancellationEmail(booking.getUser(), booking);
            } catch (Exception e) {
                // Log lỗi nhưng không làm gián đoạn flow chính
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        }
        
        return updatedBooking;
    }
    
    @Transactional
    @Override
    public void cancelBooking(Integer bookingId, User user) {
        // Lấy thông tin booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt sân với ID: " + bookingId));
        
        // Kiểm tra xem người dùng có quyền hủy booking hay không
        if (!booking.getUser().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đặt sân này");
        }
        
        // Lấy trạng thái "Đã hủy" (ID = 3)
        BookingStatusType cancelledStatus = bookingStatusTypeRepository.findById((byte)3)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã hủy'"));
        
        // Lưu trạng thái cũ để ghi log
        BookingStatusType oldStatus = booking.getStatus();
        
        // Cập nhật trạng thái booking
        booking.setStatus(cancelledStatus);
        bookingRepository.save(booking);
        
        // Ghi log thay đổi
        SystemChangeLog log = new SystemChangeLog();
        log.setTableName("Bookings");
        log.setRecordId(bookingId);
        log.setChangeType("UPDATE");
        log.setChangedFields(String.format(
                "{\"Status\":{\"from\":\"%d\",\"to\":\"3\"}}",
                oldStatus.getId()));
        log.setChangedBy(user);
        systemChangeLogRepository.save(log);
        
        // Thông báo cho người dùng (nếu admin hủy)
        if (!"admin".equals(user.getRole())) {
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setMessage("Đặt sân của bạn đã bị hủy bởi quản trị viên.");
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
        
        // Thông báo cho admin (nếu người dùng hủy)
        if (booking.getUser().getId().equals(user.getId())) {
            List<User> admins = userRepository.findByRole("admin");
            for (User admin : admins) {
                Notification notification = new Notification();
                notification.setUser(admin);
                notification.setMessage("Đặt sân của " + booking.getUser().getFullName() + " đã bị hủy bởi người dùng.");
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }
        }
    }
    
    private void createPaymentForBooking(Booking booking) {
        // Kiểm tra nếu đã có payment
        if (!paymentRepository.findByBookingId(booking.getId()).isEmpty()) {
            return;
        }
        
        // Lấy giá từ TimeSlot
        BigDecimal amount = booking.getTimeSlot().getPrice();
        
        // Áp dụng giảm giá nếu có
        if (booking.getDiscounts() != null && !booking.getDiscounts().isEmpty()) {
            BigDecimal totalDiscountAmount = BigDecimal.ZERO;
            
            for (Discount discount : booking.getDiscounts()) {
                // Kiểm tra voucher có hợp lệ không
                if (discount.getStatus() != Discount.DiscountStatus.ACTIVE) {
                    continue;
                }
                
                BigDecimal discountAmount = BigDecimal.ZERO;
                
                if (discount.getType() == Discount.DiscountType.PERCENTAGE) {
                    // Giảm giá theo phần trăm
                    discountAmount = amount.multiply(discount.getValue()).divide(new BigDecimal(100), 2, BigDecimal.ROUND_HALF_UP);
                    
                    // Áp dụng giới hạn giảm tối đa nếu có
                    if (discount.getMaxDiscountAmount() != null && discountAmount.compareTo(discount.getMaxDiscountAmount()) > 0) {
                        discountAmount = discount.getMaxDiscountAmount();
            }
                } else if (discount.getType() == Discount.DiscountType.FIXED) {
                    // Giảm giá cố định
                    discountAmount = discount.getValue();
                }
                
                totalDiscountAmount = totalDiscountAmount.add(discountAmount);
            }
            
            // Giảm giá không thể vượt quá số tiền gốc
            if (totalDiscountAmount.compareTo(amount) > 0) {
                totalDiscountAmount = amount;
            }
            
            amount = amount.subtract(totalDiscountAmount);
        }
        
        // Tạo payment mới
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod("Chưa chọn");
        
        PaymentStatusType unpaidStatus = new PaymentStatusType();
        unpaidStatus.setId((byte) 1); // 1: Chưa thanh toán
        payment.setPaymentStatus(unpaidStatus);
        
        paymentRepository.save(payment);
    }

    
    private void notifyBookingCreated(Booking booking) {
        // Thông báo cho khách hàng
        String userMessage = "Bạn đã đặt sân #" + booking.getId() + " thành công. ";
        if (isBookingConfirmationRequired()) {
            userMessage += "Vui lòng chờ xác nhận từ quản trị viên.";
        } else {
            userMessage += "Vui lòng tiến hành thanh toán.";
        }
        notificationService.sendNotification(booking.getUser().getId(), userMessage);
        
        // Thông báo cho admin nếu cần xác nhận
        if (isBookingConfirmationRequired()) {
            List<User> admins = userRepository.findByRole("admin");
            for (User admin : admins) {
                notificationService.sendNotification(admin.getId(),
                        "Có yêu cầu đặt sân mới #" + booking.getId() + " từ khách hàng " + booking.getUser().getFullName());
            }
        }
    }
    
    private boolean isBookingConfirmationRequired() {
        return systemConfigRepository.findByConfigKey("BOOKING_CONFIRMATION_REQUIRED")
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(true); // Mặc định là yêu cầu xác nhận
    }
    
    private int getMinBookingHoursInAdvance() {
        return systemConfigRepository.findByConfigKey("MIN_BOOKING_HOURS_IN_ADVANCE")
                .map(config -> Integer.parseInt(config.getConfigValue()))
                .orElse(2); // Mặc định là 2 giờ
    }
    
    @Override
    public boolean isTimeSlotBooked(Integer courtId, Integer timeSlotId, LocalDate date) {
        try {
            // Kiểm tra nếu court không tồn tại
            if (!courtRepository.existsById(courtId)) {
                throw new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId);
            }
            
            // Kiểm tra nếu timeSlot không tồn tại
            if (!timeSlotRepository.existsById(timeSlotId)) {
                throw new ResourceNotFoundException("Không tìm thấy khung giờ với ID: " + timeSlotId);
            }
            
            return bookingRepository.existsByCourtIdAndTimeSlotIdAndBookingDateAndStatusIdNot(
                courtId, 
                timeSlotId, 
                date,
                (byte)3 // ID cho trạng thái "Đã hủy"
            );
        } catch (ResourceNotFoundException e) {
            // Log và rethrow cho loại lỗi này để client xử lý
            throw e;
        } catch (Exception e) {
            // Log lỗi bất ngờ
            e.printStackTrace();
            return false; // Trả về false để an toàn (không cho đặt nếu có lỗi)
        }
    }

    @Override
    public List<Booking> getBookingsByDate(LocalDate date) {
        return bookingRepository.findBookingsByDate(date);
    }

    @Override
    public List<Booking> getBookingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findBookingsBetweenDates(startDate, endDate);
    }

    @Override
    public List<Booking> getBookingsByCourtAndDate(Integer courtId, LocalDate date) {
        return bookingRepository.findBookingsByCourtAndDate(courtId, date);
    }

    @Override
    public Long countConfirmedBookingsByUser(Integer userId) {
        return bookingRepository.countConfirmedBookingsByUser(userId);
    }

    @Override
    public List<Booking> getActiveBookingsByCourtAndDate(Integer courtId, LocalDate date) {
        return bookingRepository.findActiveBookingsByCourtAndDate(courtId, date);
    }

    @Override
    public Booking createBooking(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate) {
        return createBookingWithChannel(userId, courtId, timeSlotId, bookingDate, Booking.BookingChannel.ONLINE, null);
    }

    @Override
    @Transactional
    public Booking createBookingWithChannel(Integer userId, Integer courtId, Integer timeSlotId, LocalDate bookingDate, 
                                          Booking.BookingChannel bookingChannel, Integer counterStaffId) {
        // Lấy thông tin người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Lấy thông tin sân
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));
        
        // Lấy thông tin khung giờ
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ với ID: " + timeSlotId));
        
        // Kiểm tra xem khung giờ và sân có khớp nhau không
        if (!timeSlot.getCourt().getId().equals(court.getId())) {
            throw new IllegalArgumentException("Khung giờ không thuộc sân này");
        }
        
        // Kiểm tra xem khung giờ đã được đặt chưa
        if (isTimeSlotBooked(courtId, timeSlotId, bookingDate)) {
            throw new IllegalArgumentException("Khung giờ này đã được đặt cho ngày " + bookingDate);
        }
        
        // Lấy trạng thái "Chờ xác nhận" (ID = 1)
        BookingStatusType waitingStatus = bookingStatusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Chờ xác nhận'"));
        
        // Tạo booking mới
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(bookingDate);
        booking.setStatus(waitingStatus);
        booking.setCreatedAt(LocalDateTime.now());
        
        // Set booking channel và staff info
        booking.setBookingChannel(bookingChannel);
        booking.setCounterStaffId(counterStaffId);
        
        // Set booking type dựa trên thời gian đặt
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingDateTime = bookingDate.atTime(timeSlot.getStartTime());
        if (bookingDateTime.isBefore(now.plusHours(2))) {
            booking.setBookingType(Booking.BookingType.URGENT);
        } else {
            booking.setBookingType(Booking.BookingType.ADVANCE);
        }
        
        // Lưu booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Tạo invoice tự động cho booking
        try {
            invoiceService.createInvoice(savedBooking.getId());
        } catch (Exception e) {
            // Log lỗi nhưng không làm gián đoạn tạo booking
            System.err.println("Failed to create invoice for booking " + savedBooking.getId() + ": " + e.getMessage());
        }
        
        // Tạo thông báo cho admin
        List<User> admins = userRepository.findByRole("admin");
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setMessage("Có đặt sân mới từ " + user.getFullName() + " đang chờ xác nhận (" + 
                                   bookingChannel.getDescription() + ")");
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
        
        // Tạo thông báo cho người dùng
        Notification userNotification = new Notification();
        userNotification.setUser(user);
        userNotification.setMessage("Đặt sân của bạn đang chờ xác nhận");
        userNotification.setIsRead(false);
        notificationRepository.save(userNotification);
        
        // Ghi log thay đổi
        SystemChangeLog log = new SystemChangeLog();
        log.setTableName("Bookings");
        log.setRecordId(savedBooking.getId());
        log.setChangeType("INSERT");
        log.setChangedFields(String.format(
                "{\"UserId\":\"%d\",\"CourtId\":\"%d\",\"TimeSlotId\":\"%d\",\"BookingDate\":\"%s\",\"BookingChannel\":\"%s\"}",
                userId, courtId, timeSlotId, bookingDate, bookingChannel));
        log.setChangedBy(user);
        systemChangeLogRepository.save(log);
        
        return savedBooking;
    }

    @Override
    public List<BookingDTO> getRecentBookings() {
        List<Booking> bookings = bookingRepository.findFirst10ByOrderByCreatedAtDesc();
        return bookings.stream()
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setCourtName(booking.getCourt().getName());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getTimeSlot().getStartTime().toString());
        dto.setEndTime(booking.getTimeSlot().getEndTime().toString());
        dto.setStatus(booking.getStatus().getId().toString());
        return dto;
    }
    
    // Sync methods không cần thiết nữa vì database triggers sẽ tự động sync
    @Override
    @Transactional
    public void syncPaymentStatusForAllBookings() {
        // Database triggers sẽ tự động sync, method này chỉ để backward compatibility
        System.out.println("Sync không cần thiết - database triggers đã tự động sync CustomerBookingInfo");
    }
    
    @Override
    @Transactional
    public void syncPaymentStatusForBooking(Integer bookingId) {
        // Database triggers sẽ tự động sync, method này chỉ để backward compatibility
        System.out.println("Sync không cần thiết cho booking " + bookingId + " - database triggers đã tự động sync");
    }
} 