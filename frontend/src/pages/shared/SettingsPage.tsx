// ============================================================
// pages/shared/SettingsPage.tsx
// Trang cài đặt: đổi mật khẩu, giao diện, thông báo, xóa TK
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/authStore';

// ── Dark mode hook (sync với Navbar) ────────────────────────
function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const toggle = () => {
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
  return { isDark, toggle };
}

// ── Section card wrapper ──────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
        <span className="text-zinc-400">{icon}</span>
        <h2 className="text-base font-bold text-zinc-900">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Toast helper ─────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { toast, show: showToast } = useToast();

  // ── Đổi mật khẩu ─────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('Mật khẩu mới và xác nhận không khớp', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await axiosClient.put('/api/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Mật khẩu hiện tại không đúng';
      showToast(msg, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Thông báo preferences (lưu localStorage) ──────────
  const [notif, setNotif] = useState(() => {
    const saved = localStorage.getItem('notif_prefs');
    return saved ? JSON.parse(saved) : { newMessage: true, roomApproved: true, systemAlert: true };
  });

  const toggleNotif = (key: keyof typeof notif) => {
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    localStorage.setItem('notif_prefs', JSON.stringify(next));
    showToast('Đã lưu tuỳ chọn thông báo');
  };

  // ── Xóa tài khoản ────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== 'xóa tài khoản') {
      showToast('Vui lòng nhập đúng cụm từ xác nhận', 'error');
      return;
    }
    setDeleteLoading(true);
    try {
      await axiosClient.delete('/api/profile');
      logout();
      navigate('/login', { state: { message: 'Tài khoản của bạn đã bị xóa.' } });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không thể xóa tài khoản lúc này';
      showToast(msg, 'error');
      setDeleteLoading(false);
    }
  };

  // ── Initialize dark mode from localStorage on mount ──
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // ── Toggle Switch component ───────────────────────────
  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
                  ${value ? 'bg-zinc-900' : 'bg-zinc-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                        ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
                         transition-all animate-in slide-in-from-right-4 duration-300
                         ${toast.type === 'success'
                           ? 'bg-emerald-600 text-white'
                           : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Cài đặt</h1>
        <p className="text-zinc-500 mt-1 text-sm">Quản lý tài khoản và tuỳ chọn cá nhân của bạn.</p>
      </div>

      {/* ── 1. Giao diện ── */}
      <Section
        title="Giao diện"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Chế độ tối</p>
            <p className="text-xs text-zinc-500 mt-0.5">Bật chế độ nền tối để dễ nhìn hơn vào ban đêm</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{isDark ? '🌙 Tối' : '☀️ Sáng'}</span>
            <ToggleSwitch value={isDark} onChange={toggleDark} />
          </div>
        </div>
      </Section>

      {/* ── 2. Đổi mật khẩu ── */}
      <Section
        title="Bảo mật — Đổi mật khẩu"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              required
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
              required
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="input-field text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60"
          >
            {pwLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </Section>

      {/* ── 3. Thông báo ── */}
      <Section
        title="Thông báo"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
      >
        <div className="space-y-4">
          {[
            { key: 'newMessage',    label: 'Tin nhắn mới',           desc: 'Nhận thông báo khi có người nhắn tin cho bạn' },
            { key: 'roomApproved', label: 'Tin đăng được duyệt',    desc: 'Thông báo khi Admin duyệt hoặc từ chối tin' },
            { key: 'systemAlert',  label: 'Thông báo hệ thống',     desc: 'Cập nhật và thông báo quan trọng từ TroNhanh' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch
                value={notif[item.key as keyof typeof notif]}
                onChange={() => toggleNotif(item.key as keyof typeof notif)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. Thông tin tài khoản ── */}
      <Section
        title="Thông tin tài khoản"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-zinc-100">
            <span className="text-zinc-500 font-medium">Tên đăng nhập</span>
            <span className="font-bold text-zinc-900">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100">
            <span className="text-zinc-500 font-medium">Vai trò</span>
            <span className={`font-bold uppercase text-xs tracking-wider
              ${user?.role === 'LANDLORD' ? 'text-amber-600' :
                user?.role === 'ADMIN'    ? 'text-zinc-500'  : 'text-emerald-600'}`}>
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500 font-medium">Hồ sơ cá nhân</span>
            <a href="/profile" className="font-semibold text-zinc-900 hover:underline">Chỉnh sửa →</a>
          </div>
        </div>
      </Section>

      {/* ── 5. Vùng nguy hiểm ── */}
      <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-base font-bold text-red-700">Vùng nguy hiểm</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Xóa tài khoản</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Hành động này không thể hoàn tác.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-shrink-0 px-4 py-2 text-sm font-bold text-red-600 border border-red-200
                         rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900">Xác nhận xóa tài khoản</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Toàn bộ dữ liệu, tin đăng và lịch sử sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Nhập chính xác&nbsp;
                <span className="font-bold text-red-600">xóa tài khoản</span>
                &nbsp;để xác nhận:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="xóa tài khoản"
                className="input-field text-sm"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="btn-secondary flex-1 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirm.toLowerCase() !== 'xóa tài khoản'}
                className="btn-danger flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Đang xóa...' : '🗑️ Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
