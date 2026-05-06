// ============================================================
// store/authStore.ts
// Global Auth State dùng Zustand + persist vào localStorage.
//
// Pattern: Zustand với middleware `persist` — state tự đồng bộ
// vào localStorage, khi F5 vẫn giữ nguyên trạng thái đăng nhập.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthData, UserRole } from '../types';

// ── Shape của Auth State ──────────────────────────────────
interface AuthState {
  // Data
  user: AuthData | null;
  isAuthenticated: boolean;

  // Actions
  login: (data: AuthData) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

// ── Tạo store ─────────────────────────────────────────────
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Initial state ─────────────────────────────────
      user: null,
      isAuthenticated: false,

      // ── Đăng nhập: lưu user data + token ──────────────
      login: (data: AuthData) => {
        // Lưu token riêng vào localStorage để axiosClient đọc được
        // (axiosClient đọc key 'accessToken', không đọc qua Zustand)
        localStorage.setItem('accessToken', data.accessToken);

        set({
          user: data,
          isAuthenticated: true,
        });
      },

      // ── Đăng xuất: xóa toàn bộ auth state ────────────
      logout: () => {
        localStorage.removeItem('accessToken');

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // ── Kiểm tra role ─────────────────────────────────
      hasRole: (role: UserRole) => {
        return get().user?.role === role;
      },
    }),

    {
      name: 'tronhanh-auth', // Key trong localStorage
      // Chỉ persist user và isAuthenticated, không persist actions
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
