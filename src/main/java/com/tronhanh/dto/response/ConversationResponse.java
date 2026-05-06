package com.tronhanh.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ConversationResponse {
    private Long contactId;
    private String contactUsername;
    private String contactFullName;
    private String contactAvatarUrl;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private boolean isRead;
}
