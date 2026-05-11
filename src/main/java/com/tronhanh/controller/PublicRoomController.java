package com.tronhanh.controller;

import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller API công khai — không cần đăng nhập.
 *
 * GET /api/public/rooms/search — tìm kiếm phòng với bộ lọc
 * GET /api/public/rooms/{id}   — xem chi tiết phòng
 *
 * Tất cả dữ liệu trả về kèm lat/lng để render Leaflet Marker.
 */
@RestController
@RequestMapping("/api/public/rooms")
@RequiredArgsConstructor
public class PublicRoomController {

    private final RoomService roomService;

    /**
     * GET /api/public/rooms/search
     *
     * Tìm kiếm phòng trọ. Chỉ trả status=APPROVED và is_hidden=false.
     * Tất cả query params đều optional.
     *
     * ?categoryId=1&minPrice=2000000&maxPrice=5000000&minArea=15&keyword=Bách Khoa&city=Hà Nội
     *
     * keyword tìm trong address VÀ title (LIKE, case-insensitive).
     * city lọc theo tên thành phố trong trường address.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> searchRooms(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean isAvailable) {

        List<RoomResponse> rooms = roomService.searchRooms(
                categoryId, minPrice, maxPrice, minArea, maxArea, keyword, city, isAvailable);

        return ResponseEntity.ok(ApiResponse.success(
                "Tìm thấy " + rooms.size() + " phòng phù hợp", rooms));
    }

    /**
     * GET /api/public/rooms/{id}
     *
     * Xem chi tiết một phòng. Không lọc status — trả về cả PENDING/REJECTED.
     * Frontend tự xử lý hiển thị theo status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomDetail(@PathVariable Long id) {
        RoomResponse room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phòng thành công", room));
    }
}
