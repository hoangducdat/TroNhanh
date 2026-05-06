// ============================================================
// services/savedRoomService.ts — Lưu / bỏ lưu phòng yêu thích (Renter)
// ============================================================

import axiosClient from '../api/axiosClient';
import type { ApiResponse, SavedRoom } from '../types';

const SavedRoomService = {
  /**
   * POST /api/renter/saved-rooms/:roomId
   * Lưu phòng vào danh sách yêu thích.
   * Yêu cầu role RENTER.
   */
  save: async (roomId: number): Promise<SavedRoom> => {
    const res = await axiosClient.post<ApiResponse<SavedRoom>>(
      `/api/renter/saved-rooms/${roomId}`
    );
    return res.data.data;
  },

  /**
   * DELETE /api/renter/saved-rooms/:roomId
   * Bỏ lưu phòng.
   */
  unsave: async (roomId: number): Promise<void> => {
    await axiosClient.delete(`/api/renter/saved-rooms/${roomId}`);
  },

  /**
   * GET /api/renter/saved-rooms
   * Lấy danh sách phòng đã lưu của Renter đang đăng nhập.
   */
  getAll: async (): Promise<SavedRoom[]> => {
    const res = await axiosClient.get<ApiResponse<SavedRoom[]>>('/api/renter/saved-rooms');
    return res.data.data;
  },
};

export default SavedRoomService;
