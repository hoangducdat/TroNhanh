// ============================================================
// pages/landlord/RoomFormPage.tsx
// Trang thêm mới hoặc chỉnh sửa tin đăng (Landlord).
// Hỗ trợ form nhập text, bản đồ chọn tọa độ, và upload nhiều ảnh.
// Nếu URL có /:id/edit -> Chế độ Edit. Nếu không -> Chế độ Create.
// ============================================================

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import LandlordService from '../../services/landlordService'
import CategoryService from '../../services/categoryService'
import LocationPickerMap from '../../components/map/LocationPickerMap'
import type { Category, RoomRequest } from '../../types'

export default function RoomFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  // Data
  const [categories, setCategories] = useState<Category[]>([])
  
  // Form State
  const [formData, setFormData] = useState<RoomRequest>({
    categoryId: 0,
    title: '',
    description: '',
    price: 0,
    area: 0,
    address: '',
    latitude: 0,
    longitude: 0,
  })
  
  // File Upload State (cho Create mode)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // UI State
  const [loadingInit, setLoadingInit] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 1. Tải danh sách category
  useEffect(() => {
    CategoryService.getAll()
      .then(data => {
        setCategories(data)
        if (!isEditMode && data.length > 0 && formData.categoryId === 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }))
        }
      })
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Nếu Edit Mode -> Tải thông tin phòng (tìm trong danh sách của Landlord)
  useEffect(() => {
    if (isEditMode && id) {
      setLoadingInit(true)
      LandlordService.getMyRooms()
        .then(rooms => {
          const room = rooms.find(r => r.id === Number(id))
          if (room) {
            setFormData({
              categoryId: room.categoryId,
              title: room.title,
              description: room.description,
              price: room.price,
              area: room.area,
              address: room.address,
              latitude: room.latitude,
              longitude: room.longitude,
            })
            // Hiển thị ảnh cũ (không cho sửa ở phase này, chỉ show)
            setPreviewUrls(room.imageUrls || [])
          } else {
            setError('Không tìm thấy phòng hoặc bạn không có quyền sửa.')
          }
        })
        .catch(() => setError('Lỗi khi tải thông tin phòng.'))
        .finally(() => setLoadingInit(false))
    }
  }, [id, isEditMode])

  // Cleanup object urls khi unmount hoặc files thay đổi
  useEffect(() => {
    if (isEditMode) return // Edit mode dùng ảnh cũ từ server
    const urls = selectedFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [selectedFiles, isEditMode])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleMapChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isEditMode && id) {
        // Cập nhật thông tin text
        await LandlordService.updateRoom(Number(id), formData)
        // (Upload ảnh mới ở chế độ edit có thể implement sau nếu cần thiết, hiện tại tập trung API cơ bản)
        alert('Cập nhật thành công!')
        navigate('/landlord/rooms')
      } else {
        // Tạo phòng mới
        const newRoom = await LandlordService.createRoom(formData)
        
        // Upload ảnh nếu có
        if (selectedFiles.length > 0) {
          await LandlordService.uploadImages(newRoom.id, selectedFiles)
        }
        
        alert('Đăng tin thành công! Tin của bạn đang chờ Admin duyệt.')
        navigate('/landlord/rooms')
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      setError(axiosErr.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInit) return <div className="p-4">Đang tải...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/landlord/rooms')} className="text-sm text-slate-500 hover:text-slate-700 font-medium mb-2 inline-block">
          ← Quay lại danh sách
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditMode ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Thông tin cơ bản ── */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại phòng</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input-field" required>
                <option value={0} disabled>Chọn loại phòng</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ví dụ: Phòng trọ khép kín, giờ giấc tự do..." className="input-field" required maxLength={255} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ/tháng)</label>
                <input type="number" name="price" value={formData.price || ''} onChange={handleChange} placeholder="VD: 3500000" className="input-field" min={0} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích (m²)</label>
                <input type="number" name="area" value={formData.area || ''} onChange={handleChange} placeholder="VD: 25.5" className="input-field" min={0} step="0.1" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Mô tả tiện ích, vị trí, quy định..." className="input-field resize-none" required />
            </div>
          </div>
        </div>

        {/* ── Địa chỉ & Bản đồ ── */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Địa chỉ & Bản đồ</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chính xác</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP" className="input-field" required maxLength={255} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghim vị trí trên bản đồ</label>
              <p className="text-xs text-slate-500 mb-2">Click vào bản đồ để lấy tọa độ chính xác. Hiện tại: {formData.latitude !== 0 ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}` : 'Chưa chọn'}</p>
              
              <LocationPickerMap
                position={formData.latitude !== 0 && formData.longitude !== 0 ? [formData.latitude, formData.longitude] : null}
                onChange={handleMapChange}
              />
              
              {formData.latitude === 0 && (
                <p className="text-xs text-red-500 mt-2">Vui lòng click chọn vị trí trên bản đồ.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Hình ảnh ── */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Hình ảnh</h2>
          
          {!isEditMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chọn ảnh tải lên (Nhiều ảnh)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              
              {/* Preview ảnh */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} alt={`preview ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-4">Chế độ chỉnh sửa hiện chưa hỗ trợ thay đổi ảnh. Ảnh hiện tại của phòng:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} alt={`room img ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {previewUrls.length === 0 && <p className="text-sm text-slate-400">Không có ảnh nào.</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Submit actions ── */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/landlord/rooms')} className="btn-secondary">
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={submitting || (formData.latitude === 0)}
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Đang lưu...
              </>
            ) : (
              isEditMode ? 'Cập nhật tin' : 'Đăng tin ngay'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
