// ============================================================
// types/index.ts — Các TypeScript interface/type dùng trong toàn app
// Bám sát response shape của Backend Spring Boot
// ============================================================

// ── API Response wrapper (Backend trả về dạng này) ─────────
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Enum trạng thái phòng ─────────────────────────────────
export type RoomStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── Enum role người dùng ──────────────────────────────────
export type UserRole = 'ADMIN' | 'LANDLORD' | 'RENTER';

// ── Auth ─────────────────────────────────────────────────
export interface AuthData {
  userId: number;
  username: string;
  role: UserRole;
  accessToken: string;
}

// ── Category ─────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
}

// ── Room ─────────────────────────────────────────────────
export interface Room {
  id: number;
  landlordId: number;
  landlordUsername: string;
  landlordPhone?: string;
  landlordZaloUrl?: string;
  landlordAvatarUrl?: string;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  latitude: number;
  longitude: number;
  status: RoomStatus;
  isHidden: boolean;
  isAvailable: boolean;
  imageUrls: string[];
}

// ── Request DTOs ──────────────────────────────────────────
export interface RoomRequest {
  categoryId: number;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  latitude: number;
  longitude: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
}

// ── Saved Room ────────────────────────────────────────────
export interface SavedRoom {
  savedRoomId: number;
  savedAt: string; // ISO 8601 datetime string
  room: Room;
}

// ── User (Admin view) ─────────────────────────────────────
export interface UserInfo {
  id: number;
  username: string;
  role: UserRole;
  isLocked: boolean;
}

// ── Search Params ─────────────────────────────────────────
export interface SearchParams {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}
