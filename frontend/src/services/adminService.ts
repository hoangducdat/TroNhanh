// ============================================================
// services/adminService.ts
// Các API dành riêng cho Role ADMIN.
// Axios tự động đính kèm token.
// ============================================================

import axiosClient from '../api/axiosClient'
import type { ApiResponse, Room } from '../types'

const AdminService = {
  /**
   * GET /api/admin/rooms
   * Lấy tất cả phòng trong hệ thống.
   * Cấp admin có thể xem phòng PENDING, APPROVED, REJECTED kể cả bị ẩn.
   */
  getAllRooms: async (status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Room[]> => {
    const res = await axiosClient.get<ApiResponse<Room[]>>('/api/admin/rooms', {
      params: { status }
    })
    return res.data.data
  },

  /**
   * PUT /api/admin/rooms/:id/status
   * Duyệt (APPROVED) hoặc từ chối (REJECTED) phòng.
   */
  updateRoomStatus: async (id: number, status: 'APPROVED' | 'REJECTED'): Promise<Room> => {
    const res = await axiosClient.put<ApiResponse<Room>>(`/api/admin/rooms/${id}/status`, { status })
    return res.data.data
  },

  /**
   * DELETE /api/admin/rooms/:id
   * Xóa vĩnh viễn phòng (kể cả của landlord khác).
   */
  deleteRoom: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/admin/rooms/${id}`)
  },
  
  /**
   * PATCH /api/admin/rooms/:id/availability
   * Toggle Còn phòng / Hết phòng.
   */
  toggleAvailability: async (id: number): Promise<Room> => {
    const res = await axiosClient.patch<ApiResponse<Room>>(`/api/admin/rooms/${id}/availability`)
    return res.data.data
  },
}

export default AdminService
