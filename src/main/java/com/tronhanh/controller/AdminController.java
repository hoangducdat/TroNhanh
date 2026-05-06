package com.tronhanh.controller;

import com.tronhanh.dto.request.RoomStatusRequest;
import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.entity.RoomStatus;
import com.tronhanh.exception.BadRequestException;
import com.tronhanh.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản trị hệ thống dành cho Admin.
 * Tất cả endpoint /api/admin/** → SecurityConfig giới hạn role ADMIN.
 *
 * GET    /api/admin/rooms              — xem tất cả phòng (optional ?status=PENDING)
 * PUT    /api/admin/rooms/{id}/status  — duyệt (APPROVED) hoặc từ chối (REJECTED)
 * DELETE /api/admin/rooms/{id}         — xóa tin vi phạm
 * PATCH  /api/admin/users/{id}/lock    — khóa/mở khóa tài khoản
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/rooms
     * Lấy tất cả phòng trong hệ thống.
     * Optional filter: ?status=PENDING | APPROVED | REJECTED
     *
     * Ví dụ: GET /api/admin/rooms?status=PENDING → chỉ trả phòng chờ duyệt
     */
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms(
            @RequestParam(required = false) RoomStatus status) {

        List<RoomResponse> rooms = adminService.getAllRooms(status);
        String message = status == null
                ? "Lấy tất cả phòng thành công (" + rooms.size() + " phòng)"
                : "Lấy danh sách phòng " + status.name() + " thành công (" + rooms.size() + " phòng)";
        return ResponseEntity.ok(ApiResponse.success(message, rooms));
    }

    /**
     * PUT /api/admin/rooms/{id}/status
     * Duyệt hoặc từ chối phòng. Chỉ nhận APPROVED hoặc REJECTED.
     *
     * Body: { "status": "APPROVED" }  hoặc  { "status": "REJECTED" }
     */
    @PutMapping("/rooms/{id}/status")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoomStatus(
            @PathVariable Long id,
            @Valid @RequestBody RoomStatusRequest request) {

        if (request.getStatus() == RoomStatus.PENDING) {
            throw new BadRequestException(
                    "Admin không thể đặt trạng thái PENDING. Chỉ dùng APPROVED hoặc REJECTED");
        }

        RoomResponse response = adminService.updateRoomStatus(id, request.getStatus());
        String message = request.getStatus() == RoomStatus.APPROVED
                ? "Đã duyệt phòng thành công"
                : "Đã từ chối phòng thành công";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * DELETE /api/admin/rooms/{id}
     * Xóa phòng vi phạm. Admin có thể xóa bất kỳ phòng nào.
     * Cascade xóa saved_rooms và room_images.
     */
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        adminService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phòng vi phạm thành công", null));
    }

    /**
     * GET /api/admin/users
     * Lấy danh sách tất cả người dùng. Optional filter: ?role=RENTER|LANDLORD|ADMIN
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String role) {
        List<UserResponse> users = adminService.getAllUsers(role);
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách người dùng thành công (" + users.size() + " người dùng)", users));
    }

    /**
     * PATCH /api/admin/users/{id}/lock
     * Toggle khóa/mở khóa tài khoản. Tài khoản bị khóa không thể đăng nhập.
     * Không cần body — action là toggle trạng thái hiện tại.
     */
    @PatchMapping("/users/{id}/lock")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserLock(@PathVariable Long id) {
        UserResponse response = adminService.toggleUserLock(id);
        String message = response.isLocked()
                ? "Đã khóa tài khoản người dùng thành công"
                : "Đã mở khóa tài khoản người dùng thành công";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * PATCH /api/admin/rooms/{id}/availability
     * Toggle trạng thái Còn phòng / Hết phòng.
     */
    @PatchMapping("/rooms/{id}/availability")
    public ResponseEntity<ApiResponse<RoomResponse>> toggleAvailability(@PathVariable Long id) {
        RoomResponse response = adminService.toggleAvailability(id);
        String message = response.isAvailable() ? "Đã chuyển sang CÒN PHÒNG" : "Đã chuyển sang HẾT PHÒNG";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
