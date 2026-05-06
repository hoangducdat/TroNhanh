package com.tronhanh.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Entity ánh xạ bảng `categories`.
 * Ví dụ dữ liệu: "Phòng trọ", "Chung cư mini", "Nhà nguyên căn", "Ký túc xá".
 *
 * Quan hệ:
 *  - Một Category có thể có nhiều Room (OneToMany)
 */
@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "rooms")
@EqualsAndHashCode(exclude = "rooms")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên danh mục — duy nhất, không được null.
     * Ví dụ: "Phòng trọ", "Căn hộ dịch vụ"
     */
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    // ─────────────────────────────────────────
    //  Quan hệ 1-N: Category → Rooms
    //  LAZY: không load danh sách rooms khi chỉ cần thông tin Category
    // ─────────────────────────────────────────
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Room> rooms;
}
