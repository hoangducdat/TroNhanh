package com.tronhanh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném ra khi dữ liệu đầu vào vi phạm ràng buộc nghiệp vụ.
 * Ví dụ: username đã tồn tại khi đăng ký.
 * → HTTP 400 Bad Request
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
