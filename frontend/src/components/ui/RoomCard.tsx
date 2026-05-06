// ============================================================
// components/ui/RoomCard.tsx
// Card hiển thị tóm tắt thông tin phòng trong danh sách bên trái.
// Click vào card → highlight marker trên map + navigate chi tiết.
// ============================================================

import { useNavigate } from 'react-router-dom'
import type { Room } from '../../types'
import { formatPrice, formatArea } from '../../utils/format'

interface RoomCardProps {
  room: Room
  isSelected?: boolean
  onClick?: () => void
}

export default function RoomCard({ room, isSelected, onClick }: RoomCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    onClick?.()
  }

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/rooms/${room.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-300
                  ${isSelected
                    ? 'border-[2px] border-zinc-900 shadow-lg bg-zinc-50 scale-[1.02]'
                    : 'border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md hover:-translate-y-1'
                  }`}
    >
      {/* ── Thumbnail ──────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden group">
        {room.imageUrls?.length > 0 ? (
          <img
            src={room.imageUrls[0]}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'
              ;(e.target as HTMLImageElement).parentElement!.classList.add('no-img')
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-2 font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold bg-white/95 backdrop-blur-md
                         text-zinc-800 px-2.5 py-1 rounded-full shadow-sm">
          {room.categoryName}
        </span>

        {/* Image count */}
        {room.imageUrls?.length > 1 && (
          <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-zinc-900/80 backdrop-blur-md text-white
                           px-2 py-1 rounded-full shadow-sm">
            +{room.imageUrls.length - 1} ảnh
          </span>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="font-bold text-zinc-900 text-[15px] leading-tight mb-2 line-clamp-2">
          {room.title}
        </h3>

        {/* Price + Area */}
        <div className="flex items-end gap-2 mb-2">
          <span className="text-zinc-900 font-extrabold text-lg tracking-tight">
            {formatPrice(room.price)}
          </span>
          <span className="text-zinc-500 text-xs font-medium bg-zinc-100 px-2 py-1 rounded-md mb-0.5">
            {formatArea(room.area)}
          </span>
        </div>

        {/* Address */}
        <p className="text-zinc-500 text-sm line-clamp-1 mb-4 font-light">
          {room.address}
        </p>

        {/* View detail CTA */}
        <button
          onClick={handleViewDetail}
          className="w-full text-sm font-semibold py-2.5 rounded-xl
                     bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors cursor-pointer active:scale-[0.98]"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}
