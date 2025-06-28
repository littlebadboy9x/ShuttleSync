package com.example.shuttlesync.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherAutoGiftService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Tự động kiểm tra và tặng voucher cho tất cả khách hàng (chạy mỗi 10 phút)
     */
    @Scheduled(fixedRate = 600000) // 1 phút
    public void autoGiftVouchersForAllCustomers() {
        try {
            log.info("[AUTO-GIFT] Bắt đầu kiểm tra và tặng voucher tự động...");

            String getUsersSql = """
                SELECT DISTINCT u.Id, u.Email, u.FullName,
                       COUNT(b.Id) as TotalBookings,
                       COUNT(CASE WHEN b.Status IN (2, 4) THEN 1 END) as EligibleBookings
                FROM Users u
                JOIN Bookings b ON u.Id = b.UserId
                WHERE u.Role = 'CUSTOMER'
                GROUP BY u.Id, u.Email, u.FullName
                HAVING COUNT(CASE WHEN b.Status IN (2, 4) THEN 1 END) > 0
                ORDER BY EligibleBookings DESC
                """;

            List<Map<String, Object>> customers = jdbcTemplate.queryForList(getUsersSql);
            
            log.info("[AUTO-GIFT] Tìm thấy {} khách hàng có booking", customers.size());

            int totalVouchersGifted = 0;
            int customersProcessed = 0;

            for (Map<String, Object> customer : customers) {
                Integer userId = (Integer) customer.get("Id");
                String email = (String) customer.get("Email");
                Integer eligibleBookings = (Integer) customer.get("EligibleBookings");

                int vouchersGifted = processCustomerVouchers(userId, email, eligibleBookings);
                
                if (vouchersGifted > 0) {
                    totalVouchersGifted += vouchersGifted;
                    customersProcessed++;
                    log.info("[AUTO-GIFT] Tặng {} voucher cho {}", vouchersGifted, email);
                }
            }

            log.info("[AUTO-GIFT] Hoàn thành: Tặng {} voucher cho {} khách hàng", 
                    totalVouchersGifted, customersProcessed);

        } catch (Exception e) {
            log.error("[AUTO-GIFT] Lỗi khi tự động tặng voucher: {}", e.getMessage(), e);
        }
    }

    private int processCustomerVouchers(Integer userId, String email, Integer eligibleBookings) {
        try {
            String findMissingVouchersSql = """
                SELECT d.Id, d.Code, d.Name, d.RequiredBookingCount
                FROM Discounts d
                WHERE d.VoucherType = 'PERSONAL'
                AND d.Status = 'ACTIVE'
                AND d.RequiredBookingCount <= ?
                AND d.Id NOT IN (
                    SELECT VoucherId 
                    FROM PersonalVouchers 
                    WHERE UserId = ?
                )
                ORDER BY d.RequiredBookingCount
                """;

            List<Map<String, Object>> missingVouchers = jdbcTemplate.queryForList(
                findMissingVouchersSql, eligibleBookings, userId);

            if (missingVouchers.isEmpty()) {
                return 0;
            }

            for (Map<String, Object> voucher : missingVouchers) {
                Integer voucherId = (Integer) voucher.get("Id");
                String code = (String) voucher.get("Code");
                String name = (String) voucher.get("Name");

                String insertVoucherSql = """
                    INSERT INTO PersonalVouchers (UserId, VoucherId, IsUsed, EmailSent)
                    VALUES (?, ?, 0, 0)
                    """;
                
                jdbcTemplate.update(insertVoucherSql, userId, voucherId);

                String insertEmailSql = """
                    INSERT INTO EmailLogs (ToEmail, Subject, Body, Status, RelatedType, RelatedId)
                    VALUES (?, ?, ?, 'PENDING', 'VOUCHER', ?)
                    """;

                String subject = "🎉 Bạn đã nhận được voucher đặc biệt từ ShuttleSync";
                String body = String.format("Voucher %s - Code: %s", name, code);

                jdbcTemplate.update(insertEmailSql, email, subject, body, voucherId);

                log.info("[AUTO-GIFT] Tặng voucher {} cho {}", code, email);
            }

            return missingVouchers.size();

        } catch (Exception e) {
            log.error("[AUTO-GIFT] Lỗi khi xử lý voucher cho user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    public int giftVouchersForCustomer(String email) {
        try {
            String sql = """
                SELECT u.Id, COUNT(CASE WHEN b.Status IN (2, 4) THEN 1 END) as EligibleBookings
                FROM Users u
                LEFT JOIN Bookings b ON u.Id = b.UserId
                WHERE u.Email = ?
                GROUP BY u.Id
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, email);
            
            if (results.isEmpty()) {
                return 0;
            }

            Integer userId = (Integer) results.get(0).get("Id");
            Integer eligibleBookings = (Integer) results.get(0).get("EligibleBookings");

            return processCustomerVouchers(userId, email, eligibleBookings);

        } catch (Exception e) {
            log.error("[MANUAL] Lỗi khi tặng voucher thủ công: {}", e.getMessage());
            return 0;
        }
    }
} 