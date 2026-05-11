package com.tronhanh.service.impl;

import com.tronhanh.dto.request.RoomRequest;
import com.tronhanh.dto.response.RoomResponse;
import com.tronhanh.entity.*;
import com.tronhanh.exception.ResourceForbiddenException;
import com.tronhanh.exception.ResourceNotFoundException;
import com.tronhanh.repository.*;
import com.tronhanh.service.FileStorageService;
import com.tronhanh.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation của RoomService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final RoomImageRepository roomImageRepository;
    private final SavedRoomRepository savedRoomRepository;
    private final FileStorageService fileStorageService;

    /**
     * Map tên thành phố (in thường) → từ khóa tìm thêm (alias trong địa chỉ).
     * VD: "Hồ Chí Minh" → cũng tìm "TP.HCM" và ngược lại.
     */
    private static final java.util.Map<String, String> CITY_ALIASES = java.util.Map.ofEntries(
        java.util.Map.entry("hồ chí minh",    "tp.hcm"),
        java.util.Map.entry("tp.hcm",            "hồ chí minh"),
        java.util.Map.entry("tp hcm",            "hồ chí minh"),
        java.util.Map.entry("thừa thiên huế",  "huế"),
        java.util.Map.entry("huế",              "thừa thiên")
    );

    // ─────────────────────────────────────────────────────────
    //  TÌM KIẾM CÔNG KHAI
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> searchRooms(Long categoryId, BigDecimal minPrice,
                                          BigDecimal maxPrice, BigDecimal minArea,
                                          BigDecimal maxArea, String keyword, String city, Boolean isAvailable) {
        String kw    = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String city_ = (city   != null && !city.isBlank())   ? city.trim()    : null;
        // Resolve alias: VD "Hồ Chí Minh" → cũng tìm "TP.HCM"
        String alias_ = city_ != null
                ? CITY_ALIASES.get(city_.toLowerCase())
                : null;

        return roomRepository.searchRooms(
                        RoomStatus.APPROVED, categoryId, minPrice, maxPrice, minArea, maxArea, kw, city_, alias_, isAvailable)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    //  XEM CHI TIẾT
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));
        return mapToResponse(room);
    }

    // ─────────────────────────────────────────────────────────
    //  TẠO PHÒNG MỚI
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request, Long landlordId) {
        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", landlordId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));

        Room room = Room.builder()
                .landlord(landlord)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .area(request.getArea())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(RoomStatus.PENDING)
                .isHidden(false)
                .build();

        Room savedRoom = roomRepository.save(room);
        log.info("Tạo phòng thành công: id={}, landlord={}", savedRoom.getId(), landlordId);
        return mapToResponse(savedRoom);
    }

    // ─────────────────────────────────────────────────────────
    //  DANH SÁCH PHÒNG CỦA LANDLORD
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByLandlord(Long landlordId) {
        return roomRepository.findByLandlordIdOrderByIdDesc(landlordId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    //  CẬP NHẬT PHÒNG
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request, Long landlordId) {
        Room room = findRoomAndCheckOwnership(roomId, landlordId);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));

        room.setCategory(category);
        room.setTitle(request.getTitle());
        room.setDescription(request.getDescription());
        room.setPrice(request.getPrice());
        room.setArea(request.getArea());
        room.setAddress(request.getAddress());
        room.setLatitude(request.getLatitude());
        room.setLongitude(request.getLongitude());

        // Phòng bị REJECTED → reset PENDING khi Landlord chỉnh sửa lại
        if (room.getStatus() == RoomStatus.REJECTED) {
            room.setStatus(RoomStatus.PENDING);
            log.info("Phòng {} reset PENDING sau khi chỉnh sửa", roomId);
        }

        Room updated = roomRepository.save(room);
        log.info("Cập nhật phòng thành công: id={}", roomId);
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────
    //  ẨN / HIỆN TIN
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponse toggleHideRoom(Long roomId, Long landlordId) {
        Room room = findRoomAndCheckOwnership(roomId, landlordId);
        boolean newState = !room.isHidden();
        room.setHidden(newState);
        Room updated = roomRepository.save(room);
        log.info("Phòng {} → {}: landlord={}", roomId, newState ? "ẨN" : "HIỆN", landlordId);
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────
    //  XÓA PHÒNG (LANDLORD)
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteRoom(Long roomId, Long landlordId) {
        Room room = findRoomAndCheckOwnership(roomId, landlordId);
        deleteRoomCascade(room);
        log.info("Landlord {} đã xóa phòng {}", landlordId, roomId);
    }

    // ─────────────────────────────────────────────────────────
    //  UPLOAD ẢNH
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoomResponse uploadRoomImages(Long roomId, List<MultipartFile> files, Long landlordId) {
        Room room = findRoomAndCheckOwnership(roomId, landlordId);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String imageUrl = fileStorageService.storeRoomImage(file, roomId);
            RoomImage roomImage = RoomImage.builder()
                    .room(room)
                    .imageUrl(imageUrl)
                    .build();
            roomImageRepository.save(roomImage);
            log.info("Upload ảnh: {} → phòng {}", imageUrl, roomId);
        }

        Room refreshed = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));
        return mapToResponse(refreshed);
    }

    // ─────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────

    /**
     * Tìm phòng và kiểm tra Landlord có quyền thao tác không.
     * Ném 404 nếu phòng không tồn tại, 403 nếu không phải chủ sở hữu.
     */
    private Room findRoomAndCheckOwnership(Long roomId, Long landlordId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng trọ", roomId));

        if (!room.getLandlord().getId().equals(landlordId)) {
            log.warn("Ownership violation: landlord {} cố thao tác phòng {} của landlord {}",
                    landlordId, roomId, room.getLandlord().getId());
            throw new ResourceForbiddenException("Bạn không có quyền thao tác trên phòng trọ này");
        }
        return room;
    }

    /**
     * Xóa phòng cùng toàn bộ dữ liệu liên quan.
     * Thứ tự: saved_rooms → room_images → room (tránh FK constraint violation).
     */
    void deleteRoomCascade(Room room) {
        // 1. Xóa tất cả bản ghi saved_rooms liên quan
        savedRoomRepository.deleteAllByRoomId(room.getId());
        // 2. Xóa tất cả ảnh liên quan
        roomImageRepository.deleteAll(room.getImages());
        // 3. Xóa phòng
        roomRepository.delete(room);
    }

    @Override
    @Transactional
    public RoomResponse toggleAvailability(Long roomId, Long landlordId) {
        Room room = findRoomAndCheckOwnership(roomId, landlordId);
        boolean newState = !room.isAvailable();
        room.setAvailable(newState);
        Room updated = roomRepository.save(room);
        log.info("Landlord {} thay đổi trạng thái availability phòng {}: {}", landlordId, roomId, newState ? "CÒN PHÒNG" : "HẾT PHÒNG");
        return mapToResponse(updated);
    }

    /** Map Room entity → RoomResponse DTO */
    RoomResponse mapToResponse(Room room) {
        List<String> imageUrls = room.getImages() == null
                ? List.of()
                : room.getImages().stream()
                        .map(RoomImage::getImageUrl)
                        .collect(Collectors.toList());

        return RoomResponse.builder()
                .id(room.getId())
                .landlordId(room.getLandlord().getId())
                .landlordUsername(room.getLandlord().getUsername())
                .landlordPhone(room.getLandlord().getPhone())
                .landlordZaloUrl(room.getLandlord().getZaloUrl())
                .landlordAvatarUrl(room.getLandlord().getAvatarUrl())
                .categoryId(room.getCategory().getId())
                .categoryName(room.getCategory().getName())
                .title(room.getTitle())
                .description(room.getDescription())
                .price(room.getPrice())
                .area(room.getArea())
                .address(room.getAddress())
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .status(room.getStatus())
                .isHidden(room.isHidden())
                .isAvailable(room.isAvailable())
                .imageUrls(imageUrls)
                .build();
    }
}
