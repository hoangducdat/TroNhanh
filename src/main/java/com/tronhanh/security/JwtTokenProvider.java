package com.tronhanh.security;

import com.tronhanh.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Component xử lý toàn bộ logic JWT:
 *  1. Tạo token (generateToken)
 *  2. Lấy username từ token (getUsernameFromToken)
 *  3. Xác thực token hợp lệ (validateToken)
 *
 * Sử dụng thư viện JJWT 0.12.x với API mới (Jwts.builder(), parser().verifyWith())
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Autowired
    private AppProperties appProperties;

    // ─────────────────────────────────────────
    //  Lấy SecretKey từ hex string trong config
    //  Keys.hmacShaKeyFor() tự chọn thuật toán HMAC phù hợp (HS256/384/512)
    // ─────────────────────────────────────────
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(appProperties.getJwt().getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT Token từ đối tượng Authentication sau khi đăng nhập thành công.
     *
     * @param authentication đối tượng Authentication từ Spring Security
     * @return chuỗi JWT token đã ký
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return buildToken(userDetails.getUsername());
    }

    /**
     * Tạo JWT Token trực tiếp từ username.
     * Dùng trong trường hợp cần tạo token mà không có Authentication object.
     *
     * @param username tên đăng nhập
     * @return chuỗi JWT token đã ký
     */
    public String generateToken(String username) {
        return buildToken(username);
    }

    /**
     * Logic nội bộ tạo token.
     * - subject: username
     * - issuedAt: thời điểm tạo token
     * - expiration: thời điểm hết hạn = issuedAt + expiration từ config
     * - signWith: ký bằng HMAC-SHA key
     */
    private String buildToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + appProperties.getJwt().getExpiration());

        return Jwts.builder()
                .subject(username)                // Đặt subject = username
                .issuedAt(now)                    // Thời điểm phát hành
                .expiration(expiryDate)           // Thời điểm hết hạn
                .signWith(getSigningKey())         // Ký token
                .compact();                        // Build thành chuỗi compact
    }

    /**
     * Parse token và lấy username (subject) từ claims.
     *
     * @param token JWT token cần parse
     * @return username trong token
     */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Kiểm tra token có hợp lệ không:
     *  - Chữ ký đúng không?
     *  - Token có hết hạn chưa?
     *  - Token có đúng định dạng không?
     *
     * @param token JWT token cần validate
     * @return true nếu token hợp lệ
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token); // Nếu parse thành công → token hợp lệ
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT đã hết hạn: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("JWT không được hỗ trợ: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("JWT sai định dạng: {}", ex.getMessage());
        } catch (SecurityException ex) {
            log.warn("Chữ ký JWT không hợp lệ: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims rỗng: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Parse và verify JWT token, trả về Claims object.
     * Ném JwtException nếu token không hợp lệ.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())   // Xác thực chữ ký với key
                .build()
                .parseSignedClaims(token)      // Parse và verify
                .getPayload();                  // Lấy phần payload (claims)
    }
}
