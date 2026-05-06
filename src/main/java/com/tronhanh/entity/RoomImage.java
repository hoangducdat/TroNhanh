package com.tronhanh.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity ánh xạ bảng `room_images`.
 * Mỗi bản ghi lưu URL của một ảnh thuộc về một phòng trọ.
 *
 * Quan hệ:
 *  - N-1 với Room: nhiều ảnh thuộc về 1 phòng
 */
@Entity
@Table(name = "room_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Loại trừ room khỏi toString/hashCode để tránh LazyInitializationException
@ToString(exclude = "room")
@EqualsAndHashCode(exclude = "room")
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─────────────────────────────────────────
    //  Quan hệ N-1: RoomImage → Room
    //  LAZY: không auto-load Room khi chỉ cần lấy URL ảnh
    // ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /**
     * URL đầy đủ để truy cập ảnh.
     * Ví dụ: "http://localhost:8080/uploads/rooms/1/abc.jpg"
     * Được ghép từ app.upload.url-prefix + đường dẫn tương đối.
     */
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
}
