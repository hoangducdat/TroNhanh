package com.tronhanh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném ra khi người dùng cố truy cập/chỉnh sửa resource không thuộc quyền của mình.
 * Ví dụ: Landlord cố sửa phòng của Landlord khác.
 * → HTTP 403 Forbidden
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ResourceForbiddenException extends RuntimeException {

    public ResourceForbiddenException(String message) {
        super(message);
    }
}
