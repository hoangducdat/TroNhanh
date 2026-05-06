package com.tronhanh.entity;

/**
 * Enum định nghĩa vai trò người dùng trong hệ thống.
 * - ADMIN    : Quản trị viên, có toàn quyền (duyệt phòng, khóa tài khoản)
 * - LANDLORD : Chủ trọ, đăng tin và quản lý phòng của mình
 * - RENTER   : Người thuê trọ, tìm kiếm và lưu phòng yêu thích
 */
public enum Role {
    ADMIN,
    LANDLORD,
    RENTER
}
