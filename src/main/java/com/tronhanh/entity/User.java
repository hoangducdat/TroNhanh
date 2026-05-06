package com.tronhanh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Entity ánh xạ bảng `users`.
 *
 * Implement UserDetails để Spring Security có thể dùng trực tiếp
 * làm đối tượng Principal mà không cần class adapter trung gian.
 *
 * Quan hệ:
 *  - Một User (LANDLORD) có thể có nhiều Room (OneToMany)
 *  - Một User (RENTER) có thể có nhiều SavedRoom (OneToMany)
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Tránh vòng lặp vô hạn khi toString() gọi sang rooms/savedRooms
@ToString(exclude = {"rooms", "savedRooms"})
@EqualsAndHashCode(exclude = {"rooms", "savedRooms"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên đăng nhập — duy nhất, không được null.
     * Dùng làm "username" cho Spring Security.
     */
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** Mật khẩu đã được hash bằng BCrypt trước khi lưu */
    @Column(nullable = false)
    private String password;

    /**
     * Vai trò người dùng: ADMIN | LANDLORD | RENTER.
     * EnumType.STRING lưu dưới dạng chuỗi trong DB (dễ đọc, không bị ảnh hưởng khi thêm enum)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * Trạng thái khóa tài khoản (Admin có thể khóa/mở).
     * true = tài khoản bị khóa, không thể đăng nhập.
     */
    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean isLocked = false;

    // ─────────────────────────────────────────
    //  Thông tin hồ sơ & Liên hệ (Phase 6)
    // ─────────────────────────────────────────
    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "zalo_url", length = 255)
    private String zaloUrl;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // ─────────────────────────────────────────
    //  Quan hệ 1-N: Landlord → Rooms
    //  mappedBy trỏ đến field "landlord" trong class Room
    //  CascadeType.ALL: xóa User thì xóa luôn tất cả Room của họ
    //  FetchType.LAZY: không load rooms ngay khi query User (tối ưu hiệu năng)
    // ─────────────────────────────────────────
    @OneToMany(mappedBy = "landlord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms;

    // ─────────────────────────────────────────
    //  Quan hệ 1-N: Renter → SavedRooms
    // ─────────────────────────────────────────
    @OneToMany(mappedBy = "renter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SavedRoom> savedRooms;

    // ─────────────────────────────────────────
    //  Implement UserDetails (Spring Security)
    // ─────────────────────────────────────────

    /**
     * Trả về danh sách quyền của user.
     * Spring Security yêu cầu prefix "ROLE_" cho hasRole() hoạt động.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Tài khoản không hết hạn */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /** Tài khoản không bị khóa — ngược với field isLocked */
    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    /** Credentials (password) không hết hạn */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /** Tài khoản được kích hoạt */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
