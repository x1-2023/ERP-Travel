'use client'

import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// ENHANCED TOAST HOOK
// ═══════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

export function useEnhancedToast() {
  const showToast = (options: ToastOptions) => {
    const { title, description, type = 'info', duration = 5000 } = options

    switch (type) {
      case 'success':
        toast.success(title, { description, duration })
        break
      case 'error':
        toast.error(title, { description, duration })
        break
      case 'warning':
        toast.warning(title, { description, duration })
        break
      case 'info':
      default:
        toast.info(title, { description, duration })
        break
    }
  }

  return {
    success: (title: string, description?: string) =>
      showToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: 'info' }),
    custom: showToast,
    // Convenience methods with Vietnamese messages
    saved: () => showToast({ title: 'Đã lưu', description: 'Dữ liệu đã được lưu thành công', type: 'success' }),
    deleted: () => showToast({ title: 'Đã xóa', description: 'Dữ liệu đã được xóa thành công', type: 'success' }),
    created: () => showToast({ title: 'Đã tạo', description: 'Dữ liệu đã được tạo thành công', type: 'success' }),
    updated: () => showToast({ title: 'Đã cập nhật', description: 'Dữ liệu đã được cập nhật thành công', type: 'success' }),
    networkError: () => showToast({ title: 'Lỗi kết nối', description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.', type: 'error' }),
    serverError: () => showToast({ title: 'Lỗi hệ thống', description: 'Đã xảy ra lỗi. Vui lòng thử lại sau.', type: 'error' }),
    unauthorized: () => showToast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện hành động này.', type: 'error' }),
    sessionExpired: () => showToast({ title: 'Phiên hết hạn', description: 'Vui lòng đăng nhập lại.', type: 'warning' })
  }
}
