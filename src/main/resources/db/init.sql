-- =============================================================
--  TroNhanh — Tạo database MySQL 8.0
--  Chạy script này một lần trước khi khởi động ứng dụng.
--  JPA (ddl-auto: update) sẽ tự tạo các bảng sau khi DB tồn tại.
-- =============================================================

-- Tạo database với charset UTF-8 đầy đủ (hỗ trợ emoji, tiếng Việt)
CREATE DATABASE IF NOT EXISTS tronhanh_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Sử dụng database vừa tạo
USE tronhanh_db;

-- (Tuỳ chọn) Tạo user riêng cho ứng dụng — không dùng root trên production
-- CREATE USER IF NOT EXISTS 'tronhanh_user'@'localhost' IDENTIFIED BY 'StrongPassword@123';
-- GRANT ALL PRIVILEGES ON tronhanh_db.* TO 'tronhanh_user'@'localhost';
-- FLUSH PRIVILEGES;
