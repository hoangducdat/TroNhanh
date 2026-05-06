// ============================================================
// components/layout/MainLayout.tsx
// Layout dùng cho mọi trang public (Trang chủ, Chi tiết phòng, Login...).
// Cấu trúc: Navbar (top) + children (grow) + Footer (bottom)
// ============================================================

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    // min-h-screen + flex-col đảm bảo Footer luôn ở dưới cùng
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Nội dung trang — chiếm toàn bộ không gian còn lại */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
