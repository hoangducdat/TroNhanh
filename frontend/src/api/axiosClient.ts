// ============================================================
// api/axiosClient.ts
// Axios instance trung tâm — mọi API call trong app đều dùng file này.
//
// Tính năng:
//  1. Base URL trỏ tới Spring Boot backend
//  2. Request interceptor: tự động đính kèm JWT token vào header
//  3. Response interceptor: tự động bắt lỗi 401 (token hết hạn)
// ============================================================

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL — trong dev Vite proxy sẽ forward /api → localhost:8088
// Trong production đổi thành URL thật của server
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 giây
});

// ── Request Interceptor ───────────────────────────────────────
// Chạy TRƯỚC mỗi request: đọc token từ localStorage và gắn vào header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (được lưu khi login/register)
    const token = localStorage.getItem('accessToken');

    if (token && config.headers) {
      // Gắn JWT vào Authorization header theo chuẩn Bearer scheme
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    // Lỗi trong quá trình chuẩn bị request (hiếm gặp)
    return Promise.reject(error);
  }
);

// ── Response Interceptor ──────────────────────────────────────
// Chạy SAU mỗi response: xử lý lỗi toàn cục
axiosClient.interceptors.response.use(
  // Response thành công (2xx) — trả về nguyên vẹn
  (response) => response,

  // Response lỗi
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ → logout và redirect về login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Chỉ redirect nếu chưa ở trang login (tránh vòng lặp)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Ném lỗi để component tự xử lý thông báo chi tiết
    return Promise.reject(error);
  }
);

export default axiosClient;
