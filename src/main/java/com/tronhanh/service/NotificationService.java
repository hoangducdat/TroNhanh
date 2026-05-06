package com.tronhanh.service;

import com.tronhanh.dto.response.NotificationResponse;
import com.tronhanh.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String content, String type);
    List<NotificationResponse> getMyNotifications(String username);
    void markAsRead(String username, Long notificationId);
    void markAllAsRead(String username);
    long getUnreadCount(String username);
}
