package com.tronhanh.dto.response;

import com.tronhanh.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về sau khi đăng nhập thành công.
 * Client sẽ lưu accessToken vào localStorage/cookie để gửi kèm các request tiếp theo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** JWT Token — client gắn vào header: Authorization: Bearer <token> */
    private String accessToken;

    /** Loại token, luôn là "Bearer" */
    @Builder.Default
    private String tokenType = "Bearer";

    /** ID người dùng */
    private Long userId;

    /** Tên đăng nhập */
    private String username;

    /** Vai trò: ADMIN | LANDLORD | RENTER */
    private Role role;
}
