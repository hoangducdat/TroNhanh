package com.tronhanh.config;

import com.tronhanh.entity.Role;
import com.tronhanh.entity.User;
import com.tronhanh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Tự động seed dữ liệu người dùng khi ứng dụng khởi động lần đầu.
 * Chỉ tạo nếu username chưa tồn tại (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("=== [DataInitializer] Kiểm tra và seed dữ liệu người dùng ===");

        // ── 1 Admin ───────────────────────────────────────────
        createIfAbsent("nguyen.admin",   "Admin@2024!",  Role.ADMIN,
                "Nguyễn Văn Admin", "0901234567", null);

        // ── 3 Chủ trọ ─────────────────────────────────────────
        createIfAbsent("tran.landlord",  "Land@2024!",   Role.LANDLORD,
                "Trần Thị Lan",     "0912345678", "https://zalo.me/tran.lan");
        createIfAbsent("le.landlord",    "Land@2024!",   Role.LANDLORD,
                "Lê Văn Hùng",      "0923456789", "https://zalo.me/le.hung");
        createIfAbsent("pham.landlord",  "Land@2024!",   Role.LANDLORD,
                "Phạm Thị Mai",     "0934567890", "https://zalo.me/pham.mai");

        // ── 5 Người thuê ──────────────────────────────────────
        createIfAbsent("minh.renter",    "Rent@2024!",   Role.RENTER,
                "Nguyễn Minh Tuấn", "0945678901", null);
        createIfAbsent("linh.renter",    "Rent@2024!",   Role.RENTER,
                "Phạm Thị Linh",    "0956789012", null);
        createIfAbsent("duc.renter",     "Rent@2024!",   Role.RENTER,
                "Trần Đức Anh",     "0967890123", null);
        createIfAbsent("huong.renter",   "Rent@2024!",   Role.RENTER,
                "Lê Thị Hương",     "0978901234", null);
        createIfAbsent("khoa.renter",    "Rent@2024!",   Role.RENTER,
                "Võ Minh Khoa",     "0989012345", null);

        log.info("=== [DataInitializer] Hoàn tất ===");
    }

    private void createIfAbsent(String username, String rawPassword,
                                 Role role, String fullName,
                                 String phone, String zaloUrl) {
        if (userRepository.existsByUsername(username)) {
            log.debug("[DataInitializer] Bỏ qua '{}' — đã tồn tại", username);
            return;
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .fullName(fullName)
                .phone(phone)
                .zaloUrl(zaloUrl)
                .build();

        userRepository.save(user);
        log.info("[DataInitializer] ✅ Tạo [{}/{}] — {}", role, username, fullName);
    }
}
