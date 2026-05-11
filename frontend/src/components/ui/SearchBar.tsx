// ============================================================
// components/ui/SearchBar.tsx
// Thanh tìm kiếm và bộ lọc cho trang chủ.
// Props: value của filter + callback onChange.
// ============================================================

import { useState, useEffect } from 'react'
import type { Category, SearchParams } from '../../types'

// Danh sách 63 tỉnh/thành phố Việt Nam
const VIETNAM_CITIES = [
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

interface SearchBarProps {
  categories: Category[]
  params: SearchParams
  onChange: (params: SearchParams) => void
  loading?: boolean
}

export default function SearchBar({ categories, params, onChange, loading }: SearchBarProps) {
  const [keyword, setKeyword] = useState(params.keyword ?? '')

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...params, keyword: keyword || undefined })
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange({ ...params, categoryId: val ? Number(val) : undefined })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange({ ...params, city: val || undefined })
  }

  const handleMinPrice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange({ ...params, minPrice: val ? Number(val) : undefined })
  }

  const handleMaxPrice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange({ ...params, maxPrice: val ? Number(val) : undefined })
  }

  const handleMinArea = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange({ ...params, minArea: val ? Number(val) : undefined })
  }

  const handleReset = () => {
    setKeyword('')
    onChange({})
  }

  const hasFilter = keyword || params.categoryId || params.city ||
                    params.minPrice || params.maxPrice || params.minArea || params.isAvailable !== undefined

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 space-y-2 flex-shrink-0">

      {/* ── Keyword search ───────────────────────────────── */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên, địa chỉ..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="input-field pl-9 pr-4 text-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {/* ── City filter ───────────────────────────────────── */}
      <select
        value={params.city ?? ''}
        onChange={handleCityChange}
        className="input-field text-sm py-2 w-full"
      >
        <option value="">📍 Tất cả tỉnh/thành phố</option>
        {VIETNAM_CITIES.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {/* ── Filters row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">

        {/* Category */}
        <select
          value={params.categoryId ?? ''}
          onChange={handleCategoryChange}
          className="input-field text-sm py-2 col-span-2"
        >
          <option value="">🏠 Tất cả loại phòng</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Min price */}
        <select
          value={params.minPrice ?? ''}
          onChange={handleMinPrice}
          className="input-field text-sm py-2"
        >
          <option value="">Giá từ...</option>
          <option value="1000000">1 triệu</option>
          <option value="2000000">2 triệu</option>
          <option value="3000000">3 triệu</option>
          <option value="5000000">5 triệu</option>
          <option value="7000000">7 triệu</option>
          <option value="10000000">10 triệu</option>
        </select>

        {/* Max price */}
        <select
          value={params.maxPrice ?? ''}
          onChange={handleMaxPrice}
          className="input-field text-sm py-2"
        >
          <option value="">Giá đến...</option>
          <option value="2000000">2 triệu</option>
          <option value="3000000">3 triệu</option>
          <option value="5000000">5 triệu</option>
          <option value="7000000">7 triệu</option>
          <option value="10000000">10 triệu</option>
          <option value="20000000">20 triệu</option>
        </select>

        {/* Min area */}
        <select
          value={params.minArea ?? ''}
          onChange={handleMinArea}
          className="input-field text-sm py-2"
        >
          <option value="">Diện tích từ...</option>
          <option value="10">10 m²</option>
          <option value="15">15 m²</option>
          <option value="20">20 m²</option>
          <option value="30">30 m²</option>
          <option value="50">50 m²</option>
        </select>

        {/* Availability */}
        <select
          value={params.isAvailable === undefined ? '' : params.isAvailable.toString()}
          onChange={e => {
            const val = e.target.value
            onChange({ ...params, isAvailable: val === '' ? undefined : val === 'true' })
          }}
          className="input-field text-sm py-2"
        >
          <option value="">Tình trạng phòng...</option>
          <option value="true">Còn trống</option>
          <option value="false">Đã cho thuê</option>
        </select>

        {/* Reset button */}
        {hasFilter ? (
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1 py-2 rounded-lg border
                       border-red-200 bg-red-50 text-red-600 text-sm font-medium
                       hover:bg-red-100 transition-colors cursor-pointer col-span-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa lọc
          </button>
        ) : (
          <div className="col-span-2" /> // giữ grid layout
        )}

      </div>
    </div>
  )
}
