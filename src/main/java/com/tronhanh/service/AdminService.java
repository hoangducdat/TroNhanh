package com.tronhanh.service;

import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.entity.RoomStatus;

import java.util.List;

/**
 * Interface nghiệp vụ quản trị hệ thống dành cho Admin.
 */
public interface AdminService {

    /**
     * Lấy tất cả phòng trọ trong hệ thống (Admin xem toàn bộ).
     *
     * @param status null = lấy tất cả; PENDING/APPROVED/REJECTED = lọc theo trạng thái
     */
    List<RoomResponse> getAllRooms(RoomStatus status);

    /**
     * Cập nhật trạng thái phê duyệt phòng.
     * Chỉ nhận APPROVED hoặc REJECTED — không được set PENDING.
     */
    RoomResponse updateRoomStatus(Long roomId, RoomStatus status);

    /**
     * Xóa phòng vi phạm (Admin có thể xóa bất kỳ phòng nào).
     * Cascade xóa saved_rooms và room_images.
     */
    void deleteRoom(Long roomId);

    /**
     * Toggle khóa/mở khóa tài khoản người dùng.
     * Tài khoản bị khóa không thể đăng nhập.
     */
    UserResponse toggleUserLock(Long userId);

    /**
     * Lấy tất cả người dùng trong hệ thống.
     * Optional filter: ?role=RENTER | LANDLORD | ADMIN
     */
    List<UserResponse> getAllUsers(String role);

    /**
     * Bật/tắt trạng thái còn phòng/hết phòng.
     */
    RoomResponse toggleAvailability(Long roomId);
}
