package com.tronhanh.security;

import com.tronhanh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implement UserDetailsService để Spring Security biết cách tải thông tin user từ DB.
 *
 * Spring Security sẽ gọi loadUserByUsername() trong quá trình:
 *  1. Xác thực login (AuthenticationManager.authenticate())
 *  2. JwtAuthenticationFilter khôi phục SecurityContext từ token
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user từ DB theo username.
     * User entity đã implement UserDetails nên trả về trực tiếp.
     *
     * @param username tên đăng nhập
     * @return UserDetails (thực chất là đối tượng User)
     * @throws UsernameNotFoundException nếu không tìm thấy user
     */
    @Override
    @Transactional(readOnly = true) // readOnly = true để tối ưu query đọc
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với username: " + username
                ));
    }
}
