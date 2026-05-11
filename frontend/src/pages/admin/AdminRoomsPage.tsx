// ============================================================
// pages/admin/AdminRoomsPage.tsx
// Dashboard kiểm duyệt phòng trọ của Admin.
// Cho phép lọc theo trạng thái và duyệt/từ chối/xóa phòng.
// ============================================================

import { useState, useEffect } from 'react'
import AdminService from '../../services/adminService'
import { formatPrice } from '../../utils/format'
import type { Room } from '../../types'

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filter, setFilter] = useState<FilterStatus>('PENDING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const fetchRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const statusParam = filter === 'ALL' ? undefined : filter
      const data = await AdminService.getAllRooms(statusParam)
      setRooms(data)
    } catch (err) {
      setError('Lỗi khi tải danh sách phòng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'duyệt' : 'từ chối'
    if (!window.confirm(`Bạn có chắc muốn ${action} phòng này?`)) return

    try {
      await AdminService.updateRoomStatus(id, status)
      // Cập nhật local state
      setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (selectedRoom?.id === id) {
        setSelectedRoom(prev => prev ? { ...prev, status } : null)
      }
    } catch (err) {
      alert(`Không thể ${action} phòng. Vui lòng thử lại.`)
    }
  }

  const handleToggleAvailability = async (id: number) => {
    try {
      const updated = await AdminService.toggleAvailability(id)
      setRooms(prev => prev.map(r => r.id === id ? updated : r))
      if (selectedRoom?.id === id) {
        setSelectedRoom(updated)
      }
    } catch (err) {
      alert('Không thể thay đổi trạng thái availability.')
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`XÓA VĨNH VIỄN phòng "${title}"?\nHành động này không thể hoàn tác.`)) {
      return
    }
    
    try {
      await AdminService.deleteRoom(id)
      setRooms(prev => prev.filter(r => r.id !== id))
      if (selectedRoom?.id === id) setSelectedRoom(null)
    } catch (err) {
      alert('Không thể xóa phòng. Vui lòng thử lại.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Duyệt & Quản lý phòng trọ</h1>
        <p className="text-zinc-500 mt-2 font-light">Admin có thể kiểm duyệt bài đăng và thay đổi trạng thái trọ.</p>
      </div>

      {/* ── Bộ lọc ── */}
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-6">
        {([
          { value: 'PENDING', label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-50 border-amber-200/50' },
          { value: 'APPROVED', label: 'Đã duyệt', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/50' },
          { value: 'REJECTED', label: 'Bị từ chối', color: 'text-red-700 bg-red-50 border-red-200/50' },
          { value: 'ALL', label: 'Tất cả', color: 'text-zinc-700 bg-zinc-50 border-zinc-200' },
        ] as const).map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer border ${
              filter === opt.value
                ? `ring-1 ring-zinc-900 ring-offset-2 ${opt.color}`
                : 'text-zinc-500 border-transparent hover:bg-zinc-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Bảng danh sách ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4 w-16">ID</th>
              <th className="px-6 py-4">Thông tin phòng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Tình trạng</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <svg className="w-6 h-6 animate-spin mx-auto text-zinc-900 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Đang tải danh sách...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">
                  Không có phòng nào trong mục này.
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
                        <button onClick={() => setSelectedRoom(room)} className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors text-left line-clamp-1 block leading-tight">
                          {room.title}
                        </button>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                          <span className="text-zinc-900 font-bold">{formatPrice(room.price)}</span> • {room.categoryName} • {room.landlordUsername}
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
                    <button 
                      onClick={() => handleToggleAvailability(room.id)}
                      className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                        room.isAvailable ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-black' : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      {room.isAvailable ? 'CÒN PHÒNG' : 'HẾT PHÒNG'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 text-sm">
                    {room.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleUpdateStatus(room.id, 'APPROVED')} className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-lg transition-colors cursor-pointer active:scale-[0.98]">
                          Duyệt
                        </button>
                        <button onClick={() => handleUpdateStatus(room.id, 'REJECTED')} className="px-3 py-1.5 bg-white border border-zinc-200 hover:border-red-300 hover:text-red-600 text-zinc-700 font-bold rounded-lg transition-colors cursor-pointer active:scale-[0.98]">
                          Từ chối
                        </button>
                      </>
                    )}
                    {(room.status === 'APPROVED' || room.status === 'REJECTED') && (
                      <button onClick={() => handleUpdateStatus(room.id, room.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')} className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-lg transition-colors cursor-pointer active:scale-[0.98]">
                        Đổi trạng thái
                      </button>
                    )}
                    <button onClick={() => handleDelete(room.id, room.title)} className="px-3 py-1.5 text-zinc-400 hover:text-red-600 font-bold cursor-pointer transition-colors" title="Xóa vĩnh viễn">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Chi tiết ── */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col scale-in duration-300 border border-zinc-100">
            {/* Header modal */}
            <div className="p-5 flex items-center justify-between border-b border-zinc-100">
              <div>
                <h2 className="font-bold text-zinc-900 text-xl tracking-tight">Chi tiết phòng trọ #{selectedRoom.id}</h2>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Đăng bởi <span className="font-bold text-zinc-700">{selectedRoom.landlordUsername}</span></p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Ảnh */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedRoom.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200">
                     <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {selectedRoom.imageUrls.length === 0 && (
                  <div className="col-span-full py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 text-center text-zinc-400 font-medium">
                    Không có hình ảnh đính kèm.
                  </div>
                )}
              </div>

              {/* Text info */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-2xl text-zinc-900 tracking-tight leading-snug">{selectedRoom.title}</h3>
                  <p className="text-emerald-600 font-black text-xl mt-2 tracking-tight">{formatPrice(selectedRoom.price)}/tháng</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Diện tích</p>
                    <p className="font-bold text-zinc-900 text-lg">{selectedRoom.area} m²</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Danh mục</p>
                    <p className="font-bold text-zinc-900 text-lg">{selectedRoom.categoryName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Địa chỉ</p>
                  <p className="text-zinc-700 bg-white p-4 rounded-2xl border border-zinc-200 font-medium shadow-sm">{selectedRoom.address}</p>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Mô tả chi tiết</p>
                  <div className="text-zinc-600 whitespace-pre-wrap bg-zinc-50 p-5 rounded-2xl text-sm leading-relaxed border border-zinc-100">
                    {selectedRoom.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer modal - Actions */}
            <div className="p-5 border-t border-zinc-100 flex items-center justify-between gap-4 bg-white">
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => handleToggleAvailability(selectedRoom.id)}
                   className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition-all active:scale-[0.98] border ${
                     selectedRoom.isAvailable ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                   }`}
                 >
                   {selectedRoom.isAvailable ? 'Còn phòng' : 'Hết phòng'}
                 </button>
               </div>
               
               <div className="flex items-center gap-3">
                {selectedRoom.status === 'PENDING' ? (
                  <>
                    <button onClick={() => { handleUpdateStatus(selectedRoom.id, 'REJECTED'); setSelectedRoom(null); }} className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 hover:text-red-600 hover:border-red-200 transition-colors active:scale-[0.98]">
                      TỪ CHỐI
                    </button>
                    <button onClick={() => { handleUpdateStatus(selectedRoom.id, 'APPROVED'); setSelectedRoom(null); }} className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-md active:scale-[0.98]">
                      DUYỆT TIN
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleUpdateStatus(selectedRoom.id, selectedRoom.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')} className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition-colors active:scale-[0.98]">
                    {selectedRoom.status === 'APPROVED' ? 'Hủy duyệt (Từ chối)' : 'Duyệt lại'}
                  </button>
                )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
