package com.tronhanh.dto.response;

import com.tronhanh.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về thông tin người dùng cho Admin.
 * Không chứa password.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private Role role;

    /** true = tài khoản đang bị khóa */
    private boolean isLocked;

    private String fullName;
    private String phone;
    private String zaloUrl;
    private String avatarUrl;
}
