// ============================================================
// components/layout/Footer.tsx
// Footer đơn giản, hiện ở dưới cùng mọi trang public.
// ============================================================

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white">TroNhanh</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link to="/" className="hover:text-white transition-colors">Tìm phòng</Link>
            <Link to="/register" className="hover:text-white transition-colors">Đăng ký</Link>
            <Link to="/landlord/rooms" className="hover:text-white transition-colors">Chủ trọ</Link>
            <Link to="/landlord/rooms/new" className="hover:text-white transition-colors">Đăng tin</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} TroNhanh
          </p>
        </div>
      </div>
    </footer>
  );
}
