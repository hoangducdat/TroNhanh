// ============================================================
// services/authService.ts
// Tất cả API call liên quan đến Authentication.
// Dùng axiosClient để tự động gắn token (nếu có).
// ============================================================

import axiosClient from '../api/axiosClient';
import type { ApiResponse, AuthData, LoginRequest, RegisterRequest } from '../types';

const AuthService = {
  /**
   * POST /api/public/auth/login
   * Đăng nhập — nhận về accessToken + thông tin user.
   */
  login: async (data: LoginRequest): Promise<AuthData> => {
    const res = await axiosClient.post<ApiResponse<AuthData>>(
      '/api/public/auth/login',
      data
    );
    return res.data.data;
  },

  /**
   * POST /api/public/auth/register
   * Đăng ký tài khoản mới — nhận về accessToken ngay (auto-login).
   */
  register: async (data: RegisterRequest): Promise<AuthData> => {
    const res = await axiosClient.post<ApiResponse<AuthData>>(
      '/api/public/auth/register',
      data
    );
    return res.data.data;
  },
};

export default AuthService;
