// ============================================================
// App.tsx — Routing với ProtectedRoute và real pages
// ============================================================

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import MainLayout      from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Navbar          from './components/layout/Navbar';

// Auth guard
import ProtectedRoute from './components/ui/ProtectedRoute';

// Real pages (Phase 2)
import LoginPage    from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Real pages (Phase 3 & 6)
import LandingPage    from './pages/public/LandingPage';
import HomePage       from './pages/public/HomePage';
import RoomDetailPage from './pages/public/RoomDetailPage';

// Real pages (Phase 4)
import LandlordRoomsPage from './pages/landlord/LandlordRoomsPage';
import RoomFormPage      from './pages/landlord/RoomFormPage';

// Real pages (Phase 5)
import AdminRoomsPage  from './pages/admin/AdminRoomsPage';
import AdminUsersPage  from './pages/admin/AdminUsersPage';

// Real pages (Phase 6)
import ProfilePage    from './pages/shared/ProfilePage';
import MessagesPage   from './pages/shared/MessagesPage';
import SavedRoomsPage from './pages/renter/SavedRoomsPage';

// ── Placeholder — sẽ thay bằng real components ở Phase 5 ──
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <div className="text-6xl mb-4">🚧</div>
    <h1 className="text-2xl font-bold text-slate-700 mb-2">{title}</h1>
    <p className="text-slate-500 text-sm">Đang xây dựng — sẽ hoàn thành ở Phase tiếp theo.</p>
  </div>
);

// Layout chỉ có Navbar, không có Footer (dùng cho MessagesPage)
function NavbarOnlyLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes (Navbar + Footer) ─────────────── */}
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="search"   element={<HomePage />} />
          <Route path="login"    element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="rooms/:id" element={<RoomDetailPage />} />

          {/* Renter: lưu phòng */}
          <Route path="saved-rooms" element={
            <ProtectedRoute requiredRole="RENTER">
              <SavedRoomsPage />
            </ProtectedRoute>
          } />

          {/* Profile dùng chung (bất kỳ ai đã đăng nhập) */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

        </Route>

        {/* ── Tin nhắn — layout không có Footer ─────────────── */}
        <Route element={<NavbarOnlyLayout />}>
          <Route path="messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* placeholder để đóng Route MainLayout trên */}
        <Route element={<MainLayout />}>
        </Route>

        {/* ── Landlord dashboard ───────────────────────────── */}
        <Route path="landlord" element={
          <ProtectedRoute requiredRole="LANDLORD">
            <DashboardLayout role="LANDLORD" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms"          element={<LandlordRoomsPage />} />
          <Route path="rooms/new"      element={<RoomFormPage />} />
          <Route path="rooms/:id/edit" element={<RoomFormPage />} />
        </Route>

        {/* ── Admin dashboard ──────────────────────────────── */}
        <Route path="admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <DashboardLayout role="ADMIN" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
              <div className="text-8xl font-black text-slate-200 mb-4">404</div>
              <h1 className="text-2xl font-bold text-slate-700 mb-2">Không tìm thấy trang</h1>
              <a href="/" className="btn-primary mt-4 inline-block">Về trang chủ</a>
            </div>
          } />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
