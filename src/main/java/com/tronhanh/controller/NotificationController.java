package com.tronhanh.controller;

import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.NotificationResponse;
import com.tronhanh.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Thành công", notificationService.getMyNotifications(username)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Thành công", notificationService.getUnreadCount(username)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        notificationService.markAsRead(username, id);
        return ResponseEntity.ok(ApiResponse.success("Đã đọc", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String username = authentication.getName();
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok(ApiResponse.success("Đã đọc tất cả", null));
    }
}
