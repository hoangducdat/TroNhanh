// ============================================================
// pages/public/RegisterPage.tsx
// Trang đăng ký — gọi POST /api/public/auth/register
// Form cho phép chọn Role: RENTER hoặc LANDLORD (không hiện ADMIN).
// Sau khi đăng ký thành công, auto-login và redirect.
// ============================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import AuthService from '../../services/authService';
import useAuthStore from '../../store/authStore';
import type { UserRole, ApiResponse } from '../../types';

// Role options (không có ADMIN — Admin được tạo ngoài UI)
const ROLE_OPTIONS: { value: Extract<UserRole, 'RENTER' | 'LANDLORD'>; label: string; desc: string; icon: string }[] = [
  {
    value: 'RENTER',
    label: 'Người thuê trọ',
    desc: 'Tìm kiếm, lưu và liên hệ với chủ trọ',
    icon: '🔍',
  },
  {
    value: 'LANDLORD',
    label: 'Chủ trọ',
    desc: 'Đăng tin và quản lý phòng trọ của bạn',
    icon: '🏠',
  },
];

const ROLE_REDIRECT: Record<UserRole, string> = {
  ADMIN:    '/admin/rooms',
  LANDLORD: '/landlord/rooms',
  RENTER:   '/',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [role, setRole] = useState<'RENTER' | 'LANDLORD'>('RENTER');
  const [showPass, setShowPass] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Validation phía client ────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!username.trim()) {
      errs.username = 'Tên đăng nhập không được để trống.';
    } else if (username.trim().length < 3) {
      errs.username = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errs.username = 'Tên đăng nhập chỉ được dùng chữ, số và dấu gạch dưới.';
    }

    if (!password) {
      errs.password = 'Mật khẩu không được để trống.';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (password !== confirmPass) {
      errs.confirmPass = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const authData = await AuthService.register({
        username: username.trim(),
        password,
        role,
      });

      // Auto-login sau đăng ký
      login(authData);
      navigate(ROLE_REDIRECT[authData.role], { replace: true });

    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<null>>;
      const msg = axiosErr.response?.data?.message;
      setError(msg || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center
                    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-lg">

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                            bg-blue-600 mb-4 shadow-md shadow-blue-200">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h1>
            <p className="text-slate-500 text-sm mt-1">
              Tham gia TroNhanh ngay hôm nay — miễn phí!
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

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* ── Chọn Role ──────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bạn là...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2
                                text-center transition-all duration-150 cursor-pointer
                                ${role === opt.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className={`text-xs mt-0.5 leading-tight ${
                        role === opt.value ? 'text-blue-500' : 'text-slate-400'
                      }`}>
                        {opt.desc}
                      </p>
                    </div>
                    {/* Checkmark */}
                    {role === opt.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full
                                      flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Username ───────────────────────────────────── */}
            <div>
              <label htmlFor="reg-username"
                     className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors(p => ({ ...p, username: '' }));
                }}
                placeholder="Ít nhất 3 ký tự, không có khoảng trắng..."
                className={`input-field ${fieldErrors.username ? 'border-red-400 focus:ring-red-400' : ''}`}
                disabled={loading}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            {/* ── Password ───────────────────────────────────── */}
            <div>
              <label htmlFor="reg-password"
                     className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' }));
                  }}
                  placeholder="Ít nhất 6 ký tự..."
                  className={`input-field pr-11 ${fieldErrors.password ? 'border-red-400' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600 cursor-pointer"
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* ── Confirm Password ───────────────────────────── */}
            <div>
              <label htmlFor="reg-confirm"
                     className="block text-sm font-medium text-slate-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                id="reg-confirm"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  if (fieldErrors.confirmPass) setFieldErrors(p => ({ ...p, confirmPass: '' }));
                }}
                placeholder="Nhập lại mật khẩu..."
                className={`input-field ${fieldErrors.confirmPass ? 'border-red-400' : ''}`}
                disabled={loading}
              />
              {fieldErrors.confirmPass && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPass}</p>
              )}
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
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
