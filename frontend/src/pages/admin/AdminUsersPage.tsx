// ============================================================
// pages/admin/AdminUsersPage.tsx
// Quản lý người dùng — Admin xem, lọc role, khóa/mở khóa
// API: GET    /api/admin/users?role=...
//      PATCH  /api/admin/users/{id}/lock
// ============================================================

import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

interface UserItem {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  zaloUrl?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'LANDLORD' | 'RENTER';
  locked: boolean;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN:    { label: 'Admin',    color: 'bg-purple-100 text-purple-700' },
  LANDLORD: { label: 'Chủ trọ', color: 'bg-blue-100 text-blue-700' },
  RENTER:   { label: 'Người thuê', color: 'bg-emerald-100 text-emerald-700' },
};

export default function AdminUsersPage() {
  const [users,     setUsers]     = useState<UserItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('');
  const [search,    setSearch]    = useState('');
  const [toggling,  setToggling]  = useState<number | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async (role = '') => {
    setLoading(true);
    try {
      const url = role ? `/api/admin/users?role=${role}` : '/api/admin/users';
      const res = await axiosClient.get(url);
      setUsers(res.data.data ?? []);
    } catch (_) {
      showToast('Không thể tải danh sách người dùng', false);
    }
    setLoading(false);
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleToggleLock = async (userId: number) => {
    setToggling(userId);
    try {
      const res = await axiosClient.patch(`/api/admin/users/${userId}/lock`);
      const updated: UserItem = res.data.data;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, locked: updated.locked } : u));
      showToast(updated.locked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch (_) {
      showToast('Thao tác thất bại', false);
    }
    setToggling(null);
  };

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.fullName ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    );
  });

  const stats = {
    total:    users.length,
    renters:  users.filter(u => u.role === 'RENTER').length,
    landlords: users.filter(u => u.role === 'LANDLORD').length,
    locked:   users.filter(u => u.locked).length,
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transition-all
          ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Quản lý người dùng</h1>
        <p className="text-sm text-zinc-500 mt-1">Xem danh sách, phân quyền và khóa tài khoản</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng cộng',    value: stats.total,     color: 'bg-zinc-900 text-white',           icon: '👥' },
          { label: 'Người thuê',   value: stats.renters,   color: 'bg-emerald-50 text-emerald-700',   icon: '🏠' },
          { label: 'Chủ trọ',      value: stats.landlords, color: 'bg-blue-50 text-blue-700',         icon: '🔑' },
          { label: 'Bị khóa',      value: stats.locked,    color: 'bg-red-50 text-red-600',           icon: '🔒' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{s.icon} {s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm tên, username, SĐT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-2">
          {[
            { value: '',         label: 'Tất cả' },
            { value: 'RENTER',   label: 'Người thuê' },
            { value: 'LANDLORD', label: 'Chủ trọ' },
            { value: 'ADMIN',    label: 'Admin' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f.value
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="font-semibold text-zinc-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-left">
                <th className="px-5 py-3.5 text-xs font-black text-zinc-400 uppercase tracking-wider">Người dùng</th>
                <th className="px-5 py-3.5 text-xs font-black text-zinc-400 uppercase tracking-wider">Liên hệ</th>
                <th className="px-5 py-3.5 text-xs font-black text-zinc-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-5 py-3.5 text-xs font-black text-zinc-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-xs font-black text-zinc-400 uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map(u => {
                const roleMeta = ROLE_LABELS[u.role] ?? { label: u.role, color: 'bg-zinc-100 text-zinc-600' };
                return (
                  <tr key={u.id} className={`hover:bg-zinc-50/50 transition-colors ${u.locked ? 'opacity-60' : ''}`}>

                    {/* Avatar + info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-zinc-200"
                          style={{ background: u.avatarUrl ? undefined : '#e0e7ff', color: '#3730a3' }}
                        >
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/>
                            : u.username[0]?.toUpperCase()
                          }
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{u.fullName || u.username}</p>
                          <p className="text-xs text-zinc-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-zinc-600">
                      {u.phone
                        ? <a href={`tel:${u.phone}`} className="hover:text-emerald-600 font-medium">{u.phone}</a>
                        : <span className="text-zinc-300">—</span>
                      }
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${roleMeta.color}`}>
                        {roleMeta.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.locked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.locked ? 'bg-red-500' : 'bg-emerald-500'}`}/>
                        {u.locked ? 'Đang khóa' : 'Hoạt động'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleLock(u.id)}
                          disabled={toggling === u.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                            u.locked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          } disabled:opacity-50`}
                        >
                          {toggling === u.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d={u.locked
                                  ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                  : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                }/>
                            </svg>
                          )}
                          {u.locked ? 'Mở khóa' : 'Khóa TK'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-zinc-400 text-right">
          Hiển thị {filtered.length}/{users.length} người dùng
        </p>
      )}
    </div>
  );
}
