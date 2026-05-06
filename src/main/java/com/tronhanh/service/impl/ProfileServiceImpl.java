package com.tronhanh.service.impl;

import com.tronhanh.dto.request.ProfileUpdateRequest;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.entity.User;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.UserRepository;
import com.tronhanh.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

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
