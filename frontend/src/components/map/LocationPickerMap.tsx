// ============================================================
// components/map/LocationPickerMap.tsx
// Component bản đồ nhỏ dùng trong Form đăng tin để chủ trọ 
// chọn tọa độ (latitude, longitude) bằng cách click.
// ============================================================

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'

interface LocationPickerMapProps {
  position: [number, number] | null
  onChange: (lat: number, lng: number) => void
  className?: string
}

// Custom hook của Leaflet để bắt sự kiện click trên map
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Component để update view khi position thay đổi từ bên ngoài (ví dụ khi edit)
function MapUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true })
    }
  }, [map, position])
  return null
}

export default function LocationPickerMap({ position, onChange, className = 'h-64 w-full' }: LocationPickerMapProps) {
  // Center mặc định: TP.HCM
  const defaultCenter: [number, number] = [10.8231, 106.6297]
  const center = position || defaultCenter

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-300 z-0 relative ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        <MapUpdater position={position} />
        {position && <Marker position={position} />}
      </MapContainer>
      
      {/* Lớp phủ hướng dẫn */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] 
                      bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm 
                      text-xs font-medium text-slate-700 border border-slate-200 pointer-events-none">
        📍 Click vào bản đồ để chọn vị trí chính xác
      </div>
    </div>
  )
}
