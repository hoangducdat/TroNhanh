// ============================================================
// components/map/RoomMap.tsx
// Bản đồ Leaflet — nút Locate Me với z-index đúng
// ============================================================

import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Room } from '../../types'
import { formatPrice, formatArea } from '../../utils/format'

// ── Icons ───────────────────────────────────────────────────
const createPin = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg)"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -32],
  })

const ICON_BLUE   = createPin('#2563eb')
const ICON_GRAY   = createPin('#9ca3af')
const ICON_ORANGE = createPin('#f59e0b')

const MY_LOC_ICON = L.divIcon({
  className: '',
  html: `
    <style>@keyframes mlpulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(2);opacity:0}}</style>
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:-6px;background:rgba(37,99,235,.25);border-radius:50%;animation:mlpulse 2s ease-in-out infinite"></div>
      <div style="position:absolute;inset:0;background:#2563eb;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,.6)"></div>
    </div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -14],
})

// ── FitBounds ───────────────────────────────────────────────
function FitBounds({ rooms, skip }: { rooms: Room[]; skip: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (skip) return  // Đã locate — không fitBounds nữa
    const v = rooms.filter(r => r.latitude && r.longitude)
    if (!v.length) return
    if (v.length === 1) { map.setView([v[0].latitude, v[0].longitude], 15); return }
    map.fitBounds(L.latLngBounds(v.map(r => [r.latitude, r.longitude])), { padding: [48, 48], maxZoom: 15 })
  }, [rooms, map, skip])
  return null
}

// ── Focus selected room ─────────────────────────────────────
function FocusSelected({ rooms, id }: { rooms: Room[]; id?: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (!id) return
    const r = rooms.find(x => x.id === id)
    if (r?.latitude && r?.longitude) map.flyTo([r.latitude, r.longitude], 16, { animate: true, duration: 0.8 })
  }, [id, rooms, map])
  return null
}

// ── LocateTrigger — chạy trong context map ──────────────────
interface LocateProps {
  trigger: number
  onFound: (lat: number, lng: number, acc: number) => void
  onError: (msg: string) => void
  onLoading: (v: boolean) => void
}
function LocateTrigger({ trigger, onFound, onError, onLoading }: LocateProps) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    if (!navigator.geolocation) { onError('Trình duyệt không hỗ trợ GPS.'); return }
    onLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng, accuracy: acc } }) => {
        onFound(lat, lng, acc)
        onLoading(false)
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 })
      },
      err => {
        const msgs: Record<number, string> = {
          1: 'Bạn đã từ chối quyền truy cập vị trí.',
          2: 'Không thể xác định vị trí. Thử lại sau.',
          3: 'Hết thời gian chờ GPS.',
        }
        onError(msgs[err.code] ?? 'Lỗi định vị.')
        onLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [trigger])
  return null
}

// ── Grab map container DOM node ─────────────────────────────
function MapContainerRef({ onReady }: { onReady: (el: HTMLElement) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map.getContainer())
  }, [map])
  return null
}

// ── Main ────────────────────────────────────────────────────
interface RoomMapProps {
  rooms: Room[]
  selectedRoomId?: number | null
  onMarkerClick?: (room: Room) => void
}

export default function RoomMap({ rooms, selectedRoomId, onMarkerClick }: RoomMapProps) {
  const navigate = useNavigate()

  const [myLoc,      setMyLoc]      = useState<{ lat: number; lng: number; acc: number } | null>(null)
  const [trigger,    setTrigger]    = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [errMsg,     setErrMsg]     = useState('')
  const [mapEl,      setMapEl]      = useState<HTMLElement | null>(null)
  const hasLocated   = useRef(false)  // sau khi locate, ngăn FitBounds chạy lại

  // Memo để tránh FitBounds re-run do array mới mọi render
  const validRooms = useMemo(
    () => rooms.filter(r => r.latitude !== 0 || r.longitude !== 0),
    [rooms]
  )

  const getIcon = (room: Room) => {
    if (room.id === selectedRoomId) return ICON_ORANGE
    if (!room.isAvailable)          return ICON_GRAY
    return ICON_BLUE
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[10.8231, 106.6297]}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds rooms={validRooms} skip={hasLocated.current} />
        <FocusSelected rooms={validRooms} id={selectedRoomId} />
        <MapContainerRef onReady={setMapEl} />

        <LocateTrigger
          trigger={trigger}
          onFound={(lat, lng, acc) => {
          hasLocated.current = true   // ngăn FitBounds override
          setMyLoc({ lat, lng, acc })
        }}
          onError={setErrMsg}
          onLoading={setLoading}
        />

        {/* Marker vị trí người dùng */}
        {myLoc && (
          <>
            <Circle
              center={[myLoc.lat, myLoc.lng]}
              radius={myLoc.acc}
              pathOptions={{ color: '#2563eb', fillColor: '#93c5fd', fillOpacity: 0.15, weight: 1.5 }}
            />
            <Marker position={[myLoc.lat, myLoc.lng]} icon={MY_LOC_ICON}>
              <Popup maxWidth={160}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, color: '#1d4ed8', margin: '0 0 4px' }}>📍 Vị trí của bạn</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Độ chính xác: ~{Math.round(myLoc.acc)}m</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Room markers */}
        {validRooms.map(room => (
          <Marker
            key={room.id}
            position={[room.latitude, room.longitude]}
            icon={getIcon(room)}
            eventHandlers={{ click: () => onMarkerClick?.(room) }}
          >
            <Popup maxWidth={260}>
              <div className="font-sans">
                {room.imageUrls?.length > 0 ? (
                  <img src={room.imageUrls[0]} alt={room.title}
                    className="w-full h-32 object-cover rounded-md mb-2"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-24 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-slate-400 text-xs">Chưa có ảnh</div>
                )}

                <span className="inline-block text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full mb-1">
                  {room.categoryName}
                </span>
                <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">{room.title}</h3>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-blue-600 font-bold text-sm">{formatPrice(room.price)}</span>
                  <span className="text-slate-500 text-xs">{formatArea(room.area)}</span>
                </div>

                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                  room.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                }`}>
                  {room.isAvailable ? '● Còn phòng' : '● Hết phòng'}
                </span>

                <p className="text-slate-500 text-xs mb-3">📍 {room.address}</p>

                <button
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  Xem chi tiết →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Portal: render controls vào trong map container ──
          Leaflet's .leaflet-control-container có z-index 1000,
          nên ta inject thẳng vào container với z-index cao hơn  */}
      {mapEl && createPortal(
        <>
          {/* Nút locate — góc trái trên, ngay dưới zoom +/- */}
          <div style={{
            position: 'absolute', top: 80, left: 10,
            zIndex: 1100, pointerEvents: 'auto',
          }}>
            <button
              onClick={() => { setErrMsg(''); setTrigger(t => t + 1) }}
              title="Vị trí của tôi"
              style={{
                width: 40, height: 40, borderRadius: 8,
                background: '#fff',
                border: '2px solid rgba(0,0,0,0.25)',
                boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: loading ? '#9ca3af' : '#2563eb',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {loading ? (
                <svg style={{ animation: 'spin .8s linear infinite', width: 18, height: 18 }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
                </svg>
              )}
            </button>
          </div>

          {/* Legend — góc trái dưới */}
          <div style={{
            position: 'absolute', bottom: 28, left: 10,
            zIndex: 1100, pointerEvents: 'none',
            background: 'rgba(255,255,255,0.93)',
            border: '1px solid rgba(0,0,0,0.18)',
            borderRadius: 8, padding: '7px 11px',
            fontSize: 11, fontWeight: 600,
            boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {[
              { color: '#2563eb', label: 'Còn phòng', rotate: true },
              { color: '#9ca3af', label: 'Hết phòng',  rotate: true },
              { color: '#f59e0b', label: 'Đang xem',   rotate: true },
              { color: '#2563eb', label: 'Vị trí tôi', rotate: false },
            ].map(({ color, label, rotate }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 10, height: 10,
                  borderRadius: rotate ? '50% 50% 50% 0' : '50%',
                  background: color,
                  border: '2px solid white',
                  transform: rotate ? 'rotate(-45deg)' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}/>
                <span style={{ color: '#52525b' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Error toast */}
          {errMsg && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1200,
              background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
              borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}>
              ⚠️ {errMsg}
              <button
                onClick={() => setErrMsg('')}
                style={{ opacity: .6, cursor: 'pointer', background: 'none', border: 'none', fontSize: 15 }}
              >✕</button>
            </div>
          )}

          {/* Loading toast */}
          {loading && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1200,
              background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8',
              borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}>
              <svg style={{ animation: 'spin .8s linear infinite', width: 14, height: 14 }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
              Đang xác định vị trí...
            </div>
          )}
        </>,
        mapEl
      )}
    </div>
  )
}
