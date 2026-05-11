package com.tronhanh.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tronhanh.entity.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO trả về thông tin phòng trọ cho client.
 *
 * Bao gồm:
 *  - Thông tin cơ bản của phòng
 *  - Tọa độ lat/lng để render Leaflet Marker
 *  - Danh sách URL ảnh
 *  - Thông tin Landlord và Category (flatten, không nest object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private Long id;

    // ── Thông tin Landlord (flatten để client dùng tiện) ──
    private Long landlordId;
    private String landlordUsername;
    private String landlordPhone;
    private String landlordZaloUrl;
    private String landlordAvatarUrl;

    // ── Thông tin Category ──
    private Long categoryId;
    private String categoryName;

    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal area;
    private String address;

    // ── Tọa độ bản đồ ──
    private BigDecimal latitude;
    private BigDecimal longitude;

    // ── Trạng thái phê duyệt: PENDING | APPROVED | REJECTED ──
    private RoomStatus status;

    // ── Trạng thái ẩn (do Landlord tự ẩn/hiện) ──
    @JsonProperty("isHidden")
    private boolean isHidden;

    // ── Trạng thái còn phòng / hết phòng ──
    @JsonProperty("isAvailable")
    private boolean isAvailable;

    /**
     * Danh sách URL ảnh đầy đủ.
     * Ví dụ: ["http://localhost:8080/uploads/rooms/1/abc.jpg", ...]
     * Client dùng trực tiếp trong thẻ <img> hoặc Leaflet Popup.
     */
    private List<String> imageUrls;
}
