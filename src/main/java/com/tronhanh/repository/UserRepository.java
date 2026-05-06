package com.tronhanh.repository;

import com.tronhanh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository tương tác với bảng `users`.
 * Spring Data JPA tự động implement các phương thức CRUD cơ bản.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo username.
     * Dùng trong UserDetailsService để load user khi authenticate.
     *
     * @param username tên đăng nhập
     * @return Optional<User> — tránh NullPointerException so với trả về User trực tiếp
     */
    Optional<User> findByUsername(String username);

    /**
     * Kiểm tra username đã tồn tại chưa.
     * Dùng trong đăng ký để tránh trùng username.
     *
     * @param username tên đăng nhập cần kiểm tra
     * @return true nếu đã tồn tại
     */
    boolean existsByUsername(String username);

    /** Lấy tất cả users, mới nhất trước */
    java.util.List<User> findAllByOrderByIdDesc();

    /** Lấy users theo role, mới nhất trước */
    java.util.List<User> findByRoleOrderByIdDesc(com.tronhanh.entity.Role role);
}
