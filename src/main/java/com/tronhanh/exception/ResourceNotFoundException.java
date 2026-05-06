package com.tronhanh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném ra khi không tìm thấy resource trong DB.
 * Ví dụ: tìm phòng theo ID không tồn tại.
 * → HTTP 404 Not Found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("Không tìm thấy %s với id = %d", resourceName, id));
    }

    public ResourceNotFoundException(String resourceName, String identifier) {
        super(String.format("Không tìm thấy %s với định danh = %s", resourceName, identifier));
    }
}
