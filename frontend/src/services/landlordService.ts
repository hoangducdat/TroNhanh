// ============================================================
// services/landlordService.ts
// Tất cả API call của Landlord Dashboard.
// Yêu cầu JWT token với role LANDLORD (axiosClient tự thêm).
// ============================================================

import axiosClient from '../api/axiosClient'
import type { ApiResponse, Room, RoomRequest } from '../types'

const LandlordService = {
  /**
   * GET /api/landlord/rooms
   * Lấy danh sách tất cả tin của Landlord đang đăng nhập.
   */
  getMyRooms: async (): Promise<Room[]> => {
    const res = await axiosClient.get<ApiResponse<Room[]>>('/api/landlord/rooms')
    return res.data.data
  },

  /**
   * POST /api/landlord/rooms
   * Tạo phòng mới — status tự động = PENDING.
   */
  createRoom: async (data: RoomRequest): Promise<Room> => {
    const res = await axiosClient.post<ApiResponse<Room>>('/api/landlord/rooms', data)
    return res.data.data
  },

  /**
   * PUT /api/landlord/rooms/:id
   * Cập nhật thông tin phòng (kiểm tra ownership ở backend).
   */
  updateRoom: async (id: number, data: RoomRequest): Promise<Room> => {
    const res = await axiosClient.put<ApiResponse<Room>>(`/api/landlord/rooms/${id}`, data)
    return res.data.data
  },

  /**
   * DELETE /api/landlord/rooms/:id
   * Xóa phòng + cascade (saved_rooms, images).
   */
  deleteRoom: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/landlord/rooms/${id}`)
  },

  /**
   * PATCH /api/landlord/rooms/:id/hide
   * Toggle ẩn/hiện tin — server trả về room đã cập nhật.
   */
  toggleHide: async (id: number): Promise<Room> => {
    const res = await axiosClient.patch<ApiResponse<Room>>(`/api/landlord/rooms/${id}/hide`)
    return res.data.data
  },

  /**
   * POST /api/landlord/rooms/:id/images
   * Upload nhiều ảnh cho phòng.
   * Dùng FormData với field name "files" (multipart/form-data).
   * Content-Type được Axios tự set (với boundary) khi dùng FormData.
   */
  uploadImages: async (roomId: number, files: File[]): Promise<Room> => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const res = await axiosClient.post<ApiResponse<Room>>(
      `/api/landlord/rooms/${roomId}/images`,
      formData,
      {
        headers: {
          // Xóa Content-Type để Axios tự set multipart/form-data với boundary
          'Content-Type': undefined,
        },
      }
    )
    return res.data.data
  },

  /**
   * PATCH /api/landlord/rooms/:id/availability
   * Toggle Còn phòng / Hết phòng.
   */
  toggleAvailability: async (id: number): Promise<Room> => {
    const res = await axiosClient.patch<ApiResponse<Room>>(`/api/landlord/rooms/${id}/availability`)
    return res.data.data
  },
}

export default LandlordService
