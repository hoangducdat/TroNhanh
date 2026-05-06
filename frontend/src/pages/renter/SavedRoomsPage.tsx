// ============================================================
// pages/renter/SavedRoomsPage.tsx
// Trang "Phòng đã lưu" — Renter xem & quản lý danh sách yêu thích
// API: GET /api/renter/saved-rooms
//      DELETE /api/renter/saved-rooms/{roomId}
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { formatPrice, formatArea } from '../../utils/format';

interface SavedRoom {
  savedRoomId: number;
  savedAt: string;
  room: {
    id: number;
    title: string;
    address: string;
    price: number;
    area: number;
    status: string;
    isAvailable: boolean;
    imageUrls: string[];
    landlordUsername: string;
    landlordPhone?: string;
    categoryName: string;
  };
}

export default function SavedRoomsPage() {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading]       = useState(true);
  const [removing, setRemoving]     = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await axiosClient.get('/api/renter/saved-rooms');
      setSavedRooms(res.data.data ?? []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUnsave = async (roomId: number) => {
    setRemoving(roomId);
    try {
      await axiosClient.delete(`/api/renter/saved-rooms/${roomId}`);
      setSavedRooms(prev => prev.filter(s => s.room.id !== roomId));
    } catch (_) {}
    setRemoving(null);
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-zinc-200 rounded-xl mb-8 animate-pulse"/>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-72"/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Phòng đã lưu</h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            {savedRooms.length > 0
              ? `${savedRooms.length} phòng trong danh sách yêu thích`
              : 'Chưa có phòng nào được lưu'}
          </p>
        </div>
        <Link
          to="/search"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Tìm thêm phòng
        </Link>
      </div>

      {/* Empty state */}
      {savedRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 className="text-xl font-black text-zinc-900 mb-2">Chưa lưu phòng nào</h3>
          <p className="text-zinc-500 text-sm font-light max-w-xs mb-6">
            Tìm phòng trọ phù hợp và bấm "Lưu tin" để thêm vào danh sách yêu thích.
          </p>
          <Link to="/search" className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all text-sm">
            Khám phá bản đồ →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map(({ savedRoomId, savedAt, room }) => (
            <div
              key={savedRoomId}
              className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                {room.imageUrls?.[0] ? (
                  <img
                    src={room.imageUrls[0]}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  </div>
                )}

                {/* Badge trạng thái */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    room.isAvailable
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-700 text-white'
                  }`}>
                    {room.isAvailable ? 'Còn phòng' : 'Hết phòng'}
                  </span>
                </div>

                {/* Nút bỏ lưu */}
                <button
                  onClick={() => handleUnsave(room.id)}
                  disabled={removing === room.id}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 text-zinc-500"
                  title="Bỏ lưu"
                >
                  {removing === room.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  {room.categoryName}
                </p>
                <Link to={`/rooms/${room.id}`}>
                  <h3 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-2 hover:text-emerald-600 transition-colors mb-2">
                    {room.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 text-zinc-500 text-xs mb-3">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <span className="truncate">{room.address}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <div>
                    <p className="text-lg font-black text-zinc-900">{formatPrice(room.price)}</p>
                    <p className="text-[11px] text-zinc-400">{formatArea(room.area)}</p>
                  </div>
                  <div className="flex gap-2">
                    {room.landlordPhone && (
                      <a
                        href={`tel:${room.landlordPhone}`}
                        className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </a>
                    )}
                    <Link
                      to={`/rooms/${room.id}`}
                      className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                    >
                      Xem →
                    </Link>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 mt-2 font-medium">
                  Đã lưu: {new Date(savedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
