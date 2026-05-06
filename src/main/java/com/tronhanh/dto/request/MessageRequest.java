package com.tronhanh.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {
    @NotNull(message = "ID người nhận không được để trống")
    private Long receiverId;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}
