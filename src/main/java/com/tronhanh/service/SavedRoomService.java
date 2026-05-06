package com.tronhanh.service;

import com.tronhanh.dto.response.SavedRoomResponse;

import java.util.List;

/**
 * Interface nghiệp vụ lưu phòng yêu thích (Renter).
 */
public interface SavedRoomService {

    /**
     * Lưu phòng vào danh sách yêu thích.
     * Ném BadRequestException nếu Renter đã lưu phòng này trước đó.
     *
     * @param roomId   ID phòng muốn lưu
     * @param renterId ID Renter đang đăng nhập
     */
    SavedRoomResponse saveRoom(Long roomId, Long renterId);

    /**
     * Bỏ lưu phòng khỏi danh sách yêu thích.
     * Ném ResourceNotFoundException nếu chưa lưu phòng này.
     *
     * @param roomId   ID phòng muốn bỏ lưu
     * @param renterId ID Renter đang đăng nhập
     */
    void unsaveRoom(Long roomId, Long renterId);

    /**
     * Lấy toàn bộ danh sách phòng đã lưu của Renter.
     *
     * @param renterId ID Renter đang đăng nhập
     * @return danh sách phòng đã lưu, kèm thông tin đầy đủ và thời điểm lưu
     */
    List<SavedRoomResponse> getSavedRooms(Long renterId);
}
