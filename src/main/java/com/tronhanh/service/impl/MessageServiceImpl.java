package com.tronhanh.service.impl;

import com.tronhanh.dto.request.MessageRequest;
import com.tronhanh.dto.response.ConversationResponse;
import com.tronhanh.dto.response.MessageResponse;
import com.tronhanh.entity.Message;
import com.tronhanh.entity.User;
import com.tronhanh.exception.BadRequestException;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.MessageRepository;
import com.tronhanh.repository.UserRepository;
import com.tronhanh.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final com.tronhanh.service.NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", username));

        List<Long> contactIds = messageRepository.findContactIdsByUserId(currentUser.getId());
        List<ConversationResponse> responses = new ArrayList<>();

        for (Long contactId : contactIds) {
            User contact = userRepository.findById(contactId).orElse(null);
            if (contact == null) continue;

            List<Message> conv = messageRepository.findConversation(currentUser.getId(), contactId);
            if (conv.isEmpty()) continue;

            Message lastMsg = conv.get(conv.size() - 1);
            boolean isUnread = !lastMsg.isRead() && lastMsg.getReceiver().getId().equals(currentUser.getId());

            responses.add(ConversationResponse.builder()
                    .contactId(contact.getId())
                    .contactUsername(contact.getUsername())
                    .contactFullName(contact.getFullName())
                    .contactAvatarUrl(contact.getAvatarUrl())
                    .lastMessage(lastMsg.getContent())
                    .lastMessageAt(lastMsg.getCreatedAt())
                    .isRead(!isUnread)
                    .build());
        }

        responses.sort((a, b) -> b.getLastMessageAt().compareTo(a.getLastMessageAt()));
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String username, Long contactId) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", username));

        List<Message> messages = messageRepository.findConversation(currentUser.getId(), contactId);
        
        return messages.stream().map(m -> MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSender().getId())
                .receiverId(m.getReceiver().getId())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .isRead(m.isRead())
                .build()).toList();
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(String username, MessageRequest request) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", username));

        if (sender.getId().equals(request.getReceiverId())) {
            throw new BadRequestException("Không thể gửi tin nhắn cho chính mình");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Người nhận", request.getReceiverId()));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .build();

        Message saved = messageRepository.save(message);

        // Tạo thông báo cho người nhận
        String senderName = sender.getFullName() != null ? sender.getFullName() : sender.getUsername();
        notificationService.createNotification(receiver, "Bạn có tin nhắn mới từ " + senderName, "NEW_MESSAGE");

        return MessageResponse.builder()
                .id(saved.getId())
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .isRead(false)
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(String username, Long contactId) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", username));

        List<Message> messages = messageRepository.findConversation(currentUser.getId(), contactId);
        for (Message m : messages) {
            if (m.getReceiver().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
            }
        }
        messageRepository.saveAll(messages);
    }
}
