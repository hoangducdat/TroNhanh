package com.tronhanh.service.impl;

import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.dto.response.SavedRoomResponse;
import com.tronhanh.entity.Room;
import com.tronhanh.entity.SavedRoom;
import com.tronhanh.entity.User;
import com.tronhanh.exception.BadRequestException;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.RoomRepository;
import com.tronhanh.repository.SavedRoomRepository;
import com.tronhanh.repository.UserRepository;
import com.tronhanh.service.SavedRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation của SavedRoomService.
 * Xử lý nghiệp vụ lưu phòng yêu thích của Renter.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SavedRoomServiceImpl implements SavedRoomService {

    private final SavedRoomRepository savedRoomRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomServiceImpl roomServiceImpl; // Reuse mapToResponse

    // ─────────────────────────────────────────────────────────
    //  LƯU PHÒNG YÊU THÍCH
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SavedRoomResponse saveRoom(Long roomId, Long renterId) {
        // Kiểm tra đã lưu chưa → tránh duplicate
        if (savedRoomRepository.existsByRenterIdAndRoomId(renterId, roomId)) {
            throw new BadRequestException("Bạn đã lưu phòng trọ này rồi");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", renterId));

        SavedRoom savedRoom = SavedRoom.builder()
                .renter(renter)
                .room(room)
                .savedAt(LocalDateTime.now())
                .build();

        SavedRoom saved = savedRoomRepository.save(savedRoom);
        log.info("Renter {} đã lưu phòng {}", renterId, roomId);
        return mapToSavedRoomResponse(saved);
    }

    // ─────────────────────────────────────────────────────────
    //  BỎ LƯU PHÒNG
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void unsaveRoom(Long roomId, Long renterId) {
        // Kiểm tra bản ghi tồn tại trước khi xóa
        if (!savedRoomRepository.existsByRenterIdAndRoomId(renterId, roomId)) {
            throw new ResourceNotFoundException(
                    "Bạn chưa lưu phòng trọ này (renter=" + renterId + ", room=" + roomId + ")");
        }

        savedRoomRepository.deleteByRenterIdAndRoomId(renterId, roomId);
        log.info("Renter {} đã bỏ lưu phòng {}", renterId, roomId);
    }

    // ─────────────────────────────────────────────────────────
    //  DANH SÁCH PHÒNG ĐÃ LƯU
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SavedRoomResponse> getSavedRooms(Long renterId) {
        return savedRoomRepository.findByRenterIdOrderBySavedAtDesc(renterId)
                .stream()
                .map(this::mapToSavedRoomResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    //  PRIVATE HELPER
    // ─────────────────────────────────────────────────────────

    /** Map SavedRoom entity → SavedRoomResponse DTO */
    private SavedRoomResponse mapToSavedRoomResponse(SavedRoom savedRoom) {
        RoomResponse roomResponse = roomServiceImpl.mapToResponse(savedRoom.getRoom());
        return SavedRoomResponse.builder()
                .savedRoomId(savedRoom.getId())
                .savedAt(savedRoom.getSavedAt())
                .room(roomResponse)
                .build();
    }
}
