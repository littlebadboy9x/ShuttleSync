package com.example.shuttlesync.config;

import com.example.shuttlesync.service.TimeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.logging.Logger;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    private static final Logger logger = Logger.getLogger(SchedulerConfig.class.getName());

    @Autowired
    private TimeSlotService timeSlotService;

    /**
     * Hàm này chạy mỗi phút để kiểm tra và cập nhật trạng thái các khung giờ đã qua
     * Khi một khung giờ đã kết thúc, trạng thái sẽ được đặt lại thành "Trống"
     * Điều này giúp đảm bảo khung giờ được cập nhật gần như ngay lập tức sau khi kết thúc
     */
    @Scheduled(fixedRate = 60 * 1000) // Chạy mỗi phút
    public void resetPastTimeSlots() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        
        logger.info("Bắt đầu kiểm tra và reset khung giờ đã hết hạn vào lúc " + now);
        
        try {
            // Reset trạng thái của các khung giờ đã qua trong ngày hôm nay
            int updatedSlots = timeSlotService.resetExpiredTimeSlots(today, currentTime);
            
            if (updatedSlots > 0) {
                logger.info("Đã reset " + updatedSlots + " khung giờ đã hết hạn vào lúc " + now);
            } else {
                logger.info("Không có khung giờ nào cần reset vào lúc " + now);
            }
        } catch (Exception e) {
            logger.severe("Lỗi khi reset trạng thái khung giờ: " + e.getMessage());
            e.printStackTrace();
            
            // Ghi log thông tin chi tiết về lỗi
            Throwable rootCause = e;
            while (rootCause.getCause() != null) {
                rootCause = rootCause.getCause();
            }
            logger.severe("Nguyên nhân gốc: " + rootCause.getMessage());
        }
    }
} 