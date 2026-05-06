package com.tronhanh.service;

import com.tronhanh.dto.request.LoginRequest;
import com.tronhanh.dto.request.RegisterRequest;
import com.tronhanh.dto.response.AuthResponse;

/**
 * Interface định nghĩa các nghiệp vụ xác thực.
 * Tách interface và implementation theo nguyên tắc DIP (Dependency Inversion).
 */
public interface AuthService {

    /**
     * Đăng ký tài khoản mới.
     *
     * @param request thông tin đăng ký (username, password, role)
     * @return thông tin user vừa tạo
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Đăng nhập và nhận JWT token.
     *
     * @param request thông tin đăng nhập (username, password)
     * @return JWT token và thông tin user
     */
    AuthResponse login(LoginRequest request);
}
