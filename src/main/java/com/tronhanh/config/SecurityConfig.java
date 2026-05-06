package com.tronhanh.config;

import com.tronhanh.security.JwtAuthenticationFilter;
import com.tronhanh.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình Spring Security cho toàn bộ ứng dụng.
 *
 * Kiến trúc bảo mật:
 * - Stateless: không dùng Session, mỗi request tự chứng minh danh tính qua JWT
 * - CSRF disabled: không cần thiết với REST API stateless
 * - Filter: JwtAuthenticationFilter chạy TRƯỚC
 * UsernamePasswordAuthenticationFilter
 *
 * Phân quyền endpoint:
 * - /api/public/** → Tất cả (kể cả chưa đăng nhập)
 * - /api/admin/** → Chỉ ADMIN
 * - /api/landlord/** → Chỉ LANDLORD
 * - Còn lại → Phải đăng nhập (authenticated)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize trên method nếu cần
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Cấu hình SecurityFilterChain — trái tim của Spring Security.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ── Tắt CSRF: REST API stateless không cần CSRF token ──
                .csrf(AbstractHttpConfigurer::disable)

                // ── Cấu hình CORS: cho phép frontend gọi API ──
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ── Phân quyền theo URL ──
                .authorizeHttpRequests(auth -> auth

                        // Public: đăng ký, đăng nhập, tìm kiếm, xem chi tiết
                        .requestMatchers("/api/public/**").permitAll()

                        // Serve file ảnh tĩnh — không cần đăng nhập
                        .requestMatchers("/uploads/**").permitAll()

                        // Chỉ ADMIN mới vào được /api/admin/**
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Chỉ LANDLORD mới vào được /api/landlord/**
                        .requestMatchers("/api/landlord/**").hasRole("LANDLORD")

                        // Mọi request còn lại phải đăng nhập
                        .anyRequest().authenticated())

                // ── Stateless: không tạo/sử dụng HTTP Session ──
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ── Đăng ký AuthenticationProvider ──
                .authenticationProvider(authenticationProvider())

                // ── Thêm JWT Filter trước filter mặc định của Spring Security ──
                // JwtAuthenticationFilter chạy trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * AuthenticationProvider: kết nối UserDetailsService + PasswordEncoder.
     * DaoAuthenticationProvider tự động:
     * 1. Load UserDetails từ DB qua UserDetailsService
     * 2. So sánh password với BCrypt
     * 3. Kiểm tra account non-locked, non-expired
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager: dùng trong AuthService để thực hiện authenticate().
     * Spring Boot 3 yêu cầu expose bean này thủ công.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCryptPasswordEncoder — thuật toán hash password mạnh và phổ biến.
     * Strength mặc định = 10 (2^10 = 1024 vòng lặp, đủ an toàn).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình CORS để frontend (React, Vue...) có thể gọi API.
     * Trong môi trường Production, nên thay "*" bằng domain cụ thể.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép tất cả origin trong môi trường Dev
        // Production: config.setAllowedOrigins(List.of("https://yourdomain.com"));
        config.setAllowedOriginPatterns(List.of("*"));

        // Cho phép tất cả HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép tất cả headers (bao gồm Authorization)
        config.setAllowedHeaders(List.of("*"));

        // Cho phép gửi credentials (cookie, Authorization header)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
