package com.tronhanh.entity;

/**
 * Enum trạng thái phòng trọ trong quy trình duyệt bài.
 * - PENDING  : Chủ trọ vừa đăng, đang chờ Admin duyệt
 * - APPROVED : Admin đã duyệt, phòng hiển thị công khai để tìm kiếm
 * - REJECTED : Admin từ chối, phòng không hiển thị
 */
public enum RoomStatus {
    PENDING,
    APPROVED,
    REJECTED
}
