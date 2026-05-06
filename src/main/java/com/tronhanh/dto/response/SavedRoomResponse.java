package com.tronhanh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về khi Renter xem danh sách phòng đã lưu yêu thích.
 * Bao gồm thông tin đầy đủ của phòng (RoomResponse) và thời điểm lưu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedRoomResponse {

    /** ID của bản ghi saved_rooms (dùng để unsave nếu cần) */
    private Long savedRoomId;

    /** Thời điểm Renter lưu phòng này */
    private LocalDateTime savedAt;

    /** Thông tin đầy đủ của phòng, kể cả lat/lng và imageUrls */
    private RoomResponse room;
}
