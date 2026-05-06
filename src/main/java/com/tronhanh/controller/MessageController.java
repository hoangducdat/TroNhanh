package com.tronhanh.controller;

import com.tronhanh.dto.request.MessageRequest;
import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.ConversationResponse;
import com.tronhanh.dto.response.MessageResponse;
import com.tronhanh.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Thành công", messageService.getConversations(username)));
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            Authentication authentication, @PathVariable Long contactId) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Thành công", messageService.getMessages(username, contactId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            Authentication authentication, @Valid @RequestBody MessageRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", messageService.sendMessage(username, request)));
    }

    @PutMapping("/{contactId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            Authentication authentication, @PathVariable Long contactId) {
        String username = authentication.getName();
        messageService.markAsRead(username, contactId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc", null));
    }
}
