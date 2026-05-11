// ============================================================
// components/layout/Footer.tsx
// Footer đơn giản, hiện ở dưới cùng mọi trang public.
// ============================================================

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-[#0c0c0f] border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <svg className="w-4 h-4 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">TroNhanh</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link to="/search" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tìm phòng</Link>
            <Link to="/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Đăng ký</Link>
            <Link to="/landlord/rooms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Chủ trọ</Link>
            <Link to="/landlord/rooms/new" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Đăng tin</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} TroNhanh
          </p>
        </div>
      </div>
    </footer>
  );
}
