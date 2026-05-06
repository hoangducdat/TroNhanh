package com.tronhanh.service;

import com.tronhanh.dto.request.MessageRequest;
import com.tronhanh.dto.response.ConversationResponse;
import com.tronhanh.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    List<ConversationResponse> getConversations(String username);
    List<MessageResponse> getMessages(String username, Long contactId);
    MessageResponse sendMessage(String username, MessageRequest request);
    void markAsRead(String username, Long contactId);
}
