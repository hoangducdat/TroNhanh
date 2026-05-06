// ============================================================
// pages/public/RoomDetailPage.tsx
// Trang chi tiết phòng trọ.
//
// - Gọi GET /api/public/rooms/:id
// - Hiển thị: ảnh gallery, thông tin, bản đồ vị trí
// - Nút "Lưu tin" (chỉ hiện với RENTER đã đăng nhập)
//   POST /api/renter/saved-rooms/:roomId
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { AxiosError } from 'axios'
import RoomService      from '../../services/roomService'
import SavedRoomService from '../../services/savedRoomService'
import useAuthStore     from '../../store/authStore'
import { formatPrice, formatArea } from '../../utils/format'
import type { Room } from '../../types'

// Badge component tái sử dụng
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING:  'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  }
  const label: Record<string, string> = {
    PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối',
  }
  return <span className={map[status] ?? 'badge-pending'}>{label[status] ?? status}</span>
}

export default function RoomDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [room,       setRoom]       = useState<Room | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [activeImg,  setActiveImg]  = useState(0)

  // Trạng thái lưu tin
  const [saved,      setSaved]      = useState(false)
  const [saveLoading,setSaveLoading]= useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  // ── Load room detail ──────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    RoomService.getRoomById(id)
      .then(data => { setRoom(data); setActiveImg(0) })
      .catch(() => setError('Không tìm thấy phòng trọ này.'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Lưu / bỏ lưu tin ────────────────────────────────────
  const handleSave = async () => {
    if (!room) return
    setSaveLoading(true)
    setSaveMsg('')
    try {
      if (saved) {
        await SavedRoomService.unsave(room.id)
        setSaved(false)
        setSaveMsg('Đã bỏ lưu phòng này')
      } else {
        await SavedRoomService.save(room.id)
        setSaved(true)
        setSaveMsg('Đã lưu vào danh sách yêu thích ❤️')
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      setSaveMsg(axiosErr.response?.data?.message ?? 'Thao tác thất bại')
    } finally {
      setSaveLoading(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
        <div className="h-64 bg-slate-200 rounded-xl mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-200 rounded" />)}
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────
  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">{error || 'Phòng không tồn tại'}</h1>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          ← Về trang chủ
        </button>
      </div>
    )
  }

  const hasLocation = room.latitude !== 0 || room.longitude !== 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Breadcrumb ───────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-8 tracking-wide">
        <Link to="/" className="hover:text-zinc-900 transition-colors">TRANG CHỦ</Link>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-900 truncate max-w-xs">{room.title.toUpperCase()}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ══ LEFT: Ảnh + Thông tin ════════════════════════ */}
        <div className="lg:col-span-2 space-y-10">

          {/* ── Image Gallery ──────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-zinc-100 rounded-2xl overflow-hidden group">
              {room.imageUrls?.length > 0 ? (
                <img
                  src={room.imageUrls[activeImg]}
                  alt={`Ảnh ${activeImg + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ''
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium">Chưa có ảnh</p>
                </div>
              )}

              {/* Counter */}
              {room.imageUrls?.length > 1 && (
                <span className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest
                                 px-3 py-1.5 rounded-full">
                  {activeImg + 1} / {room.imageUrls.length}
                </span>
              )}
            </div>

            {/* Thumbnails strip */}
            {room.imageUrls?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {room.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer
                                transition-all duration-200 ${i === activeImg ? 'ring-2 ring-zinc-900 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Room Info ──────────────────────────────────── */}
          <div className="space-y-8">
            {/* Title + status */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-100 text-zinc-800
                                 px-2.5 py-1 rounded-full border border-zinc-200">
                  {room.categoryName}
                </span>
                <StatusBadge status={room.status} />
                {!room.isAvailable && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-900 text-white px-2.5 py-1 rounded-full border border-zinc-900">
                    HẾT PHÒNG
                  </span>
                )}
                {room.isHidden && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full border border-zinc-200">
                    ĐANG ẨN
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight tracking-tight">
                {room.title}
              </h1>
            </div>

            {/* Price + Area + Address */}
            <div className="flex flex-col gap-4 py-6 border-y border-zinc-100">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Giá thuê</p>
                  <p className="text-3xl font-black text-zinc-900 tracking-tight">{formatPrice(room.price)}</p>
                </div>
                <div className="w-px h-10 bg-zinc-200 hidden sm:block" />
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Diện tích</p>
                  <p className="text-3xl font-black text-zinc-900 tracking-tight">{formatArea(room.area)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 mt-2">
                <span className="text-xl">📍</span>
                <p className="text-zinc-600 text-sm font-light mt-0.5 leading-relaxed">{room.address}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-zinc-900 text-lg mb-4 tracking-tight">Về không gian này</h3>
              <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 font-light leading-relaxed whitespace-pre-line">
                {room.description}
              </div>
            </div>
          </div>

          {/* ── Mini Map ───────────────────────────────────── */}
          {hasLocation && (
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Vị trí trên bản đồ</h3>
              <div className="h-64 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                <MapContainer
                  center={[room.latitude, room.longitude]}
                  zoom={15}
                  className="w-full h-full"
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[room.latitude, room.longitude]}>
                    <Popup>{room.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Sticky action panel ═══════════════════ */}
        <div>
          <div className="card p-6 lg:sticky lg:top-24 space-y-6">

            {/* Landlord info */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Thông tin liên hệ</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                  {room.landlordAvatarUrl ? (
                    <img src={room.landlordAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-700 font-bold text-xl">
                      {room.landlordUsername?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-lg tracking-tight">{room.landlordUsername}</p>
                  <p className="text-xs text-zinc-500 font-medium">Chủ trọ trên TroNhanh</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {room.landlordPhone && (
                  <a href={`tel:${room.landlordPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black active:scale-[0.98] transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {room.landlordPhone}
                  </a>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {room.landlordZaloUrl && (
                    <a href={room.landlordZaloUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 active:scale-[0.98] transition-all">
                      <span>💬</span> Zalo
                    </a>
                  )}
                  {isAuthenticated && user?.id !== room.landlordId && (
                    <Link to={`/messages?userId=${room.landlordId}&roomId=${room.id}`} className={`flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 text-zinc-800 font-bold rounded-xl hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all shadow-sm ${!room.landlordZaloUrl ? 'col-span-2' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      Nhắn tin
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Save button — chỉ hiện với RENTER đã đăng nhập */}
            {isAuthenticated && user?.role === 'RENTER' ? (
              <div className="pt-4 border-t border-zinc-100">
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center
                              justify-center gap-2 transition-all cursor-pointer shadow-sm
                              ${saved
                                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
                              }`}
                >
                  {saveLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'}
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {saved ? 'Đã lưu tin' : 'Lưu tin phòng'}
                </button>

                {saveMsg && (
                  <p className={`text-xs text-center font-medium mt-3 ${
                    saveMsg.includes('thất bại') ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            ) : !isAuthenticated ? (
              /* Chưa đăng nhập → gợi ý login */
              <div className="pt-4 border-t border-zinc-100 text-center">
                <Link to="/login" className="w-full block py-3 rounded-xl font-bold text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors shadow-sm">
                  Đăng nhập để lưu tin
                </Link>
              </div>
            ) : null /* Admin/Landlord không thấy nút lưu */}

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="w-full text-sm text-zinc-400 hover:text-zinc-600
                         font-medium transition-colors cursor-pointer"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
