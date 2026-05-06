package com.tronhanh.dto.request;

import com.tronhanh.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO nhận dữ liệu đăng ký tài khoản mới.
 * Validation được thực hiện tại Controller với @Valid.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;

    /**
     * Vai trò đăng ký: RENTER | LANDLORD | ADMIN.
     * Client gửi lên dưới dạng chuỗi, Spring tự convert sang enum.
     */
    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
