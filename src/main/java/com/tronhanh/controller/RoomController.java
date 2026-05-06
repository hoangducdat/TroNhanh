package com.tronhanh.controller;

import com.tronhanh.dto.request.RoomRequest;
import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.entity.User;
import com.tronhanh.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller quản lý phòng trọ của Landlord.
 * Tất cả endpoint /api/landlord/** → SecurityConfig giới hạn role LANDLORD.
 *
 * ID Landlord lấy từ JWT token qua @AuthenticationPrincipal — không thể giả mạo.
 */
@RestController
@RequestMapping("/api/landlord/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    /** POST /api/landlord/rooms — Tạo phòng mới (status=PENDING) */
    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal User currentUser) {

        RoomResponse response = roomService.createRoom(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng tin thành công. Tin đang chờ Admin phê duyệt", response));
    }

    /** GET /api/landlord/rooms — Danh sách phòng của Landlord đang đăng nhập */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getMyRooms(
            @AuthenticationPrincipal User currentUser) {

        List<RoomResponse> rooms = roomService.getRoomsByLandlord(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng thành công", rooms));
    }

    /**
     * PUT /api/landlord/rooms/{id} — Sửa phòng (kiểm tra ownership).
     * Phòng REJECTED → tự động reset về PENDING sau khi sửa.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal User currentUser) {

        RoomResponse response = roomService.updateRoom(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", response));
    }

    /** PATCH /api/landlord/rooms/{id}/hide — Toggle ẩn/hiện tin */
    @PatchMapping("/{id}/hide")
    public ResponseEntity<ApiResponse<RoomResponse>> toggleHideRoom(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        RoomResponse response = roomService.toggleHideRoom(id, currentUser.getId());
        String message = response.isHidden() ? "Đã ẩn tin thành công" : "Đã hiện tin thành công";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * DELETE /api/landlord/rooms/{id} — Xóa tin (kiểm tra ownership).
     * Cascade xóa saved_rooms và room_images. Không khôi phục được.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        roomService.deleteRoom(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tin đăng thành công", null));
    }

    /**
     * POST /api/landlord/rooms/{id}/images — Upload nhiều ảnh (multipart/form-data).
     *
     * Ví dụ curl:
     *   curl -X POST .../api/landlord/rooms/1/images \
     *        -H "Authorization: Bearer {token}" \
     *        -F "files=@photo1.jpg" -F "files=@photo2.jpg"
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RoomResponse>> uploadImages(
            @PathVariable Long id,
            @RequestPart("files") List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser) {

        RoomResponse response = roomService.uploadRoomImages(id, files, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(
                "Upload " + files.size() + " ảnh thành công", response));
    }

    /** PATCH /api/landlord/rooms/{id}/availability — Toggle Còn phòng / Hết phòng */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<RoomResponse>> toggleAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        RoomResponse response = roomService.toggleAvailability(id, currentUser.getId());
        String message = response.isAvailable() ? "Đã chuyển sang CÒN PHÒNG" : "Đã chuyển sang HẾT PHÒNG";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
