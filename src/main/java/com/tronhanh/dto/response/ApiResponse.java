package com.tronhanh.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper Response chuẩn cho toàn bộ API của hệ thống TroNhanh.
 * Mọi API đều trả về định dạng:
 * {
 *   "status": 200,
 *   "message": "Thành công",
 *   "data": { ... }
 * }
 *
 * @param <T> Kiểu dữ liệu trả về trong trường "data"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Bỏ qua trường "data" nếu null (ví dụ: response lỗi không cần data)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /** HTTP status code (200, 201, 400, 401, 403, 404, 500, ...) */
    private int status;

    /** Thông báo kết quả (thành công hoặc mô tả lỗi) */
    private String message;

    /** Dữ liệu trả về, generic để tái sử dụng cho mọi loại response */
    private T data;

    // ─────────────────────────────────────────
    //  Static factory methods — tiện dùng trong Controller / ExceptionHandler
    // ─────────────────────────────────────────

    /**
     * Tạo response thành công có kèm data (200 OK).
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Tạo response thành công KHÔNG có data (200 OK).
     * Dùng cho các thao tác như xóa, ẩn, khóa tài khoản.
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .build();
    }

    /**
     * Tạo response thành công khi tạo mới resource (201 Created).
     */
    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .status(201)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Tạo response lỗi (dùng trong @ControllerAdvice).
     *
     * @param status  HTTP status code (400, 401, 403, 404, ...)
     * @param message Thông báo lỗi
     */
    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .build();
    }
}
