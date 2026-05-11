// ============================================================
// components/layout/Navbar.tsx
// Thanh điều hướng chính — dùng Zustand store (Phase 2+).
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationDropdown from '../ui/NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // ── Dark mode state ──────────────────────────────────────
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // ── Profile dropdown state ───────────────────────────────
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Helpers ─────────────────────────────────────────────
  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':    return { href: '/admin/rooms',    label: 'Admin Panel' };
      case 'LANDLORD': return { href: '/landlord/rooms', label: 'Quản lý tin' };
      case 'RENTER':   return { href: '/saved-rooms',    label: 'Phòng đã lưu' };
      default:         return null;
    }
  };

  const dashboardLink = getDashboardLink();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const roleColor =
    user?.role === 'ADMIN'    ? 'text-zinc-500' :
    user?.role === 'LANDLORD' ? 'text-amber-600' :
                                'text-emerald-600';

  return (
    <nav className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-lg border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center
                            group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <svg className="w-5 h-5 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight group-hover:opacity-80 transition-opacity">
              TroNhanh
            </span>
          </Link>

          {/* ── Right Section ──────────────────────────────── */}
          <div className="flex items-center gap-6">

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6 mr-2">
              <Link to="/search"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors text-sm">
                Tìm phòng
              </Link>
              {dashboardLink && (
                <Link to={dashboardLink.href}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors text-sm">
                  {dashboardLink.label}
                </Link>
              )}
            </div>

            {/* ── Authenticated ─────────────────────────── */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">

                {/* Tin nhắn */}
                <Link to="/messages" className="p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 rounded-full transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </Link>

                <NotificationDropdown />

                <div className="h-5 w-px bg-zinc-200 hidden sm:block mx-1" />

                {/* ── Profile Dropdown ───────────────────── */}
                <div className="relative" ref={dropdownRef}>
                  {/* Avatar button */}
                  <button
                    onClick={() => setOpen(prev => !prev)}
                    className="flex items-center gap-2.5 hover:bg-zinc-50 px-2 py-1.5 rounded-lg
                               transition-colors cursor-pointer group"
                    aria-haspopup="true"
                    aria-expanded={open}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center
                                    border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                      <span className="text-zinc-700 font-bold text-sm">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col leading-tight">
                      <span className="text-sm font-bold text-zinc-900">{user.username}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
                        {user.role}
                      </span>
                    </div>
                    {/* Chevron */}
                    <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl
                                    shadow-xl shadow-zinc-200/60 dark:shadow-black/50 py-1.5 z-50
                                    animate-in fade-in slide-in-from-top-2 duration-150">

                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{user.username}</p>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${roleColor}`}>{user.role}</p>
                      </div>

                      {/* ── Hồ sơ ── */}
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300
                                   hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Hồ sơ cá nhân
                      </Link>

                      {/* ── Cài đặt ── */}
                      <Link
                        to="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300
                                   hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                      </Link>

                      {/* ── Dark / Light mode ── */}
                      <button
                        onClick={toggleDark}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300
                                   hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {isDark ? (
                          <>
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                            </svg>
                            Chế độ sáng
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            Chế độ tối
                          </>
                        )}
                        {/* Toggle pill */}
                        <span className={`ml-auto inline-flex h-5 w-9 items-center rounded-full transition-colors
                                          ${isDark ? 'bg-amber-400' : 'bg-zinc-200'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow
                                            transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </span>
                      </button>

                      <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                      {/* ── Đăng xuất ── */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400
                                   hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>

                    </div>
                  )}
                </div>
                {/* end profile dropdown */}

              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"  className="text-zinc-600 hover:text-zinc-900 font-medium text-sm transition-colors">Đăng nhập</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5 rounded-full">Đăng ký</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
