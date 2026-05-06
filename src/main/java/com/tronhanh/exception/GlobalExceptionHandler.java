package com.tronhanh.exception;

import com.tronhanh.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Xử lý ngoại lệ tập trung cho toàn bộ ứng dụng.
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
 * Mọi Exception ném ra từ bất kỳ Controller nào đều được bắt tại đây,
 * trả về ApiResponse chuẩn thay vì trang lỗi HTML mặc định của Spring.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────
    //  1. Lỗi validation từ @Valid / @Validated
    //     Ví dụ: field bắt buộc bỏ trống, email sai định dạng
    // ─────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        // Thu thập tất cả lỗi validation theo từng field
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(fieldName, message);
        });

        log.warn("Validation failed: {}", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, "Dữ liệu đầu vào không hợp lệ"));
        // Trả thêm chi tiết lỗi trong data nếu cần:
        // .body(new ApiResponse<>(400, "Dữ liệu không hợp lệ", errors));
    }

    // ─────────────────────────────────────────
    //  2. Không tìm thấy resource (404)
    // ─────────────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, ex.getMessage()));
    }

    // ─────────────────────────────────────────
    //  3. Vi phạm quyền sở hữu resource (403)
    // ─────────────────────────────────────────
    @ExceptionHandler(ResourceForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ResourceForbiddenException ex) {
        log.warn("Forbidden access: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, ex.getMessage()));
    }

    // ─────────────────────────────────────────
    //  4. Lỗi nghiệp vụ chung (400)
    // ─────────────────────────────────────────
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, ex.getMessage()));
    }

    // ─────────────────────────────────────────
    //  5. Sai username/password khi đăng nhập (401)
    // ─────────────────────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: bad credentials");
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, "Tên đăng nhập hoặc mật khẩu không đúng"));
    }

    // ─────────────────────────────────────────
    //  6. Tài khoản bị khóa khi đăng nhập (403)
    // ─────────────────────────────────────────
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLocked(LockedException ex) {
        log.warn("Authentication failed: account locked");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin"));
    }

    // ─────────────────────────────────────────
    //  7. Không có quyền truy cập endpoint (403)
    //     Spring Security ném ra khi token hợp lệ nhưng sai role
    // ─────────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "Bạn không có quyền thực hiện hành động này"));
    }

    // ─────────────────────────────────────────
    //  8. Mọi exception không được xử lý ở trên (500)
    //     Luôn để handler này ở cuối cùng
    // ─────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        // Log đầy đủ stack trace để debug, không trả về stack trace cho client
        log.error("Unexpected error occurred", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau"));
    }
}
