-- UPDATE thay vì DELETE để tránh FK constraint với bảng rooms
SET NAMES utf8mb4;
UPDATE categories SET name='Phòng trọ'       WHERE id=1;
UPDATE categories SET name='Căn hộ mini'     WHERE id=2;
UPDATE categories SET name='Nhà nguyên căn'  WHERE id=3;
UPDATE categories SET name='Ký túc xá'       WHERE id=4;
UPDATE categories SET name='Căn hộ dịch vụ'  WHERE id=5;
SELECT id, name FROM categories ORDER BY id;
