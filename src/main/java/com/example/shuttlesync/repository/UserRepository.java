package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);

    List<User> findByRole(String role);

    Boolean existsByEmail(String email);
    
    Boolean existsByPhone(String phone);
    
    List<User> findByEmailContainingOrPhoneContainingOrFullNameContainingIgnoreCase(
        String email, String phone, String fullName);
}