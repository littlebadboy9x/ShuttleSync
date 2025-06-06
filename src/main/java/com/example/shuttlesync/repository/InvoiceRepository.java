package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    
    Invoice findByBookingId(Integer bookingId);
    
    List<Invoice> findByStatus(String status);
    
    @Query(value = "SELECT * FROM Invoices WHERE CONVERT(DATE, InvoiceDate) = CONVERT(DATE, :date)", nativeQuery = true)
    List<Invoice> findByDate(@Param("date") LocalDate date);
    
    @Query(value = "SELECT * FROM Invoices WHERE CONVERT(DATE, InvoiceDate) >= CONVERT(DATE, :startDate) AND CONVERT(DATE, InvoiceDate) <= CONVERT(DATE, :endDate)", nativeQuery = true)
    List<Invoice> findBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query(value = "SELECT i.* FROM Invoices i JOIN Bookings b ON i.BookingId = b.Id JOIN Courts c ON b.CourtId = c.Id WHERE c.Id = :courtId AND CONVERT(DATE, i.InvoiceDate) = CONVERT(DATE, :date)", nativeQuery = true)
    List<Invoice> findByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);
    
    @Query(value = "SELECT i.* FROM Invoices i JOIN Bookings b ON i.BookingId = b.Id WHERE b.UserId = :userId", nativeQuery = true)
    List<Invoice> findByUserId(@Param("userId") Integer userId);
    
    @Query(value = "SELECT i.* FROM Invoices i JOIN Bookings b ON i.BookingId = b.Id WHERE b.UserId = :userId AND i.Status = :status", nativeQuery = true)
    List<Invoice> findByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") String status);
} 