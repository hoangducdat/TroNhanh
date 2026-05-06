package com.tronhanh.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String content;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;
}
