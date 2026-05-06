// ============================================================
// components/ui/ProtectedRoute.tsx
// Route guard — bảo vệ các trang yêu cầu đăng nhập và đúng Role.
//
// Cách dùng trong App.tsx:
//   <ProtectedRoute requiredRole="LANDLORD">
//     <DashboardLayout role="LANDLORD" />
//   </ProtectedRoute>
// ============================================================

import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  /** Role yêu cầu. Nếu undefined → chỉ cần đăng nhập, không cần role cụ thể. */
  requiredRole?: UserRole;
  children: React.ReactNode;
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // ── Chưa đăng nhập → redirect về /login ─────────────────
  // Lưu lại URL hiện tại vào state để sau khi login redirect về đúng chỗ
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Đăng nhập nhưng sai role → redirect về trang phù hợp ─
  if (requiredRole && user.role !== requiredRole) {
    // Redirect về dashboard của role hiện tại thay vì báo lỗi
    const redirectMap: Record<UserRole, string> = {
      ADMIN:    '/admin/rooms',
      LANDLORD: '/landlord/rooms',
      RENTER:   '/',
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  // ── OK — render children ──────────────────────────────────
  return <>{children}</>;
}
