package com.tronhanh.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng `saved_rooms`.
 * Lưu lại danh sách phòng trọ yêu thích của Renter.
 *
 * Thiết kế:
 *  - Sử dụng @UniqueConstraint để đảm bảo 1 Renter chỉ lưu 1 phòng 1 lần.
 *
 * Quan hệ:
 *  - N-1 với User (renter)
 *  - N-1 với Room
 */
@Entity
@Table(
    name = "saved_rooms",
    // Ràng buộc unique tổ hợp: mỗi cặp (renter, room) chỉ tồn tại 1 lần
    uniqueConstraints = @UniqueConstraint(
        name = "uk_saved_room_renter_room",
        columnNames = {"renter_id", "room_id"}
    )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"renter", "room"})
@EqualsAndHashCode(exclude = {"renter", "room"})
public class SavedRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─────────────────────────────────────────
    //  Quan hệ N-1: SavedRoom → User (Renter)
    // ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    // ─────────────────────────────────────────
    //  Quan hệ N-1: SavedRoom → Room
    // ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /**
     * Thời điểm Renter lưu phòng này.
     * updatable = false: giá trị không thay đổi sau khi insert lần đầu.
     */
    @Column(name = "saved_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime savedAt = LocalDateTime.now();

    /**
     * Tự động gán savedAt = thời điểm hiện tại trước khi persist.
     * Đây là lớp bảo vệ thứ 2 bên cạnh @Builder.Default.
     */
    @PrePersist
    protected void onSave() {
        if (savedAt == null) {
            savedAt = LocalDateTime.now();
        }
    }
}
