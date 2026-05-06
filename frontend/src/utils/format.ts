// ============================================================
// utils/format.ts
// Các hàm tiện ích định dạng dữ liệu hiển thị
// ============================================================

/**
 * Định dạng tiền tệ VND — "3.500.000 ₫/tháng"
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price) + '/tháng';
};

/**
 * Định dạng diện tích — "25.5 m²"
 */
export const formatArea = (area: number): string => {
  return `${area} m²`;
};

/**
 * Rút gọn địa chỉ dài — chỉ lấy 2 phần cuối (quận/huyện, tỉnh/TP)
 * "123 Lý Thường Kiệt, Quận 10, TP.HCM" → "Quận 10, TP.HCM"
 */
export const shortAddress = (address: string): string => {
  const parts = address.split(',').map(p => p.trim());
  return parts.length > 2
    ? parts.slice(-2).join(', ')
    : address;
};

/**
 * Format datetime ISO → "22/04/2026"
 */
export const formatDate = (iso: string): string => {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(iso));
};
