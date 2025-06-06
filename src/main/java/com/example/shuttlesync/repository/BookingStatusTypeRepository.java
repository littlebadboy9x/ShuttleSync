package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.BookingStatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingStatusTypeRepository extends JpaRepository<BookingStatusType, Byte> {
    Optional<BookingStatusType> findByName(String name);
} 