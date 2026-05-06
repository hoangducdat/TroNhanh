package com.tronhanh.controller;

import com.tronhanh.dto.request.LoginRequest;
import com.tronhanh.dto.request.RegisterRequest;
import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.AuthResponse;
import com.tronhanh.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các yêu cầu xác thực: đăng ký và đăng nhập.
 *
 * Tất cả endpoint trong controller này đều ở /api/public/**
 * → không yêu cầu JWT token (đã cấu hình permitAll trong SecurityConfig)
 */
@RestController
@RequestMapping("/api/public/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/public/auth/register
     *
     * Đăng ký tài khoản mới.
     * Body JSON:
     * {
     *   "username": "user01",
     *   "password": "password123",
     *   "role": "RENTER"        ← RENTER | LANDLORD | ADMIN
     * }
     *
     * Response 201 Created:
     * {
     *   "status": 201,
     *   "message": "Đăng ký thành công",
     *   "data": {
     *     "accessToken": "eyJ...",
     *     "tokenType": "Bearer",
     *     "userId": 1,
     *     "username": "user01",
     *     "role": "RENTER"
     *   }
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký tài khoản thành công", response));
    }

    /**
     * POST /api/public/auth/login
     *
     * Đăng nhập và nhận JWT token.
     * Body JSON:
     * {
     *   "username": "user01",
     *   "password": "password123"
     * }
     *
     * Response 200 OK:
     * {
     *   "status": 200,
     *   "message": "Đăng nhập thành công",
     *   "data": {
     *     "accessToken": "eyJ...",
     *     "tokenType": "Bearer",
     *     "userId": 1,
     *     "username": "user01",
     *     "role": "RENTER"
     *   }
     * }
     *
     * Lỗi 401 nếu sai password.
     * Lỗi 403 nếu tài khoản bị khóa.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }
}
