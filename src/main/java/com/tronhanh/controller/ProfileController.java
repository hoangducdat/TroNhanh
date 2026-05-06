package com.tronhanh.controller;

import com.tronhanh.dto.request.ProfileUpdateRequest;
import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        UserResponse response = profileService.getMyProfile(username);
        return ResponseEntity.ok(ApiResponse.success("Lấy hồ sơ thành công", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {
        String username = authentication.getName();
        UserResponse response = profileService.updateProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", response));
    }
}
