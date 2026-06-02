/**
 * Translations for Promo Master
 * Usage: const { t } = useTranslation();
 *        t('dashboard.title') -> 'Dashboard' or 'Tổng quan'
 */

export const translations = {
  // Common
  common: {
    save: { vi: 'Lưu', en: 'Save' },
    cancel: { vi: 'Hủy', en: 'Cancel' },
    delete: { vi: 'Xóa', en: 'Delete' },
    edit: { vi: 'Sửa', en: 'Edit' },
    add: { vi: 'Thêm', en: 'Add' },
    search: { vi: 'Tìm kiếm', en: 'Search' },
    filter: { vi: 'Lọc', en: 'Filter' },
    export: { vi: 'Xuất', en: 'Export' },
    import: { vi: 'Nhập', en: 'Import' },
    refresh: { vi: 'Làm mới', en: 'Refresh' },
    loading: { vi: 'Đang tải...', en: 'Loading...' },
    noData: { vi: 'Không có dữ liệu', en: 'No data' },
    confirm: { vi: 'Xác nhận', en: 'Confirm' },
    back: { vi: 'Quay lại', en: 'Back' },
    next: { vi: 'Tiếp theo', en: 'Next' },
    previous: { vi: 'Trước', en: 'Previous' },
    submit: { vi: 'Gửi', en: 'Submit' },
    reset: { vi: 'Đặt lại', en: 'Reset' },
    close: { vi: 'Đóng', en: 'Close' },
    yes: { vi: 'Có', en: 'Yes' },
    no: { vi: 'Không', en: 'No' },
    all: { vi: 'Tất cả', en: 'All' },
    none: { vi: 'Không có', en: 'None' },
    active: { vi: 'Đang hoạt động', en: 'Active' },
    inactive: { vi: 'Không hoạt động', en: 'Inactive' },
    pending: { vi: 'Chờ duyệt', en: 'Pending' },
    approved: { vi: 'Đã duyệt', en: 'Approved' },
    rejected: { vi: 'Từ chối', en: 'Rejected' },
    draft: { vi: 'Nháp', en: 'Draft' },
    status: { vi: 'Trạng thái', en: 'Status' },
    actions: { vi: 'Hành động', en: 'Actions' },
    details: { vi: 'Chi tiết', en: 'Details' },
    view: { vi: 'Xem', en: 'View' },
    download: { vi: 'Tải xuống', en: 'Download' },
    upload: { vi: 'Tải lên', en: 'Upload' },
  },

  // Navigation / Sidebar
  nav: {
    dashboard: { vi: 'Tổng quan', en: 'Dashboard' },
    promotions: { vi: 'Khuyến mãi', en: 'Promotions' },
    calendar: { vi: 'Lịch', en: 'Calendar' },
    budget: { vi: 'Ngân sách', en: 'Budget' },
    claims: { vi: 'Yêu cầu', en: 'Claims' },
    reports: { vi: 'Báo cáo', en: 'Reports' },
    settings: { vi: 'Cài đặt', en: 'Settings' },
    customers: { vi: 'Khách hàng', en: 'Customers' },
    products: { vi: 'Sản phẩm', en: 'Products' },
    analytics: { vi: 'Phân tích', en: 'Analytics' },
    planning: { vi: 'Lập kế hoạch', en: 'Planning' },
    execution: { vi: 'Thực thi', en: 'Execution' },
    finance: { vi: 'Tài chính', en: 'Finance' },
    integration: { vi: 'Tích hợp', en: 'Integration' },
  },

  // Sidebar sections
  sidebar: {
    overview: { vi: 'TỔNG QUAN', en: 'OVERVIEW' },
    budgetManagement: { vi: 'QUẢN LÝ NGÂN SÁCH', en: 'BUDGET MANAGEMENT' },
    businessPlanning: { vi: 'LẬP KẾ HOẠCH KINH DOANH', en: 'BUSINESS PLANNING' },
    promotionPlanning: { vi: 'LẬP KẾ HOẠCH KHUYẾN MÃI', en: 'PROMOTION PLANNING' },
    executionMonitoring: { vi: 'THỰC THI & GIÁM SÁT', en: 'EXECUTION & MONITORING' },
    claimsSettlement: { vi: 'YÊU CẦU & THANH TOÁN', en: 'CLAIMS & SETTLEMENT' },
    financeAccounting: { vi: 'TÀI CHÍNH & KẾ TOÁN', en: 'FINANCE & ACCOUNTING' },
    performanceAnalysis: { vi: 'PHÂN TÍCH HIỆU QUẢ', en: 'PERFORMANCE ANALYSIS' },
    aiAnalytics: { vi: 'AI & PHÂN TÍCH', en: 'AI & ANALYTICS' },
    systemIntegration: { vi: 'TÍCH HỢP HỆ THỐNG', en: 'SYSTEM INTEGRATION' },
    settings: { vi: 'CÀI ĐẶT', en: 'SETTINGS' },
  },

  // TPO Page
  tpo: {
    title: { vi: 'TPO - Tối ưu Khuyến mãi', en: 'TPO - Trade Promotion Optimization' },
    subtitle: { vi: 'Gợi ý khuyến mãi và dự đoán ROI bằng AI', en: 'AI-powered promotion suggestions and ROI prediction' },
    connected: { vi: 'TPO Engine Đã kết nối', en: 'TPO Engine Connected' },
    notConnected: { vi: 'TPO Engine Chưa kết nối', en: 'TPO Engine Not Connected' },
    aiSuggestions: { vi: 'Gợi ý AI', en: 'AI Suggestions' },
    roiPrediction: { vi: 'Dự đoán ROI', en: 'ROI Prediction' },
    getAiSuggestions: { vi: 'LẤY GỢI Ý AI', en: 'GET AI SUGGESTIONS' },
    predictRoi: { vi: 'DỰ ĐOÁN ROI', en: 'PREDICT ROI' },
    channel: { vi: 'Kênh', en: 'Channel' },
    category: { vi: 'Danh mục', en: 'Category' },
    mechanic: { vi: 'Cơ chế', en: 'Mechanic' },
    budget: { vi: 'Ngân sách', en: 'Budget' },
    budgetMin: { vi: 'Ngân sách tối thiểu', en: 'Budget Min' },
    budgetMax: { vi: 'Ngân sách tối đa', en: 'Budget Max' },
    targetRoi: { vi: 'ROI mục tiêu', en: 'Target ROI' },
    numSuggestions: { vi: 'Số gợi ý', en: '# Suggestions' },
    discount: { vi: 'Giảm giá', en: 'Discount' },
    startDate: { vi: 'Ngày bắt đầu', en: 'Start Date' },
    endDate: { vi: 'Ngày kết thúc', en: 'End Date' },
    mechanicsAvailable: { vi: 'cơ chế có sẵn', en: 'mechanics available' },
    channelsAvailable: { vi: 'kênh có sẵn', en: 'channels available' },
  },

  // What-If Analysis
  whatIf: {
    title: { vi: 'Phân tích What-If', en: 'What-If Analysis' },
    subtitle: { vi: 'So sánh các kịch bản khuyến mãi', en: 'Compare promotion scenarios' },
    baseScenario: { vi: 'Kịch bản cơ sở', en: 'Base Scenario' },
    alternativeScenario: { vi: 'Kịch bản thay thế', en: 'Alternative Scenario' },
    addScenario: { vi: 'Thêm kịch bản', en: 'Add Scenario' },
    runSimulation: { vi: 'Chạy mô phỏng', en: 'Run Simulation' },
    comparison: { vi: 'So sánh', en: 'Comparison' },
    winner: { vi: 'Kịch bản tốt nhất', en: 'Winner' },
  },

  // Header
  header: {
    searchPlaceholder: { vi: 'Tìm kiếm khuyến mãi, khách hàng...', en: 'Search promotions, customers...' },
    notifications: { vi: 'Thông báo', en: 'Notifications' },
    settings: { vi: 'Cài đặt', en: 'Settings' },
    logout: { vi: 'Đăng xuất', en: 'Logout' },
    help: { vi: 'Trợ giúp', en: 'Help' },
    keyboardShortcuts: { vi: 'Phím tắt', en: 'Keyboard Shortcuts' },
  },

  // Dashboard
  dashboard: {
    title: { vi: 'Tổng quan', en: 'Dashboard' },
    welcome: { vi: 'Chào mừng trở lại', en: 'Welcome back' },
    totalBudget: { vi: 'Tổng ngân sách', en: 'Total Budget' },
    activePromotions: { vi: 'KM đang chạy', en: 'Active Promotions' },
    pendingClaims: { vi: 'Yêu cầu chờ duyệt', en: 'Pending Claims' },
    roi: { vi: 'ROI trung bình', en: 'Average ROI' },
    recentActivity: { vi: 'Hoạt động gần đây', en: 'Recent Activity' },
    upcomingPromotions: { vi: 'KM sắp tới', en: 'Upcoming Promotions' },
    performanceChart: { vi: 'Biểu đồ hiệu suất', en: 'Performance Chart' },
  },

  // Forms
  form: {
    required: { vi: 'Bắt buộc', en: 'Required' },
    optional: { vi: 'Tùy chọn', en: 'Optional' },
    invalidEmail: { vi: 'Email không hợp lệ', en: 'Invalid email' },
    invalidPhone: { vi: 'Số điện thoại không hợp lệ', en: 'Invalid phone number' },
    minLength: { vi: 'Tối thiểu {min} ký tự', en: 'Minimum {min} characters' },
    maxLength: { vi: 'Tối đa {max} ký tự', en: 'Maximum {max} characters' },
    selectOption: { vi: 'Chọn...', en: 'Select...' },
    enterValue: { vi: 'Nhập giá trị...', en: 'Enter value...' },
  },

  // Messages
  messages: {
    saveSuccess: { vi: 'Lưu thành công', en: 'Saved successfully' },
    saveError: { vi: 'Lỗi khi lưu', en: 'Error saving' },
    deleteSuccess: { vi: 'Xóa thành công', en: 'Deleted successfully' },
    deleteError: { vi: 'Lỗi khi xóa', en: 'Error deleting' },
    confirmDelete: { vi: 'Bạn có chắc muốn xóa?', en: 'Are you sure you want to delete?' },
    networkError: { vi: 'Lỗi kết nối', en: 'Network error' },
    unauthorized: { vi: 'Không có quyền truy cập', en: 'Unauthorized' },
    sessionExpired: { vi: 'Phiên đăng nhập hết hạn', en: 'Session expired' },
  },
} as const;

export type TranslationKey = keyof typeof translations;
export type Language = 'vi' | 'en';
