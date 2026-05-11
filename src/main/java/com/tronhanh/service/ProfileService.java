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

    /**
     * Đổi mật khẩu — kiểm tra mật khẩu hiện tại trước khi lưu mật khẩu mới.
     */
    void changePassword(String username, String currentPassword, String newPassword);

    /**
     * Xóa tài khoản vĩnh viễn — cascade xóa toàn bộ dữ liệu liên quan.
     */
    void deleteAccount(String username);
}
