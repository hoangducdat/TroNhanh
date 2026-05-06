package com.tronhanh.repository;

import com.tronhanh.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository tương tác với bảng `room_images`.
 */
@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    /**
     * Lấy tất cả ảnh của một phòng.
     *
     * @param roomId ID phòng
     * @return danh sách ảnh
     */
    List<RoomImage> findByRoomId(Long roomId);
}
