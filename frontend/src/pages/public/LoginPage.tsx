// ============================================================
// pages/public/LoginPage.tsx
// Trang đăng nhập — gọi POST /api/public/auth/login
// Sau khi login thành công, redirect tùy theo Role:
//   ADMIN    → /admin/rooms
//   LANDLORD → /landlord/rooms
//   RENTER   → / (trang chủ)
// ============================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import AuthService from '../../services/authService';
import useAuthStore from '../../store/authStore';
import type { UserRole, ApiResponse } from '../../types';

// Redirect map tùy role
const ROLE_REDIRECT: Record<UserRole, string> = {
  ADMIN:    '/admin/rooms',
  LANDLORD: '/landlord/rooms',
  RENTER:   '/',
};

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuthStore();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // UI state
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  // Nếu được redirect tới từ một trang khác, quay lại đó sau khi login
  const from = (location.state as { from?: Location })?.from?.pathname;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const authData = await AuthService.login({ username: username.trim(), password });

      // Lưu vào Zustand store (tự persist vào localStorage)
      login(authData);

      // Redirect: ưu tiên URL gốc, nếu không có thì theo role
      const redirectTo = from || ROLE_REDIRECT[authData.role];
      navigate(redirectTo, { replace: true });

    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<null>>;
      const msg = axiosErr.response?.data?.message;
      setError(msg || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center
                    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                            bg-blue-600 mb-4 shadow-md shadow-blue-200">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Chào mừng trở lại!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Đăng nhập để tiếp tục sử dụng TroNhanh
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                            text-red-700 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username */}
            <div>
              <label htmlFor="login-username"
                     className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password"
                     className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="input-field pr-11"
                  disabled={loading}
                />
                {/* Toggle show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">CHƯA CÓ TÀI KHOẢN?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="block w-full text-center py-2.5 px-4 rounded-lg border border-slate-200
                       text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300
                       transition-colors"
          >
            Tạo tài khoản mới
          </Link>

        </div>


      </div>
    </div>
  );
}
