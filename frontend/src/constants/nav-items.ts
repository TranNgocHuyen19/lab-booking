import {
  LayoutDashboard,
  Calendar,
  Clock,
  FlaskConical,
  Users,
  UserCog,
  CheckSquare,
  DoorOpen,
  BarChart2,
  Building,
  CheckCircle,
  Bell,
  UserPlus,
  History,
  Monitor,
  Settings,
  type LucideIcon
} from 'lucide-react'
import { PATHS } from './paths'
import { Role } from './types'

export interface NavItem {
  label: string
  icon: LucideIcon
  to?: string
  children?: NavItem[]
  end?: boolean
}

export const NAV_ITEMS = {
  [Role.ADMIN]: [
    {
      label: 'Tổng quan',
      icon: LayoutDashboard,
      to: PATHS.ADMIN.DASHBOARD,
      end: true
    },
    {
      label: 'Lịch đăng ký',
      icon: Calendar,
      to: PATHS.ADMIN.REGISTRATION_SCHEDULE
    },
    {
      label: 'Ca sử dụng',
      icon: Clock,
      to: PATHS.ADMIN.LAB_SLOTS
    },
    {
      label: 'Phòng labs',
      icon: FlaskConical,
      to: PATHS.ADMIN.LAB_ROOMS
    },
    {
      label: 'Thiết bị',
      icon: Monitor,
      to: PATHS.ADMIN.DEVICES
    },
    {
      label: 'Nhóm',
      icon: Users,
      to: PATHS.ADMIN.RESEARCH_GROUPS
    },
    {
      label: 'Tài khoản',
      icon: UserCog,
      to: PATHS.ADMIN.ACCOUNTS
    },
    {
      label: 'Phê duyệt',
      icon: CheckSquare,
      children: [
        {
          label: 'Nhóm',
          icon: Users,
          to: PATHS.ADMIN.APPROVALS.RESEARCH_GROUPS
        },
        {
          label: 'Sử dụng Phòng Lab',
          icon: DoorOpen,
          to: PATHS.ADMIN.APPROVALS.LAB_BOOKINGS
        }
      ]
    },
    {
      label: 'Thống kê & Báo cáo',
      icon: BarChart2,
      children: [
        {
          label: 'Phòng & ca',
          icon: Building,
          to: PATHS.ADMIN.STATISTICS.ROOM_SLOT
        },
        {
          label: 'Nhóm & loại hoạt động',
          icon: Users,
          to: PATHS.ADMIN.STATISTICS.RESEARCH_GROUPS
        },
        {
          label: 'Phê duyệt',
          icon: CheckCircle,
          to: PATHS.ADMIN.STATISTICS.LAB_BOOKINGS
        }
      ]
    },
    {
      label: 'Cấu hình',
      icon: Settings,
      to: PATHS.ADMIN.SYSTEM_CONFIG
    }
  ],
  [Role.LECTURER]: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: PATHS.LECTURER.DASHBOARD,
      end: true
    },
    {
      label: 'Nhóm nghiên cứu',
      icon: Users,
      to: PATHS.LECTURER.RESEARCH_GROUPS
    },
    {
      label: 'Yêu cầu tham gia',
      icon: UserPlus,
      to: PATHS.LECTURER.JOIN_REQUESTS
    },
    {
      label: 'Đặt phòng',
      icon: Calendar,
      to: PATHS.LECTURER.BOOKINGS
    },
    {
      label: 'Lịch sử đặt phòng',
      icon: History,
      to: PATHS.LECTURER.BOOKING_HISTORY
    },
    {
      label: 'Hồ sơ cá nhân',
      icon: Bell,
      to: PATHS.LECTURER.PROFILE
    }
  ],
  [Role.STUDENT]: [
    {
      label: 'Trang chủ',
      icon: LayoutDashboard,
      to: PATHS.HOME,
      end: true
    },
    {
      label: 'Lịch thực hành',
      icon: Calendar,
      to: PATHS.STUDENT.SCHEDULE
    },
    {
      label: 'Nhóm nghiên cứu',
      icon: Users,
      to: PATHS.STUDENT.GROUPS
    }
  ],
  [Role.LAB_MANAGER]: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: PATHS.LAB_MANAGER.DASHBOARD,
      end: true
    }
  ]
}
