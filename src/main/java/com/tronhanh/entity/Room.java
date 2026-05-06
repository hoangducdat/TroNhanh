package com.tronhanh.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Entity ánh xạ bảng `rooms` — trung tâm của hệ thống.
 *
 * Quan hệ:
 *  - N-1 với User (landlord): nhiều phòng thuộc về 1 chủ trọ
 *  - N-1 với Category: nhiều phòng thuộc 1 danh mục
 *  - 1-N với RoomImage: 1 phòng có nhiều ảnh
 *  - 1-N với SavedRoom: 1 phòng được nhiều người lưu
 *
 * Tọa độ lat/lng dùng kiểu DECIMAL để lưu chính xác cao,
 * tránh lỗi làm tròn của FLOAT/DOUBLE.
 */
@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"images", "savedRooms"})
@EqualsAndHashCode(exclude = {"images", "savedRooms"})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─────────────────────────────────────────
    //  Quan hệ N-1: Room → User (Landlord)
    //  @JoinColumn: tên cột FK trong bảng rooms
    //  LAZY: không auto-load User khi query Room
    // ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    // ─────────────────────────────────────────
    //  Quan hệ N-1: Room → Category
    // ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** Tiêu đề bài đăng — ví dụ: "Phòng trọ giá rẻ gần ĐH Bách Khoa" */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Mô tả chi tiết phòng — dùng TEXT để không bị giới hạn 255 ký tự.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Giá thuê hàng tháng (VNĐ).
     * Dùng BigDecimal để tránh lỗi làm tròn tiền tệ.
     * DECIMAL(12,2): tối đa 12 chữ số, 2 số thập phân (ví dụ: 9,999,999.99)
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /**
     * Diện tích phòng (m²).
     * DECIMAL(6,2): tối đa 6 chữ số, 2 thập phân (ví dụ: 9999.99 m²)
     */
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal area;

    /** Địa chỉ văn bản của phòng trọ */
    @Column(nullable = false, length = 500)
    private String address;

    // ─────────────────────────────────────────
    //  Tọa độ địa lý cho bản đồ Leaflet
    //  DECIMAL(10,8): -90.00000000 đến 90.00000000 (độ chính xác ~1mm)
    //  DECIMAL(11,8): -180.00000000 đến 180.00000000
    // ─────────────────────────────────────────

    /** Vĩ độ (latitude): phạm vi -90 đến +90 */
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    /** Kinh độ (longitude): phạm vi -180 đến +180 */
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    /**
     * Trạng thái phê duyệt: PENDING | APPROVED | REJECTED.
     * Phòng mới tạo mặc định là PENDING, Admin sẽ duyệt sau.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RoomStatus status = RoomStatus.PENDING;

    /**
     * Trạng thái ẩn/hiện tin của Landlord.
     * true = Landlord chủ động ẩn tin (dù đã APPROVED cũng không hiển thị).
     */
    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean isHidden = false;

    /**
     * Trạng thái còn phòng hay hết phòng.
     * true = Còn phòng (Available), false = Hết phòng (Unavailable).
     */
    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private boolean isAvailable = true;

    // ─────────────────────────────────────────
    //  Quan hệ 1-N: Room → RoomImage
    //  CascadeType.ALL: xóa phòng → xóa hết ảnh
    //  orphanRemoval: xóa RoomImage khỏi list → xóa khỏi DB
    // ─────────────────────────────────────────
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RoomImage> images;

    // ─────────────────────────────────────────
    //  Quan hệ 1-N: Room → SavedRoom
    //  CascadeType.ALL: xóa phòng → xóa hết bản ghi saved
    // ─────────────────────────────────────────
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SavedRoom> savedRooms;
}
