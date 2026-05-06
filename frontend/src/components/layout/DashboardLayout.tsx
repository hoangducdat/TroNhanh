// ============================================================
// components/layout/DashboardLayout.tsx
// Layout dùng cho các trang Admin và Landlord.
// Cấu trúc: Sidebar (trái, cố định) + Content area (phải, cuộn được)
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { type UserRole } from '../../types';

interface DashboardLayoutProps {
  role: Extract<UserRole, 'ADMIN' | 'LANDLORD'>;
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar cố định bên trái ────────────────────── */}
      <Sidebar role={role} />

      {/* ── Vùng nội dung bên phải ─────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header nhỏ của dashboard */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-6
                           flex-shrink-0">
          <h1 className="text-sm font-medium text-slate-500">
            {role === 'ADMIN' ? '⚙️ Admin Dashboard' : '🏠 Landlord Dashboard'}
          </h1>
        </header>

        {/* Content — có scroll riêng */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
