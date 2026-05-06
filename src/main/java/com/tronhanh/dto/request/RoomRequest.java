package com.tronhanh.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu tạo/cập nhật phòng trọ từ client.
 * Gồm đầy đủ thông tin phòng kể cả tọa độ lat/lng cho bản đồ.
 */
@Data
public class RoomRequest {

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 10, max = 255, message = "Tiêu đề phải từ 10 đến 255 ký tự")
    private String title;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @NotNull(message = "Giá thuê không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá thuê phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Giá thuê không hợp lệ")
    private BigDecimal price;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Diện tích phải lớn hơn 0")
    @Digits(integer = 4, fraction = 2, message = "Diện tích không hợp lệ")
    private BigDecimal area;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    /**
     * Vĩ độ (latitude): phạm vi -90.0 đến +90.0
     * Dùng để render Marker trên bản đồ Leaflet.
     */
    @NotNull(message = "Vĩ độ (latitude) không được để trống")
    @DecimalMin(value = "-90.0", message = "Latitude phải >= -90")
    @DecimalMax(value = "90.0", message = "Latitude phải <= 90")
    private BigDecimal latitude;

    /**
     * Kinh độ (longitude): phạm vi -180.0 đến +180.0
     */
    @NotNull(message = "Kinh độ (longitude) không được để trống")
    @DecimalMin(value = "-180.0", message = "Longitude phải >= -180")
    @DecimalMax(value = "180.0", message = "Longitude phải <= 180")
    private BigDecimal longitude;
}
