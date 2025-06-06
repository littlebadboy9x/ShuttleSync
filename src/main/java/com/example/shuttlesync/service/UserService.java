package com.example.shuttlesync.service;

import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User updateUser(Integer id, User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User userToUpdate = existingUser.get();
            userToUpdate.setFullName(user.getFullName());
            userToUpdate.setEmail(user.getEmail());
            userToUpdate.setPhone(user.getPhone());
            userToUpdate.setIsActive(user.getIsActive());
            // Không cập nhật mật khẩu ở đây
            return userRepository.save(userToUpdate);
        }
        throw new RuntimeException("User not found with id: " + id);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public List<User> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // Tìm kiếm theo email, số điện thoại hoặc tên
        List<User> results = userRepository.findByEmailContainingOrPhoneContainingOrFullNameContainingIgnoreCase(
            query, query, query);
        
        return results;
    }

    public User register(User user) {
        // Kiểm tra xem email đã tồn tại chưa
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + user.getEmail());
        }
        
        // Kiểm tra số điện thoại nếu có
        if (user.getPhone() != null && !user.getPhone().isEmpty() 
                && userRepository.findByPhone(user.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already in use: " + user.getPhone());
        }
        
        // Mặc định vai trò là khách hàng nếu không được chỉ định
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("customer");
        }
        
        // Mặc định là active
        user.setIsActive(true);
        
        return userRepository.save(user);
    }

    public User updatePassword(Integer userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Trong thực tế, bạn cần kiểm tra mật khẩu hiện tại
            // và mã hóa mật khẩu mới trước khi lưu
            // Đây chỉ là triển khai đơn giản
            
            user.setPassword(newPassword);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
} 