package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.StatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusTypeRepository extends JpaRepository<StatusType, Byte> {
    Optional<StatusType> findByName(String name);
} 