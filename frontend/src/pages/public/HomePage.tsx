// ============================================================
// pages/public/HomePage.tsx
// Trang chủ — Split layout: danh sách trái + bản đồ phải.
//
// Luồng dữ liệu:
//   1. Load categories (1 lần)
//   2. Load rooms khi filter thay đổi (debounced)
//   3. Click card → highlight marker + scroll popup
//   4. Click marker → highlight card tương ứng
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import RoomService     from '../../services/roomService'
import CategoryService from '../../services/categoryService'
import RoomMap         from '../../components/map/RoomMap'
import SearchBar       from '../../components/ui/SearchBar'
import RoomCard        from '../../components/ui/RoomCard'
import type { Room, Category, SearchParams } from '../../types'

export default function HomePage() {
  const [rooms,       setRooms]       = useState<Room[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [params,      setParams]      = useState<SearchParams>({})
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [selectedId,  setSelectedId]  = useState<number | null>(null)

  // Ref để scroll card tương ứng vào view khi click marker
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // ── Load categories 1 lần ────────────────────────────────
  useEffect(() => {
    CategoryService.getAll()
      .then(setCategories)
      .catch(() => {/* silent fail — filter vẫn hiện, chỉ không có option */})
  }, [])

  // ── Load rooms khi params thay đổi ───────────────────────
  useEffect(() => {
    setLoading(true)
    setError('')
    RoomService.searchRooms(params)
      .then(data => {
        setRooms(data)
        setSelectedId(null)
      })
      .catch(() => setError('Không thể tải danh sách phòng. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [params])

  // ── Xử lý click marker (từ Map) → highlight card ────────
  const handleMarkerClick = useCallback((room: Room) => {
    setSelectedId(room.id)
    // Scroll card vào view
    setTimeout(() => {
      cardRefs.current[room.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }, [])

  // ── Xử lý click card → highlight marker ─────────────────
  const handleCardClick = useCallback((room: Room) => {
    setSelectedId(room.id)
  }, [])

  return (
    // Chiếm toàn bộ chiều cao viewport trừ Navbar (64px)
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ LEFT PANEL: Search + Room list ══════════════════ */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50">

        {/* SearchBar cố định trên đầu panel */}
        <SearchBar
          categories={categories}
          params={params}
          onChange={setParams}
          loading={loading}
        />

        {/* Room count header */}
        <div className="px-4 py-2 flex items-center justify-between flex-shrink-0
                        border-b border-slate-100 bg-white">
          <span className="text-sm font-medium text-slate-700">
            {loading
              ? 'Đang tìm...'
              : `${rooms.length} phòng phù hợp`}
          </span>
          {rooms.length > 0 && !loading && (
            <span className="text-xs text-slate-400">
              {rooms.filter(r => r.latitude || r.longitude).length} có vị trí
            </span>
          )}
        </div>

        {/* ── Room list (scrollable) ────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2
                            text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && rooms.length === 0 && (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden
                                      animate-pulse">
                <div className="h-36 bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))
          )}

          {/* Empty state */}
          {!loading && !error && rooms.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium text-slate-600">Không tìm thấy phòng nào</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc mở rộng khu vực</p>
            </div>
          )}

          {/* Room cards */}
          {rooms.map(room => (
            <div
              key={room.id}
              ref={el => { cardRefs.current[room.id] = el }}
            >
              <RoomCard
                room={room}
                isSelected={selectedId === room.id}
                onClick={() => handleCardClick(room)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL: Map ════════════════════════════════ */}
      <div className="flex-1 relative">
        {/* Overlay khi loading */}
        {loading && rooms.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]
                          bg-white/90 backdrop-blur-sm text-sm text-slate-600 font-medium
                          px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang cập nhật...
          </div>
        )}

        <RoomMap
          rooms={rooms}
          selectedRoomId={selectedId}
          onMarkerClick={handleMarkerClick}
        />

        {/* Room count badge trên map — đặt giữa bottom để không che nút locate */}
        {!loading && rooms.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
                          bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-4 py-1.5
                          text-xs text-slate-600 border border-slate-200 pointer-events-none">
            🏠 {rooms.filter(r => r.latitude || r.longitude).length} phòng trên bản đồ
          </div>
        )}
      </div>

    </div>
  )
}
