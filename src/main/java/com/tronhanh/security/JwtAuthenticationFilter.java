package com.tronhanh.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter JWT chạy một lần cho mỗi HTTP request (OncePerRequestFilter).
 *
 * Quy trình xử lý mỗi request:
 *  1. Đọc JWT từ header "Authorization: Bearer <token>"
 *  2. Validate token (chữ ký, hạn sử dụng)
 *  3. Nếu hợp lệ → load UserDetails từ DB → set Authentication vào SecurityContext
 *  4. Nếu không có token hoặc token lỗi → tiếp tục filter chain (SecurityConfig sẽ chặn nếu cần)
 *
 * Filter này KHÔNG ném exception mà chỉ quyết định có set Authentication hay không.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Bước 1: Trích xuất token từ header Authorization
            String token = extractTokenFromRequest(request);

            // Bước 2: Validate token và set Authentication nếu hợp lệ
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {

                // Lấy username từ token đã validate
                String username = jwtTokenProvider.getUsernameFromToken(token);

                // Load thông tin user từ DB (bao gồm role, trạng thái khóa)
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Tạo Authentication object (không cần credentials vì đã có token)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,    // principal: đối tượng UserDetails
                                null,           // credentials: null vì đã xác thực bằng JWT
                                userDetails.getAuthorities() // danh sách quyền (ROLE_ADMIN, ...)
                        );

                // Gắn thông tin request (IP, session ID) vào Authentication
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Đặt Authentication vào SecurityContext — đánh dấu request đã xác thực
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Xác thực thành công cho user: {}", username);
            }
        } catch (Exception ex) {
            // Không ném exception — chỉ log và để request tiếp tục
            // SecurityConfig sẽ trả về 401 nếu endpoint yêu cầu authentication
            log.error("Lỗi khi xử lý JWT Authentication: {}", ex.getMessage());
        }

        // Bước 3: Luôn chuyển request sang filter tiếp theo trong chain
        filterChain.doFilter(request, response);
    }

    /**
     * Trích xuất JWT Token từ header Authorization.
     * Header có định dạng: "Bearer eyJhbGciOiJIUzI1NiJ9..."
     *
     * @param request HTTP request
     * @return chuỗi token nếu header đúng định dạng, null nếu không có
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // Kiểm tra header có giá trị và bắt đầu bằng "Bearer "
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Cắt bỏ 7 ký tự đầu "Bearer " để lấy phần token thuần
            return bearerToken.substring(7);
        }
        return null;
    }
}
