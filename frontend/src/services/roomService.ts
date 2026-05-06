// ============================================================
// services/roomService.ts — API calls liên quan đến phòng trọ
// ============================================================

import axiosClient from '../api/axiosClient';
import type { ApiResponse, Room, SearchParams } from '../types';

const RoomService = {
  /**
   * GET /api/public/rooms/search
   * Tìm kiếm phòng công khai — chỉ trả APPROVED & không bị ẩn.
   * Mọi params đều optional.
   */
  searchRooms: async (params: SearchParams = {}): Promise<Room[]> => {
    // Lọc bỏ các giá trị undefined/empty để không gửi params rỗng lên backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    const res = await axiosClient.get<ApiResponse<Room[]>>('/api/public/rooms/search', {
      params: cleanParams,
    });
    return res.data.data;
  },

  /**
   * GET /api/public/rooms/:id
   * Lấy chi tiết một phòng (public — không cần đăng nhập).
   */
  getRoomById: async (id: number | string): Promise<Room> => {
    const res = await axiosClient.get<ApiResponse<Room>>(`/api/public/rooms/${id}`);
    return res.data.data;
  },
};

export default RoomService;
