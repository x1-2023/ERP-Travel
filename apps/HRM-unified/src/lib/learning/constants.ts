export const COURSE_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PUBLISHED: { label: 'Đã xuất bản', color: 'green' },
  ARCHIVED: { label: 'Lưu trữ', color: 'yellow' },
};

export const COURSE_TYPE = {
  CLASSROOM: { label: 'Lớp học', icon: '🏫', color: 'blue' },
  ELEARNING: { label: 'E-Learning', icon: '💻', color: 'green' },
  BLENDED: { label: 'Kết hợp', icon: '🔄', color: 'purple' },
  VIRTUAL: { label: 'Trực tuyến', icon: '🌐', color: 'cyan' },
  ON_THE_JOB: { label: 'Thực hành', icon: '🔧', color: 'orange' },
  MENTORING: { label: 'Mentoring', icon: '👥', color: 'pink' },
};

export const COURSE_LEVEL = {
  BEGINNER: { label: 'Cơ bản', color: 'green', order: 1 },
  INTERMEDIATE: { label: 'Trung cấp', color: 'blue', order: 2 },
  ADVANCED: { label: 'Nâng cao', color: 'orange', order: 3 },
  EXPERT: { label: 'Chuyên gia', color: 'red', order: 4 },
};

export const ENROLLMENT_STATUS = {
  PENDING: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  ENROLLED: { label: 'Đã đăng ký', color: 'green' },
  IN_PROGRESS: { label: 'Đang học', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'gray' },
  NO_SHOW: { label: 'Vắng mặt', color: 'red' },
};

export const SESSION_STATUS = {
  SCHEDULED: { label: 'Đã lên lịch', color: 'blue' },
  IN_PROGRESS: { label: 'Đang diễn ra', color: 'green' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
  POSTPONED: { label: 'Hoãn', color: 'yellow' },
};

export const TRAINING_REQUEST_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PENDING_MANAGER: { label: 'Chờ quản lý duyệt', color: 'yellow' },
  PENDING_HR: { label: 'Chờ HR duyệt', color: 'orange' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'gray' },
};

export const CERTIFICATION_STATUS = {
  ACTIVE: { label: 'Còn hiệu lực', color: 'green' },
  EXPIRING_SOON: { label: 'Sắp hết hạn', color: 'yellow' },
  EXPIRED: { label: 'Hết hạn', color: 'red' },
  REVOKED: { label: 'Đã thu hồi', color: 'gray' },
};

export const LEARNING_PATH_STATUS = {
  NOT_STARTED: { label: 'Chưa bắt đầu', color: 'gray' },
  IN_PROGRESS: { label: 'Đang học', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  ABANDONED: { label: 'Đã bỏ', color: 'red' },
};

export const ASSESSMENT_TYPE = {
  QUIZ: { label: 'Trắc nghiệm', icon: '📝' },
  TEST: { label: 'Bài kiểm tra', icon: '📋' },
  ASSIGNMENT: { label: 'Bài tập', icon: '📄' },
  PRACTICAL: { label: 'Thực hành', icon: '🔧' },
  SURVEY: { label: 'Khảo sát', icon: '📊' },
};

export const QUESTION_TYPE = {
  SINGLE_CHOICE: { label: 'Chọn một', autoGrade: true },
  MULTIPLE_CHOICE: { label: 'Chọn nhiều', autoGrade: true },
  TRUE_FALSE: { label: 'Đúng/Sai', autoGrade: true },
  SHORT_ANSWER: { label: 'Trả lời ngắn', autoGrade: false },
  ESSAY: { label: 'Tự luận', autoGrade: false },
  RATING: { label: 'Đánh giá', autoGrade: true },
};

export const SKILL_LEVELS = [
  { value: 1, label: 'Beginner', description: 'Kiến thức cơ bản, cần hướng dẫn' },
  { value: 2, label: 'Elementary', description: 'Có thể làm việc với sự hỗ trợ' },
  { value: 3, label: 'Intermediate', description: 'Thành thạo, tự chủ' },
  { value: 4, label: 'Advanced', description: 'Chuyên gia, hướng dẫn người khác' },
  { value: 5, label: 'Expert', description: 'Thought leader, định hướng' },
];

export const PROVIDER_TYPES = [
  { value: 'internal', label: 'Nội bộ' },
  { value: 'external', label: 'Bên ngoài' },
  { value: 'online_platform', label: 'Nền tảng online' },
];

export const CONTENT_TYPES = [
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'document', label: 'Tài liệu', icon: '📝' },
  { value: 'presentation', label: 'Trình chiếu', icon: '📊' },
  { value: 'url', label: 'Liên kết', icon: '🔗' },
  { value: 'scorm', label: 'SCORM', icon: '📦' },
];

export const CERTIFICATION_EXPIRY_WARNING_DAYS = 90;
