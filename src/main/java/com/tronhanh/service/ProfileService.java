package com.tronhanh.service;

import com.tronhanh.dto.request.ProfileUpdateRequest;
import com.tronhanh.dto.response.UserResponse;

/**
 * Service quản lý hồ sơ cá nhân của người dùng đang đăng nhập.
 */
public interface ProfileService {

    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại (dựa vào username từ JWT).
     */
    UserResponse getMyProfile(String username);

    /**
     * Cập nhật thông tin hồ sơ.
     */
    UserResponse updateProfile(String username, ProfileUpdateRequest request);
}
