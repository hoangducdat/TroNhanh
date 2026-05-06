// ============================================================
// components/layout/Navbar.tsx
// Thanh điều hướng chính — dùng Zustand store (Phase 2+).
// ============================================================

import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import NotificationDropdown from '../ui/NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Link dashboard tùy theo role
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

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-zinc-200/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center
                            group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-xl text-zinc-900 tracking-tight group-hover:opacity-80 transition-opacity">
              TroNhanh
            </span>
          </Link>

          {/* ── Right Section (Nav Links + Auth) ───────────── */}
          <div className="flex items-center gap-6">
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6 mr-2">
              <Link to="/search"
                    className="text-zinc-500 hover:text-zinc-900 font-semibold transition-colors text-sm">
                Tìm phòng
              </Link>
              {dashboardLink && (
                <Link to={dashboardLink.href}
                      className="text-zinc-500 hover:text-zinc-900 font-semibold transition-colors text-sm">
                  {dashboardLink.label}
                </Link>
              )}
            </div>

            {/* Auth Buttons / User Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                
                {/* ── Thông báo & Tin nhắn ── */}
                <Link to="/messages" className="p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 rounded-full transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </Link>

                <NotificationDropdown />

                <div className="h-5 w-px bg-zinc-200 hidden sm:block mx-1"></div>
                
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2.5 hover:bg-zinc-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                      <span className="text-zinc-700 font-bold text-sm">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col leading-tight">
                      <span className="text-sm font-bold text-zinc-900">
                        {user.username}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN'    ? 'text-zinc-500' :
                        user.role === 'LANDLORD' ? 'text-amber-600' :
                                                   'text-emerald-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Đăng xuất"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
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
