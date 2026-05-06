// ============================================================
// services/categoryService.ts — Lấy danh sách danh mục phòng trọ
// ============================================================

import axiosClient from '../api/axiosClient';
import type { ApiResponse, Category } from '../types';

const CategoryService = {
  /**
   * GET /api/public/categories
   * Danh sách tất cả danh mục (Phòng trọ, Căn hộ mini,...).
   * Dùng cho dropdown filter trang chủ và form đăng tin.
   */
  getAll: async (): Promise<Category[]> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/api/public/categories');
    return res.data.data;
  },
};

export default CategoryService;
