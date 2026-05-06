package com.tronhanh.service.impl;

import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.dto.response.UserResponse;
import com.tronhanh.entity.Room;
import com.tronhanh.entity.RoomStatus;
import com.tronhanh.entity.User;
import com.tronhanh.exception.BadRequestException;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.RoomRepository;

import com.tronhanh.repository.UserRepository;
import com.tronhanh.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation của AdminService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomServiceImpl roomServiceImpl; // Reuse mapToResponse + deleteRoomCascade
    private final com.tronhanh.service.NotificationService notificationService;

    // ─────────────────────────────────────────────────────────
    //  XEM TẤT CẢ PHÒNG
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms(RoomStatus status) {
        List<Room> rooms = (status == null)
                ? roomRepository.findAllByOrderByIdDesc()
                : roomRepository.findByStatusOrderByIdDesc(status);

        return rooms.stream()
                .map(roomServiceImpl::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    //  DUYỆT / TỪ CHỐI PHÒNG
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponse updateRoomStatus(Long roomId, RoomStatus status) {
        if (status == RoomStatus.PENDING) {
            throw new BadRequestException(
                    "Admin không thể đặt trạng thái PENDING. Chỉ dùng APPROVED hoặc REJECTED");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));

        RoomStatus oldStatus = room.getStatus();
        room.setStatus(status);
        Room updated = roomRepository.save(room);

        // Tạo thông báo cho chủ trọ
        String notifContent = String.format("Phòng '%s' đã bị chuyển sang trạng thái %s.", room.getTitle(), status.name());
        if (status == RoomStatus.APPROVED) {
            notifContent = String.format("Phòng '%s' của bạn đã được duyệt thành công!", room.getTitle());
        } else if (status == RoomStatus.REJECTED) {
            notifContent = String.format("Phòng '%s' của bạn đã bị từ chối duyệt.", room.getTitle());
        }
        notificationService.createNotification(room.getLandlord(), notifContent, "ROOM_" + status.name());

        log.info("Admin cập nhật trạng thái phòng {}: {} → {}", roomId, oldStatus, status);
        return roomServiceImpl.mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────
    //  XÓA PHÒNG VI PHẠM (ADMIN)
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));

        // Sử dụng chung logic cascade delete từ RoomServiceImpl
        roomServiceImpl.deleteRoomCascade(room);
        log.info("Admin đã xóa phòng vi phạm: id={}", roomId);
    }

    // ─────────────────────────────────────────────────────────
    //  KHÓA / MỞ KHÓA TÀI KHOẢN
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public UserResponse toggleUserLock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", userId));

        boolean newLockState = !user.isLocked();
        user.setLocked(newLockState);
        User updated = userRepository.save(user);

        log.info("Admin {} tài khoản: userId={}, username={}",
                newLockState ? "KHÓA" : "MỞ KHÓA", userId, user.getUsername());

        return UserResponse.builder()
                .id(updated.getId())
                .username(updated.getUsername())
                .role(updated.getRole())
                .isLocked(updated.isLocked())
                .fullName(updated.getFullName())
                .phone(updated.getPhone())
                .zaloUrl(updated.getZaloUrl())
                .avatarUrl(updated.getAvatarUrl())
                .build();
    }

    // ─────────────────────────────────────────────────────
    //  LẤY TẤT CẢ NGƯỜI DÙNG
    // ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            try {
                com.tronhanh.entity.Role roleEnum = com.tronhanh.entity.Role.valueOf(role.toUpperCase());
                users = userRepository.findByRoleOrderByIdDesc(roleEnum);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAllByOrderByIdDesc();
            }
        } else {
            users = userRepository.findAllByOrderByIdDesc();
        }

        return users.stream().map(u -> UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .role(u.getRole())
                .isLocked(u.isLocked())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .zaloUrl(u.getZaloUrl())
                .avatarUrl(u.getAvatarUrl())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomResponse toggleAvailability(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));
        
        boolean newState = !room.isAvailable();
        room.setAvailable(newState);
        Room updated = roomRepository.save(room);
        
        log.info("Admin thay đổi trạng thái availability phòng {}: {}", roomId, newState ? "CÒN PHÒNG" : "HẾT PHÒNG");
        return roomServiceImpl.mapToResponse(updated);
    }
}
