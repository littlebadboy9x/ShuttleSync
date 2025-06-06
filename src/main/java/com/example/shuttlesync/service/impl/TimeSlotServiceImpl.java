package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.*;
import com.example.shuttlesync.repository.*;
import com.example.shuttlesync.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final CourtRepository courtRepository;
    private final StatusTypeRepository statusTypeRepository;
    private final TimeSlotConfigRepository timeSlotConfigRepository;
    private final PriceSettingRepository priceSettingRepository;
    private final BookingRepository bookingRepository;
    private final HolidayDateRepository holidayDateRepository;
    private final SystemChangeLogRepository systemChangeLogRepository;
    private final BookingStatusTypeRepository bookingStatusTypeRepository;

    @Override
    public List<TimeSlot> getAllTimeSlotsByCourt(Integer courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));
        return timeSlotRepository.findByCourtOrderBySlotIndexAsc(court);
    }

    @Override
    public List<TimeSlot> getAvailableTimeSlots(Integer courtId, LocalDate date) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));
        
        StatusType trongStatus = statusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        return timeSlotRepository.findAvailableTimeSlotsByCourtAndDate(courtId, date);
    }

    @Override
    public void generateTimeSlots(TimeSlotConfig config, User admin) {
        Integer slotDurationMinutes = config.getSlotDurationMinutes();
        LocalTime startTime = config.getStartTimeFirstSlot();
        LocalTime endTime = config.getEndTimeLastSlot();
        
        List<Court> courts = courtRepository.findAll();
        StatusType trongStatus = statusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        for (Court court : courts) {
            if (!court.getHasFixedTimeSlots()) {
                continue;
            }
            
            LocalTime currentTime = startTime;
            int slotIndex = 1;
            
            while (currentTime.isBefore(endTime)) {
                LocalTime slotEndTime = currentTime.plusMinutes(slotDurationMinutes);
                
                List<TimeSlot> existingSlots = timeSlotRepository.findByCourtAndSlotIndex(court, slotIndex);
                TimeSlot existingSlot = existingSlots.isEmpty() ? null : existingSlots.get(0);
                
                if (existingSlot == null) {
                    // Tạo mới time slot
                    TimeSlot newSlot = new TimeSlot();
                    newSlot.setCourt(court);
                    newSlot.setSlotIndex(slotIndex);
                    newSlot.setStartTime(currentTime);
                    newSlot.setEndTime(slotEndTime);
                    newSlot.setStatus(trongStatus);
                    
                    // Lấy giá mặc định từ PriceSetting
                    String dayType = "weekday"; // Mặc định
                    
                    // Sử dụng giá mặc định
                    newSlot.setPrice(new BigDecimal("200000")); // Giá mặc định nếu không có cấu hình
                    
                    newSlot.setEffectiveDate(LocalDate.now());
                    timeSlotRepository.save(newSlot);
                    
                    // Ghi log thay đổi
                    String changedFields = String.format(
                            "{\"CourtId\":\"%d\",\"SlotIndex\":\"%d\",\"StartTime\":\"%s\",\"EndTime\":\"%s\"}",
                            court.getId(), slotIndex, currentTime, slotEndTime);
                    
                    SystemChangeLog log = new SystemChangeLog();
                    log.setTableName("TimeSlots");
                    log.setRecordId(newSlot.getId());
                    log.setChangeType("INSERT");
                    log.setChangedFields(changedFields);
                    log.setChangedBy(admin);
                    systemChangeLogRepository.save(log);
                } else {
                    // Cập nhật time slot nếu đã tồn tại
                    existingSlot.setStartTime(currentTime);
                    existingSlot.setEndTime(slotEndTime);
                    timeSlotRepository.save(existingSlot);
                }
                
                currentTime = slotEndTime;
                slotIndex++;
            }
        }
    }

    @Override
    public void updateSlotPrice(Integer courtId, Integer slotIndex, LocalDate date) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + courtId));
        
        List<TimeSlot> timeSlots = timeSlotRepository.findByCourtAndSlotIndex(court, slotIndex);
        if (timeSlots.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy khung giờ với index: " + slotIndex);
        }
        
        TimeSlot timeSlot = timeSlots.get(0);
        String dayType = getDayType(date);
        
        // Lấy giá từ PriceSetting hoặc sử dụng giá mặc định nếu không tìm thấy
        BigDecimal price = new BigDecimal("200000"); // Giá mặc định
        
        // Cập nhật giá cho timeSlot
        timeSlot.setPrice(price);
        timeSlot.setEffectiveDate(date);
        timeSlotRepository.save(timeSlot);
    }

    @Override
    public boolean isTimeSlotAvailable(Court court, TimeSlot timeSlot, LocalDate bookingDate) {
        // Kiểm tra xem time slot có ở trạng thái "Trống" không
        StatusType trongStatus = statusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        if (!timeSlot.getStatus().getId().equals(trongStatus.getId())) {
            return false;
        }
        
        // Kiểm tra xem đã có booking nào cho time slot này vào ngày này chưa
        // Sử dụng phương thức isTimeSlotBooked thay vì existsByCourtAndTimeSlotAndBookingDate
        return !bookingRepository.isTimeSlotBooked(court, timeSlot, bookingDate);
    }

    @Override
    public String getDayType(LocalDate date) {
        // Kiểm tra xem ngày có phải là ngày lễ không
        // Sử dụng query thay vì existsByHolidayDate
        boolean isHoliday = false; // Thay bằng logic kiểm tra ngày lễ
        if (isHoliday) {
            return "holiday";
        }
        
        // Kiểm tra xem ngày có phải là cuối tuần không
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return "weekend";
        }
        
        // Nếu không phải cuối tuần hoặc ngày lễ, thì là ngày thường
        return "weekday";
    }
    
    @Override
    public int resetPastTimeSlots(LocalDate date) {
        // Lấy trạng thái "Trống" từ repository
        StatusType trongStatus = statusTypeRepository.findById((byte)1)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        // Tìm tất cả các khung giờ đã đặt cho ngày đã qua
        List<TimeSlot> bookedTimeSlots = timeSlotRepository.findBookedTimeSlotsForDate(date);
        
        int updatedCount = 0;
        
        for (TimeSlot timeSlot : bookedTimeSlots) {
            // Đặt lại trạng thái thành "Trống"
            timeSlot.setStatus(trongStatus);
            timeSlotRepository.save(timeSlot);
            updatedCount++;
        }
        
        return updatedCount;
    }
    
    @Override
    public int resetExpiredTimeSlots(LocalDate date, LocalTime currentTime) {
        try {
            // Lấy trạng thái "Trống" từ repository
            StatusType trongStatus = statusTypeRepository.findById((byte)1)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
            
            // Lấy trạng thái "Đã hoàn thành" cho booking (ID = 4)
            BookingStatusType completedStatus = bookingStatusTypeRepository.findById((byte)4)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Đã hoàn thành'"));
            
            // Tìm tất cả các khung giờ đã kết thúc cho ngày hiện tại, dựa trên các booking đang hoạt động
            List<TimeSlot> expiredTimeSlots = timeSlotRepository.findExpiredTimeSlotsForBookings(date, currentTime);
            
            int updatedCount = 0;
            
            for (TimeSlot timeSlot : expiredTimeSlots) {
                // Tìm và cập nhật trạng thái các booking liên quan
                List<Booking> bookings = bookingRepository.findByCourtAndBookingDateAndTimeSlot(
                        timeSlot.getCourt(), date, timeSlot);
                
                for (Booking booking : bookings) {
                    // Chỉ cập nhật các booking đang ở trạng thái "Chờ xác nhận" (1) hoặc "Đã xác nhận" (2)
                    // Không cập nhật các booking đã ở trạng thái "Đã hủy" (3)
                    if (booking.getStatus().getId() == 1 || booking.getStatus().getId() == 2) {
                        booking.setStatus(completedStatus);
                        bookingRepository.save(booking);
                    }
                }
                
                // Đặt lại trạng thái timeSlot thành "Trống" cho tất cả các slot đã hết hạn
                // bất kể booking ở trạng thái nào
                timeSlot.setStatus(trongStatus);
                timeSlotRepository.save(timeSlot);
                updatedCount++;
            }
            
            return updatedCount;
        } catch (Exception e) {
            // Log lỗi và ném ngoại lệ để xử lý ở tầng trên
            System.err.println("Lỗi khi reset khung giờ hết hạn: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
