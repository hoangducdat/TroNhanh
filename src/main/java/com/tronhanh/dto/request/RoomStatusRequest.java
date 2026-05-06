package com.tronhanh.dto.request;

import com.tronhanh.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO nhận yêu cầu cập nhật trạng thái phê duyệt phòng trọ từ Admin.
 * Chỉ cho phép 2 giá trị: APPROVED hoặc REJECTED (không cho PENDING).
 */
@Data
public class RoomStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private RoomStatus status;
}
