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
    
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate = :date")
    List<Invoice> findByDate(@Param("date") LocalDate date);
    
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate >= :startDate AND i.invoiceDate <= :endDate")
    List<Invoice> findBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.booking.court.id = :courtId AND i.invoiceDate = :date")
    List<Invoice> findByCourtAndDate(@Param("courtId") Integer courtId, @Param("date") LocalDate date);
    
    @Query("SELECT i FROM Invoice i WHERE i.booking.user.id = :userId")
    List<Invoice> findByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT i FROM Invoice i WHERE i.booking.user.id = :userId AND i.status = :status")
    List<Invoice> findByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") String status);
} 