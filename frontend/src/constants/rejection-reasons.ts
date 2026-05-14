export const GROUP_REJECTION_REASONS = [
  'Lĩnh vực nghiên cứu không phù hợp với định hướng của nhóm',
  'Số lượng thành viên của nhóm đã đạt giới hạn mang tính tối ưu',
  'Chưa đáp ứng được các yêu cầu về kiến thức nền tảng hoặc kỹ năng cần thiết',
  'Thông tin trong đơn đăng ký chưa đầy đủ hoặc chưa thuyết phục',
  'Thời điểm hiện tại nhóm không tiếp nhận thêm thành viên mới'
] as const

export const BOOKING_REJECTION_REASONS = [
  'Phòng lab đã được đặt cho sự kiện/tiết học khác đột xuất',
  'Thông tin mục đích sử dụng không phù hợp với quy định của phòng lab',
  'Số lượng thành viên tham gia vượt quá sức chứa cho phép',
  'Yêu cầu trùng lặp với các lịch đã được duyệt trước đó',
  'Người đăng ký vi phạm quy định sử dụng phòng lab trong các lần trước'
] as const

export type GroupRejectionReasonType = (typeof GROUP_REJECTION_REASONS)[number]
export type BookingRejectionReasonType = (typeof BOOKING_REJECTION_REASONS)[number]
