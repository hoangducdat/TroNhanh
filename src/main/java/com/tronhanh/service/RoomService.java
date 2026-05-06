package com.tronhanh.service;

import com.tronhanh.dto.request.RoomRequest;
import com.tronhanh.dto.response.RoomResponse;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

/**
 * Interface định nghĩa nghiệp vụ quản lý phòng trọ.
 */
public interface RoomService {

    /**
     * Tìm kiếm phòng trọ công khai (Public Search).
     * Chỉ trả phòng status=APPROVED và is_hidden=false.
     * Mọi tham số đều optional — null = bỏ qua điều kiện.
     *
     * @param keyword tìm theo địa chỉ HOẶC tiêu đề (LIKE, case-insensitive)
     */
    List<RoomResponse> searchRooms(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                   BigDecimal minArea, BigDecimal maxArea, String keyword);

    /** Lấy chi tiết một phòng theo ID (public — không lọc status) */
    RoomResponse getRoomById(Long roomId);

    /** Tạo phòng mới — status=PENDING, is_hidden=false */
    RoomResponse createRoom(RoomRequest request, Long landlordId);

    /** Lấy danh sách phòng của một Landlord (mọi trạng thái) */
    List<RoomResponse> getRoomsByLandlord(Long landlordId);

    /**
     * Cập nhật thông tin phòng.
     * Kiểm tra ownership — chỉ Landlord sở hữu mới được sửa.
     * Nếu phòng đang REJECTED → tự động reset về PENDING.
     */
    RoomResponse updateRoom(Long roomId, RoomRequest request, Long landlordId);

    /**
     * Toggle is_hidden (ẩn/hiện tin).
     * Kiểm tra ownership.
     */
    RoomResponse toggleHideRoom(Long roomId, Long landlordId);

    /**
     * Xóa phòng của Landlord.
     * Kiểm tra ownership — chỉ Landlord sở hữu mới được xóa.
     * Cascade xóa saved_rooms và room_images liên quan.
     */
    void deleteRoom(Long roomId, Long landlordId);

    /**
     * Upload nhiều ảnh cho phòng.
     * Kiểm tra ownership.
     */
    RoomResponse uploadRoomImages(Long roomId, List<MultipartFile> files, Long landlordId);

    /**
     * Bật/tắt trạng thái còn phòng/hết phòng.
     * Kiểm tra ownership.
     */
    RoomResponse toggleAvailability(Long roomId, Long landlordId);
}
