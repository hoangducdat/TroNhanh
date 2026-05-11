package com.tronhanh.repository;

import com.tronhanh.entity.SavedRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository tương tác với bảng `saved_rooms`.
 */
@Repository
public interface SavedRoomRepository extends JpaRepository<SavedRoom, Long> {

    /** Lấy danh sách tin đã lưu của một Renter, mới nhất trước */
    List<SavedRoom> findByRenterIdOrderBySavedAtDesc(Long renterId);

    /** Kiểm tra Renter đã lưu phòng này chưa */
    boolean existsByRenterIdAndRoomId(Long renterId, Long roomId);

    /** Lấy bản ghi SavedRoom theo Renter + Room (để lấy savedAt) */
    Optional<SavedRoom> findByRenterIdAndRoomId(Long renterId, Long roomId);

    /** Xóa bản ghi lưu theo Renter + Room */
    @Modifying
    @Query("DELETE FROM SavedRoom sr WHERE sr.renter.id = :renterId AND sr.room.id = :roomId")
    void deleteByRenterIdAndRoomId(@Param("renterId") Long renterId, @Param("roomId") Long roomId);

    /** Xóa tất cả saved_rooms liên quan đến một phòng (khi xóa phòng) */
    @Modifying
    @Query("DELETE FROM SavedRoom sr WHERE sr.room.id = :roomId")
    void deleteAllByRoomId(@Param("roomId") Long roomId);

    /** Xóa tất cả saved_rooms của một user (renter) — khi xóa tài khoản */
    @Modifying
    @Query("DELETE FROM SavedRoom sr WHERE sr.renter.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /** Xóa tất cả saved_rooms của các phòng thuộc landlord — khi xóa tài khoản landlord */
    @Modifying
    @Query("DELETE FROM SavedRoom sr WHERE sr.room.landlord.id = :landlordId")
    void deleteByRoomLandlordId(@Param("landlordId") Long landlordId);
}
