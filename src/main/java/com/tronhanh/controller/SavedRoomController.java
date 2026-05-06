package com.tronhanh.controller;

import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.SavedRoomResponse;
import com.tronhanh.entity.User;
import com.tronhanh.service.SavedRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý phòng yêu thích của Renter.
 * Tất cả endpoint /api/renter/** → SecurityConfig giới hạn role RENTER.
 *
 * POST   /api/renter/saved-rooms/{roomId} — lưu phòng yêu thích
 * DELETE /api/renter/saved-rooms/{roomId} — bỏ lưu
 * GET    /api/renter/saved-rooms          — xem danh sách đã lưu
 */
@RestController
@RequestMapping("/api/renter/saved-rooms")
@RequiredArgsConstructor
public class SavedRoomController {

    private final SavedRoomService savedRoomService;

    /**
     * POST /api/renter/saved-rooms/{roomId}
     * Lưu phòng vào danh sách yêu thích.
     * Trả 400 nếu đã lưu rồi.
     */
    @PostMapping("/{roomId}")
    public ResponseEntity<ApiResponse<SavedRoomResponse>> saveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal User currentUser) {

        SavedRoomResponse response = savedRoomService.saveRoom(roomId, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đã lưu phòng trọ vào danh sách yêu thích", response));
    }

    /**
     * DELETE /api/renter/saved-rooms/{roomId}
     * Bỏ lưu phòng khỏi danh sách yêu thích.
     * Trả 404 nếu chưa lưu phòng này.
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> unsaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal User currentUser) {

        savedRoomService.unsaveRoom(roomId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phòng khỏi danh sách yêu thích", null));
    }

    /**
     * GET /api/renter/saved-rooms
     * Danh sách phòng đã lưu, kèm thông tin đầy đủ + lat/lng + ảnh.
     * Sắp xếp theo thời gian lưu, mới nhất trước.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedRoomResponse>>> getSavedRooms(
            @AuthenticationPrincipal User currentUser) {

        List<SavedRoomResponse> savedRooms = savedRoomService.getSavedRooms(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách phòng đã lưu thành công (" + savedRooms.size() + " phòng)", savedRooms));
    }
}
