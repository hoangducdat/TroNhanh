package com.tronhanh.service.impl;

import com.tronhanh.dto.request.ProfileUpdateRequest;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.entity.User;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.RoomRepository;
import com.tronhanh.repository.SavedRoomRepository;
import com.tronhanh.repository.UserRepository;
import com.tronhanh.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SavedRoomRepository savedRoomRepository;
    private final RoomRepository roomRepository;

    @Override
    public UserResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setZaloUrl(request.getZaloUrl());
        user.setAvatarUrl(request.getAvatarUrl());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngườị dùng"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("User {} đã đổi mật khẩu thành công", username);
    }

    @Override
    @Transactional
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngườị dùng"));

        // Xóa saved_rooms của user này (ngườị thuê đã lưu)
        savedRoomRepository.deleteByUserId(user.getId());
        // Xóa saved_rooms của các phòng thuộc user này (landlord)
        savedRoomRepository.deleteByRoomLandlordId(user.getId());
        // Xóa tài khoản (cascade xóa room được set ở @OneToMany)
        userRepository.delete(user);
        log.info("Tài khoản {} đã bị xóa", username);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .isLocked(user.isLocked())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .zaloUrl(user.getZaloUrl())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
