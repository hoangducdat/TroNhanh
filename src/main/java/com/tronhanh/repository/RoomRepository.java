package com.tronhanh.repository;

import com.tronhanh.entity.Room;
import com.tronhanh.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository tương tác với bảng `rooms`.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    /** Danh sách phòng của một Landlord — Landlord dashboard */
    List<Room> findByLandlordIdOrderByIdDesc(Long landlordId);

    /** Tất cả phòng — Admin xem toàn bộ, sắp xếp mới nhất trước */
    List<Room> findAllByOrderByIdDesc();

    /** Admin lọc theo status (PENDING / APPROVED / REJECTED) */
    List<Room> findByStatusOrderByIdDesc(RoomStatus status);

    /**
     * Tìm kiếm phòng công khai.
     * - Chỉ trả status=APPROVED và is_hidden=false.
     * - Tất cả tham số đều optional (null = bỏ qua điều kiện đó).
     * - keyword tìm theo địa chỉ HOẶC tiêu đề (LIKE, case-insensitive).
     */
    @Query("""
            SELECT r FROM Room r
            WHERE r.status = :status
              AND r.isHidden = false
              AND (:categoryId IS NULL OR r.category.id = :categoryId)
              AND (:minPrice IS NULL OR r.price >= :minPrice)
              AND (:maxPrice IS NULL OR r.price <= :maxPrice)
              AND (:minArea IS NULL OR r.area >= :minArea)
              AND (:maxArea IS NULL OR r.area <= :maxArea)
              AND (:keyword IS NULL
                   OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(r.title)   LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY r.id DESC
            """)
    List<Room> searchRooms(
            @Param("status")     RoomStatus status,
            @Param("categoryId") Long categoryId,
            @Param("minPrice")   BigDecimal minPrice,
            @Param("maxPrice")   BigDecimal maxPrice,
            @Param("minArea")    BigDecimal minArea,
            @Param("maxArea")    BigDecimal maxArea,
            @Param("keyword")    String keyword
    );
}
