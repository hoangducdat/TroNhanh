package com.tronhanh.service.impl;

import com.tronhanh.dto.request.LoginRequest;
import com.tronhanh.dto.request.RegisterRequest;
import com.tronhanh.dto.response.AuthResponse;
import com.tronhanh.entity.User;
import com.tronhanh.exception.BadRequestException;
import com.tronhanh.repository.UserRepository;
import com.tronhanh.security.JwtTokenProvider;
import com.tronhanh.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation của AuthService.
 * Xử lý logic đăng ký và đăng nhập.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Đăng ký tài khoản mới.
     *
     * Quy trình:
     * 1. Kiểm tra username đã tồn tại chưa
     * 2. Hash password bằng BCrypt
     * 3. Lưu User vào DB
     * 4. Tạo JWT token và trả về
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Bước 1: Kiểm tra trùng username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException(
                    "Tên đăng nhập '" + request.getUsername() + "' đã được sử dụng");
        }

        // Bước 2 & 3: Tạo và lưu User mới
        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Hash password
                .role(request.getRole())
                .isLocked(false) // Tài khoản mặc định không bị khóa
                .build();

        User savedUser = userRepository.save(newUser);
        if (savedUser == null) {
            throw new IllegalStateException("Lỗi hệ thống: không thể lưu người dùng vào cơ sở dữ liệu");
        }
        log.info("Đăng ký thành công: username={}, role={}", savedUser.getUsername(), savedUser.getRole());

        // Bước 4: Tạo JWT token ngay sau khi đăng ký (auto-login)
        String token = jwtTokenProvider.generateToken(savedUser.getUsername());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .build();
    }

    /**
     * Đăng nhập và trả về JWT token.
     *
     * Quy trình:
     * 1. Gọi AuthenticationManager.authenticate() — Spring Security tự động:
     * a. Load user từ DB qua UserDetailsService
     * b. So sánh password với BCrypt
     * c. Kiểm tra tài khoản không bị khóa
     * 2. Nếu authenticate thành công → tạo JWT token
     * 3. Trả về token kèm thông tin user
     *
     * Nếu sai password → Spring ném BadCredentialsException
     * Nếu tài khoản khóa → Spring ném LockedException
     * Hai exception này đã được xử lý trong GlobalExceptionHandler
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // Bước 1: Xác thực thông qua Spring Security
        // AuthenticationManager sẽ gọi DaoAuthenticationProvider
        // → UserDetailsServiceImpl.loadUserByUsername()
        // → BCrypt.matches(rawPassword, hashedPassword)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        // Bước 2: Lấy UserDetails từ Authentication object
        User user = (User) authentication.getPrincipal();
        log.info("Đăng nhập thành công: username={}, role={}", user.getUsername(), user.getRole());

        // Bước 3: Tạo JWT token từ Authentication
        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
