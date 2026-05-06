package com.tronhanh.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO yêu cầu cập nhật hồ sơ cá nhân.
 */
@Data
public class ProfileUpdateRequest {

    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    @Size(max = 255, message = "Link Zalo không được vượt quá 255 ký tự")
    private String zaloUrl;

    @Size(max = 500, message = "Link Avatar không được vượt quá 500 ký tự")
    private String avatarUrl;
}
