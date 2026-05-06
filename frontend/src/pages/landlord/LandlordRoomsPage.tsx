// ============================================================
// pages/landlord/LandlordRoomsPage.tsx
// Trang danh sách tin đăng của Landlord.
// Hiển thị dạng bảng, hỗ trợ: Ẩn/Hiện, Sửa, Xóa.
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LandlordService from '../../services/landlordService'
import { formatPrice } from '../../utils/format'
import type { Room } from '../../types'

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  }
  const label: Record<string, string> = {
    PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối',
  }
  return <span className={map[status] ?? 'badge-pending'}>{label[status] ?? status}</span>
}

export default function LandlordRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await LandlordService.getMyRooms()
      setRooms(data)
    } catch (err) {
      setError('Lỗi khi tải danh sách phòng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleToggleHide = async (id: number) => {
    try {
      const updatedRoom = await LandlordService.toggleHide(id)
      setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r))
    } catch (err) {
      alert('Không thể thay đổi trạng thái ẩn/hiện.')
    }
  }

  const handleToggleAvailability = async (id: number) => {
    try {
      const updatedRoom = await LandlordService.toggleAvailability(id)
      setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r))
    } catch (err) {
      alert('Không thể thay đổi trạng thái còn/hết phòng.')
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng "${title}"?\nHành động này không thể hoàn tác.`)) {
      return
    }
    
    try {
      await LandlordService.deleteRoom(id)
      setRooms(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert('Không thể xóa phòng. Vui lòng thử lại.')
    }
  }

  if (loading) {
    return <div className="p-4 text-slate-500">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Tin đăng của tôi</h1>
          <p className="text-zinc-500 mt-2 font-light">Quản lý danh sách phòng trọ bạn đã đăng tải.</p>
        </div>
        <Link to="/landlord/rooms/new" className="bg-zinc-900 text-white hover:bg-black active:scale-[0.98] transition-all duration-200 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Đăng tin mới
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4 w-16">ID</th>
              <th className="px-6 py-4">Thông tin phòng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Công khai</th>
              <th className="px-6 py-4">Tình trạng</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-medium">
                  Bạn chưa có tin đăng nào.
                </td>
              </tr>
            ) : (
              rooms.map(room => (
                <tr key={room.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-400">#{room.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      {room.imageUrls && room.imageUrls.length > 0 ? (
                        <img src={room.imageUrls[0]} alt="thumbnail" className="w-16 h-12 rounded-lg object-cover shadow-sm border border-zinc-200 group-hover:border-zinc-300 transition-colors" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1 leading-tight">{room.title}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                          <span className="text-zinc-900 font-bold">{formatPrice(room.price)}</span> • {room.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md border ${
                      room.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                      room.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200/50' :
                      'bg-amber-50 text-amber-700 border-amber-200/50'
                    }`}>
                      {room.status === 'APPROVED' ? 'ĐÃ DUYỆT' :
                       room.status === 'REJECTED' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleHide(room.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${!room.isHidden ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                        title={room.isHidden ? 'Đang ẩn - Click để hiện' : 'Đang hiện - Click để ẩn'}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!room.isHidden ? 'translate-x-6' : 'translate-x-1'} shadow-sm`} />
                      </button>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">
                        {room.isHidden ? 'Ẩn' : 'Hiện'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAvailability(room.id)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                        room.isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100' 
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      {room.isAvailable ? 'Còn phòng' : 'Hết phòng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4 text-sm font-bold">
                    {/* Xem trước */}
                    <a href={`/rooms/${room.id}`} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-emerald-600 transition-colors">
                      Xem
                    </a>
                    {/* Sửa */}
                    <Link to={`/landlord/rooms/${room.id}/edit`} className="text-zinc-500 hover:text-zinc-900 transition-colors">
                      Sửa
                    </Link>
                    {/* Xóa */}
                    <button onClick={() => handleDelete(room.id, room.title)} className="text-zinc-500 hover:text-red-600 transition-colors cursor-pointer">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
