import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    zaloUrl: '',
    avatarUrl: ''
  });

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/profile')
      .then(res => {
        const data = res.data.data;
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          zaloUrl: data.zaloUrl || '',
          avatarUrl: data.avatarUrl || ''
        });
      })
      .catch(err => console.error("Error loading profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await axiosClient.put('/api/profile', formData);
      setSuccessMsg('Đã cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>👤</span> Hồ sơ cá nhân
        </h1>

        <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.username}</h2>
            <p className="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
              Role: {user?.role}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input
              type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại liên hệ</label>
            <input
              type="text" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="0912345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link Zalo (Tuỳ chọn)</label>
            <input
              type="text" name="zaloUrl" value={formData.zaloUrl} onChange={handleChange}
              placeholder="https://zalo.me/0912345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link Ảnh đại diện (URL)</label>
            <input
              type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
