export const ERROR_MESSAGES: Record<number | string, string> = {
  // ==================== COMMON: SYSTEM (1000-1099) ====================
  '1000': 'Lỗi hệ thống không xác định',
  '1001': 'Khóa thông báo không hợp lệ',
  '1002': 'Lỗi máy chủ nội bộ',
  '1003': 'Dịch vụ tạm thời không khả dụng',
  '1004': 'Hệ thống đang bận xử lý quá nhiều yêu cầu. Vui lòng thử lại sau',

  // ==================== COMMON: VALIDATION (1100-1199) ====================
  '1100': 'Yêu cầu không hợp lệ',
  '1101': 'Dữ liệu không hợp lệ',
  '1102': 'Định dạng email không đúng',
  '1103': 'Định dạng số điện thoại không đúng',
  '1104': 'Định dạng ngày không hợp lệ',
  '1105': 'Định dạng giờ không hợp lệ',
  '1106': 'Thiếu trường dữ liệu bắt buộc',
  '1107': 'Dữ liệu quá dài',
  '1108': 'Dữ liệu quá ngắn',
  '1109': 'Giờ kết thúc phải sau giờ bắt đầu',

  // ==================== COMMON: AUTH / SECURITY (1200-1299) ====================
  '1200': 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn',
  '1201': 'Bạn không có quyền thực hiện hành động này',
  '1202': 'Thông tin đăng nhập không chính xác',
  '1203': 'Token truy cập không hợp lệ',
  '1204': 'Phiên làm việc đã hết hạn',
  '1205': 'Token đã bị thu hồi',
  '1206': 'Token làm mới không hợp lệ',
  '1207': 'Token làm mới đã hết hạn',
  '1208': 'Token làm mới đã bị thu hồi',
  '1209': 'Tài khoản đã bị vô hiệu hóa',
  '1210': 'Tài khoản đã bị khóa',
  '1211': 'Phiên làm việc đã kết thúc',
  '1212': 'Vai trò đăng nhập không được phép',
  '1213': 'Mã xác thực không chính xác hoặc đã hết hạn',
  '1214': 'Yêu cầu đặt lại mật khẩu đã hết hạn hoặc không hợp lệ',
  '1215': 'Vui lòng đợi {v} giây trước khi yêu cầu mã OTP mới',
  '1216': 'Quá nhiều lần nhập sai OTP. Vui lòng thử lại sau',
  '1217': 'Gửi mã OTP thất bại. Vui lòng thử lại',

  // ==================== ENTITY: USER (2000-2099) ====================
  '2000': 'Không tìm thấy người dùng',
  '2001': 'Người dùng đã tồn tại',
  '2002': 'Tên đăng nhập đã được sử dụng',
  '2003': 'Email IUH đã được đăng ký',
  '2004': 'Email cá nhân đã được đăng ký',
  '2005': 'Số điện thoại đã được sử dụng',
  '2006': 'Mật khẩu xác nhận không khớp',
  '2007': 'Mật khẩu hiện tại không đúng',
  '2008': 'Mật khẩu quá yếu',
  '2009': 'Không thể tự xóa tài khoản của chính mình',
  '2010': 'Người dùng đang có lịch đặt phòng hoạt động',
  '2011': 'Email không tồn tại',
  '2012': 'Không thể tạo tài khoản sinh viên qua phương thức này',

  // ==================== ENTITY: ROLE (2100-2199) ====================
  '2100': 'Không tìm thấy vai trò',
  '2101': 'Vai trò này đã tồn tại',
  '2102': 'Vai trò đang được sử dụng',
  '2103': 'Không thể xóa vai trò mặc định',

  // ==================== ENTITY: RESEARCH_GROUP (2200-2299) ====================
  '2200': 'Không tìm thấy nhóm nghiên cứu',
  '2201': 'Người dùng đã là thành viên của nhóm này',
  '2202': 'Đã có yêu cầu tham gia đang chờ duyệt cho nhóm này',
  '2203': 'Không tìm thấy yêu cầu tham gia',
  '2204': 'Không thể tự phê duyệt yêu cầu của chính mình',
  '2205': 'Chỉ trưởng nhóm mới có quyền thực hiện hành động này',
  '2206': 'Chỉ người tạo nhóm mới có quyền thực hiện hành động này',
  '2207': 'Trạng thái yêu cầu không hợp lệ cho thao tác này',
  '2208': 'Không thể chỉnh sửa yêu cầu tham gia này',
  '2209': 'Người dùng không phải thành viên của nhóm',
  '2210': 'Người dùng đã là thành viên của nhóm',
  '2211': 'Chỉ người tạo nhóm mới có quyền cập nhật thông tin nhóm',
  '2212': 'Nhóm nghiên cứu riêng tư không thể tham gia bằng yêu cầu',
  '2213': 'Chỉ Trưởng nhóm hoặc Giảng viên có quyền thực hiện hành động này',
  '2214': 'Bạn không có đủ quyền hạn cho hành động này',
  '2215': 'Nhóm phải có ít nhất một Trưởng nhóm',
  '2216': 'Người dùng không phải thành viên của nhóm nghiên cứu này',
  '2217': 'Chỉ ADMIN hoặc Giảng viên mới có quyền tạo nhóm nghiên cứu',

  // ==================== ENTITY: FILE / DEVICE (2300-2399) ====================
  '2300': 'Không tìm thấy tệp tin',
  '2301': 'Lỗi khi tải tệp tin lên',
  '2302': 'Tệp tin không hợp lệ',
  '2303': 'Tên thiết bị đã tồn tại',
  '2304': 'Không tìm thấy thiết bị',
  '2305': 'Thiết bị không có sẵn trong phòng thực hành này',
  '2306': 'Số lượng thiết bị không đủ',

  // ==================== ENTITY: LAB_ROOM (2400-2499) ====================
  '2400': 'Không tìm thấy phòng thực hành',
  '2401': 'Tên phòng thực hành đã tồn tại',

  // ==================== ENTITY: SLOT (2500-2599) ====================
  '2500': 'Không tìm thấy ca học',
  '2501': 'Ca học này đã có lịch đặt khóa luận tốt nghiệp',

  // ==================== ENTITY: BOOKING (2600-2699) ====================
  '2600': 'Không tìm thấy lịch đặt phòng',
  '2601': 'Lịch đặt phòng bị trùng với lịch đã có',
  '2602': 'Số lượng người tham gia vượt quá sức chứa của phòng',
  '2603': 'Không thể đặt phòng cho các ngày trong quá khứ',
  '2604': 'Lịch đặt phòng phải có ít nhất một người tham gia',
  '2605': 'Không thể hủy lịch đặt phòng ở trạng thái hiện tại',
  '2606': 'Chỉ người tạo lịch đặt mới có quyền thực hiện hành động này',
  '2607': 'Không thể đặt khóa luận khi ca học đã có lịch đặt khác',
  '2608': 'Bạn không có quyền xem lịch đặt phòng này',
  '2609': 'Người tạo lịch đặt phải hủy lịch, không thể chỉ rời khỏi',
  '2610': 'Không thể xóa người tham gia cuối cùng',
  '2611': 'Người tham gia không thể rời khỏi lịch đặt khóa luận',
  '2612': 'Người dùng không phải là người tham gia lịch đặt này',
  '2613': 'Chỉ ADMIN hoặc Giảng viên mới có thể tạo lịch đặt khóa luận',
  '2614': 'Không thể phê duyệt lịch đặt ở trạng thái hiện tại',
  '2615': 'Không thể từ chối lịch đặt ở trạng thái hiện tại',
  '2616': 'Người dùng đã có lịch đặt khác trong cùng khung giờ này',
  '2617': 'Không thể đặt ca học đã kết thúc',
  '2618': 'Ngày đặt phòng vượt quá số ngày đặt trước tối đa cho vai trò của bạn',
  '2619': 'Vai trò của bạn không được phép tạo lịch đặt phòng',
  '2620': 'Chỉ lịch đặt khóa luận mới có thể thêm người tham gia',
  '2621': 'Người dùng đã là người tham gia trong lịch đặt này',
  '2622': 'Không thể cập nhật lịch đặt ở trạng thái hiện tại',
  '2623': 'Đã hết thời gian cho phép cập nhật (phải trước giờ bắt đầu 30 phút)',
  '2624': 'Dữ liệu đặt phòng không hợp lệ: Không tìm thấy ca học nào',
  '2625': 'Hết hạn duyệt đơn',
  '2626': 'Hết hạn hủy đơn',
  '2627': 'Hết hạn đặt phòng cho vai trò của bạn',
  '2628': 'Du lieu dang ky phong khong hop le',
  '2629': 'Loai booking khong duoc ho tro',
  '2630': 'Ban da co booking ca nhan trong cung ngay va ca',
  '2631': 'Ban da xac nhan tham gia booking nhom trong cung ngay va ca',
  '2632': 'Booking nhom phai gan dung mot nhom nghien cuu',
  '2633': 'Nhom nghien cuu da co booking dang hoat dong trong cung ngay va ca',
  '2634': 'Phong da co booking thesis trong cung ngay va ca',
  '2635': 'Ban dang co loi moi nhom hoac booking nhom can xu ly trong cung ngay va ca',
  '2636': 'Danh sach ca dat phong bi trung ngay va ca',

  // ==================== ENTITY: ATTENDANCE (2700-2799) ====================
  '2700': 'Không tìm thấy bản ghi điểm danh',
  '2701': 'Đã điểm danh vào cho ca này rồi',
  '2702': 'Đã điểm danh ra cho ca này rồi',
  '2703': 'Phải điểm danh vào trước khi điểm danh ra',
  '2704': 'Còn quá sớm để điểm danh',
  '2705': 'Bạn đang ở quá xa phòng thực hành',
  '2706': 'Lịch đặt phải được phê duyệt trước khi điểm danh',
  '2707': 'Không thể điểm danh sau khi ca học đã kết thúc',
  '2708': 'Vui lòng nhập ghi chú (bắt buộc khi đến trễ / ra sớm)',
  '2709': 'Chưa đến giờ kết thúc ca, không thể điểm danh ra',
  '2710': 'Bạn không có quyền xem dữ liệu điểm danh này',

  // ==================== ENTITY: SYSTEM CONFIGURATION (2800-2899) ====================
  '2800': 'Không tìm thấy cấu hình hệ thống',
  '2801': 'Cấu hình đã tồn tại',
  '2802': 'Giá trị cấu hình không hợp lệ',
  '2803': 'Cập nhật cấu hình thất bại',
  '2804': 'Không phát hiện thay đổi nào'
}

type ErrorData = Record<string, unknown>

const formatTimeDescription = (limitMinutes: number): string => {
  if (limitMinutes > 0) {
    return `ít nhất ${limitMinutes} phút trước giờ bắt đầu`
  } else if (limitMinutes === 0) {
    return 'trước giờ bắt đầu'
  } else {
    return `tối đa ${Math.abs(limitMinutes)} phút sau giờ bắt đầu`
  }
}

const formatDynamicMessage = (code: string, data: ErrorData): string | null => {
  switch (code) {
    // Booking creation time invalid
    case '2627': {
      const limitMinutes = data.limitMinutes as number
      const role = data.role as string
      const roleVi = role === 'STUDENT' ? 'Sinh viên' : role === 'LECTURER' ? 'Giảng viên' : role
      return `Hết hạn đặt phòng. Quy định yêu cầu ${roleVi} đặt ${formatTimeDescription(limitMinutes)}`
    }

    // Late cancellation
    case '2626': {
      const minMinutes = data.minMinutesBeforeStartToCancel as number
      return `Hết hạn hủy đơn. Quy định yêu cầu hủy ít nhất ${minMinutes} phút trước giờ bắt đầu`
    }

    // Approval deadline
    case '2625': {
      const limitMinutes = data.limitMinutes as number
      return `Hết hạn duyệt đơn. Quy định yêu cầu duyệt ${formatTimeDescription(limitMinutes)}`
    }

    // Booking too far in advance
    case '2618': {
      const maxDays = data.maxAdvanceDays as number
      const role = data.role as string
      const roleVi = role === 'STUDENT' ? 'Sinh viên' : role === 'LECTURER' ? 'Giảng viên' : role
      return `${roleVi} chỉ được đặt trước tối đa ${maxDays} ngày`
    }

    // Too early to check in
    case '2704': {
      const earlyMinutes = data.earlyCheckinMinutes as number
      const minutesUntil = data.minutesUntilAllowed as number
      return `Còn quá sớm để điểm danh. Bạn có thể check-in sớm nhất ${earlyMinutes} phút trước giờ bắt đầu. Vui lòng quay lại sau ${minutesUntil} phút`
    }

    // Note required
    case '2708': {
      const reason = data.reason as string
      const lateMinutes = data.lateMinutes as number
      if (reason === 'late_checkin') {
        return `Bạn đến muộn ${lateMinutes} phút. Vui lòng nhập lý do để tiếp tục điểm danh`
      } else if (reason === 'late_checkout') {
        return `Bạn ra muộn ${lateMinutes} phút. Vui lòng nhập lý do để tiếp tục điểm danh ra`
      }
      return null
    }

    // Booking exceeds capacity
    case '2602': {
      const capacity = data.capacity as number
      const existing = data.existingParticipants as number
      const requested = data.requestedParticipants as number
      const slotName = data.slotName as string
      return `Ca ${slotName} đã có ${existing} người, không đủ chỗ cho ${requested} người mới (sức chứa: ${capacity})`
    }

    // Slot has thesis booking
    case '2501': {
      const slotName = data.slotName as string
      return `Ca ${slotName} đã có lịch đặt khóa luận tốt nghiệp`
    }

    default:
      return null
  }
}

export const getErrorMessage = (
  code: number | string | undefined,
  defaultMessage: string = 'Lỗi không xác định',
  data?: ErrorData
) => {
  if (code === undefined || code === null) return defaultMessage

  const errorCode = code.toString()

  // Try to format dynamic message using data first
  if (data && Object.keys(data).length > 0) {
    const dynamicMessage = formatDynamicMessage(errorCode, data)
    if (dynamicMessage) return dynamicMessage
  }

  // Fall back to static message
  const translatedMessage = ERROR_MESSAGES[errorCode]
  return translatedMessage || defaultMessage
}
