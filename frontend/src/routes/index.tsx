import { useRoutes, Navigate, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { Role, type RoleType } from '@/constants/types'
import { PATHS } from '@/constants/paths'
import { type UserResponse } from '@/schemas/user.schema'
import { getDashboardPath } from '@/utils/rbac'

import AuthLayout from '@/layouts/auth-layout'
import LectureLayout from '@/layouts/lecturer-layout'
import AdminLayout from '@/layouts/admin-layout'
import StudentLayout from '@/layouts/student-layout'

import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'

import AdminDashboardPage from '@/pages/admin/dashboard/admin-dashboard-page'
import AdminRegistrationSchedulePage from '@/pages/admin/registration-schedule/admin-registration-schedule-page'
import AdminSlotBookingDetailPage from '@/pages/admin/registration-schedule/admin-slot-booking-detail-page'
import AdminSlotsPage from '@/pages/admin/slots/admin-slots-page'
import AdminLabRoomsPage from '@/pages/admin/lab-rooms/admin-lab-rooms-page'
import AdminDevicesPage from '@/pages/admin/devices/admin-devices-page'
import AdminResearchGroupsPage from '@/pages/admin/research-groups/admin-research-groups-page'
import AdminAddResearchGroupPage from '@/pages/admin/research-groups/admin-add-research-group-page'
import AdminUpdateResearchGroupPage from '@/pages/admin/research-groups/admin-update-research-group-page'
import AdminResearchGroupDetailPage from '@/pages/admin/research-groups/admin-research-group-detail-page'
import AdminAccountListPage from '@/pages/admin/accounts/admin-account-list-page'
import AdminAccountDetailPage from '@/pages/admin/accounts/admin-account-detail-page'
import AdminCreateAccountPage from '@/pages/admin/accounts/admin-create-account-page'
import AdminApprovalResearchGroupsPage from '@/pages/admin/approvals/admin-approval-groups-join-requests-page'
import AdminJoinRequestDetailPage from '@/pages/admin/approvals/admin-join-request-detail-page'
import AdminApprovalLabBookingsPage from '@/pages/admin/approvals/admin-approval-lab-bookings-page'
import AdminBookingDetailPage from '@/pages/admin/approvals/admin-booking-detail-page'
import AdminReportResearchGroupsPage from '@/pages/admin/statistics/admin-report-research-groups-page'
import AdminReportLabBookingsPage from '@/pages/admin/statistics/admin-report-lab-bookings-page'
import AdminRoomSlotReportPage from '@/pages/admin/statistics/admin-room-slot-report-page'
import AdminSystemConfigPage from '@/pages/admin/settings/admin-system-config-page'
import AdminAddLabRoomPage from '@/pages/admin/lab-rooms/admin-add-lab-room-page'
import AdminEditLabRoomPage from '@/pages/admin/lab-rooms/admin-edit-lab-room-page'
import LabManagerDashboardPage from '@/pages/lab-manager/dashboard-page'
import LecturerDashboardPage from '@/pages/lecturer/dashboard/lecturer-dashboard-page'
import LecturerResearchGroupPage from '@/pages/lecturer/research-group/lecturer-research-group-page'
import LecturerAddResearchGroupPage from '@/pages/lecturer/research-group/lecturer-add-research-group-page'
import LecturerUpdateResearchGroupPage from '@/pages/lecturer/research-group/lecturer-update-research-group-page'
import LecturerResearchGroupDetailPage from '@/pages/lecturer/research-group/lecturer-research-group-detail-page'
import LecturerSchedulePage from '@/pages/lecturer/booking/lecturer-schedule-page'
import BookingDetailPage from '@/pages/lecturer/booking/lecturer-booking-detail-page'
import LecturerJoinRequestPage from '@/pages/lecturer/join-request/lecturer-join-request-page'
import LecturerJoinRequestDetailPage from '@/pages/lecturer/join-request/lecturer-join-request-detail-page'
import LecturerBookingHistoryPage from '@/pages/lecturer/booking-history/lecturer-booking-history-page'
import LecturerProfilePage from '@/pages/lecturer/profile/lecturer-profile-page'

import StudentHomePage from '@/pages/student/home-page'
import StudentSchedulePage from '@/pages/student/schedule-page'
import ResearchGroupsPage from '@/pages/student/research-group-page'
import ResearchGroupDetailPage from '@/pages/student/research-group-detail-page'
import ContactPage from '@/pages/student/contact-page'
import ProfilePage from '@/pages/profile-page'

import { PublicRoute } from './public-route'
import { PrivateRoute } from './private-route'

const LecturerLayoutWrapper = () => {
  const { user } = useAuth()
  if (!user) return null
  return <LectureLayout user={user} />
}

const AdminLayoutWrapper = () => {
  const { user } = useAuth()
  if (!user) return null
  return <AdminLayout user={user} />
}

const LabManagerLayoutWrapper = () => {
  const { user } = useAuth()
  if (!user) return null
  return <LectureLayout user={user} />
}

const StudentLayoutWrapper = () => {
  const { user } = useAuth()
  return <StudentLayout user={user ?? null} />
}

const AppRoutes = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = (user: UserResponse) => {
    navigate(getDashboardPath(user.role as RoleType), { replace: true })
  }

  const element = useRoutes([
    {
      element: <StudentLayoutWrapper />,
      children: [
        {
          path: PATHS.HOME,
          element: <StudentHomePage />
        },
        {
          path: PATHS.STUDENT.SCHEDULE,
          element: <StudentSchedulePage />
        },
        {
          path: PATHS.STUDENT.CONTACT,
          element: <ContactPage />
        },
        {
          path: PATHS.STUDENT.GROUPS,
          element: <ResearchGroupsPage />
        },
        {
          path: PATHS.STUDENT.GROUP_DETAIL,
          element: <ResearchGroupDetailPage />
        }
      ]
    },
    {
      element: <PublicRoute />,
      children: [
        {
          path: PATHS.LECTURER.LOGIN,
          element: <AuthLayout />,
          children: [
            {
              index: true,
              element: <LoginPage onSuccess={handleLoginSuccess} />
            }
          ]
        },
        {
          path: PATHS.STUDENT.LOGIN,
          element: <AuthLayout />,
          children: [
            {
              index: true,
              element: <LoginPage onSuccess={handleLoginSuccess} />
            }
          ]
        },
        {
          path: PATHS.STUDENT.REGISTER,
          element: <AuthLayout />,
          children: [
            {
              index: true,
              element: <RegisterPage />
            }
          ]
        },
        {
          path: PATHS.FORGOT_PASSWORD,
          element: <ForgotPasswordPage />
        }
      ]
    },
    {
      element: <PrivateRoute allowedRole={Role.STUDENT} />,
      children: [
        {
          element: <StudentLayoutWrapper />,
          children: [
            {
              path: PATHS.PROFILE,
              element: <ProfilePage />
            }
          ]
        }
      ]
    },
    {
      element: <PrivateRoute allowedRole={Role.LECTURER} redirectPath={PATHS.LECTURER.LOGIN} />,
      children: [
        {
          element: <LecturerLayoutWrapper />,
          children: [
            {
              path: PATHS.LECTURER.DASHBOARD,
              element: <LecturerDashboardPage />
            },
            {
              path: PATHS.LECTURER.RESEARCH_GROUPS,
              element: <LecturerResearchGroupPage />
            },
            {
              path: PATHS.LECTURER.ADD_RESEARCH_GROUP,
              element: <LecturerAddResearchGroupPage />
            },
            {
              path: PATHS.LECTURER.EDIT_RESEARCH_GROUP,
              element: <LecturerUpdateResearchGroupPage />
            },
            {
              path: PATHS.LECTURER.RESEARCH_GROUP_DETAIL,
              element: <LecturerResearchGroupDetailPage />
            },
            {
              path: PATHS.LECTURER.BOOKINGS,
              element: <LecturerSchedulePage />
            },
            {
              path: PATHS.LECTURER.BOOKING_DETAIL,
              element: <BookingDetailPage />
            },
            {
              path: PATHS.LECTURER.JOIN_REQUESTS,
              element: <LecturerJoinRequestPage />
            },
            {
              path: PATHS.LECTURER.JOIN_REQUEST_DETAIL,
              element: <LecturerJoinRequestDetailPage />
            },
            {
              path: PATHS.LECTURER.BOOKING_HISTORY,
              element: <LecturerBookingHistoryPage />
            },
            {
              path: PATHS.LECTURER.PROFILE,
              element: <LecturerProfilePage />
            }
          ]
        }
      ]
    },
    // Admin private routes - only for ADMIN role
    {
      element: <PrivateRoute allowedRole={Role.ADMIN} redirectPath={PATHS.LECTURER.LOGIN} />,
      children: [
        {
          element: <AdminLayoutWrapper />,
          children: [
            {
              path: PATHS.ADMIN.DASHBOARD,
              element: <AdminDashboardPage />
            },
            {
              path: PATHS.ADMIN.REGISTRATION_SCHEDULE,
              element: <AdminRegistrationSchedulePage />
            },
            {
              path: PATHS.ADMIN.SLOT_BOOKING_DETAIL,
              element: <AdminSlotBookingDetailPage />
            },
            {
              path: PATHS.ADMIN.LAB_SLOTS,
              element: <AdminSlotsPage />
            },
            {
              path: PATHS.ADMIN.LAB_ROOMS,
              element: <AdminLabRoomsPage />
            },
            {
              path: PATHS.ADMIN.ADD_LAB_ROOM,
              element: <AdminAddLabRoomPage />
            },
            {
              path: PATHS.ADMIN.EDIT_LAB_ROOM,
              element: <AdminEditLabRoomPage />
            },
            {
              path: PATHS.ADMIN.DEVICES,
              element: <AdminDevicesPage />
            },
            {
              path: PATHS.ADMIN.RESEARCH_GROUPS,
              element: <AdminResearchGroupsPage />
            },
            {
              path: PATHS.ADMIN.ADD_RESEARCH_GROUP,
              element: <AdminAddResearchGroupPage />
            },
            {
              path: PATHS.ADMIN.EDIT_RESEARCH_GROUP,
              element: <AdminUpdateResearchGroupPage />
            },
            {
              path: PATHS.ADMIN.RESEARCH_GROUP_DETAIL,
              element: <AdminResearchGroupDetailPage />
            },
            {
              path: PATHS.ADMIN.ACCOUNTS,
              element: <AdminAccountListPage />
            },
            {
              path: PATHS.ADMIN.ACCOUNTS + '/create',
              element: <AdminCreateAccountPage />
            },
            {
              path: PATHS.ADMIN.ACCOUNTS + '/:username',
              element: <AdminAccountDetailPage />
            },
            {
              path: PATHS.ADMIN.APPROVALS.RESEARCH_GROUPS,
              element: <AdminApprovalResearchGroupsPage />
            },
            {
              path: PATHS.ADMIN.APPROVALS.JOIN_REQUEST_DETAIL,
              element: <AdminJoinRequestDetailPage />
            },
            {
              path: PATHS.ADMIN.APPROVALS.LAB_BOOKINGS,
              element: <AdminApprovalLabBookingsPage />
            },
            {
              path: PATHS.ADMIN.APPROVALS.BOOKING_DETAIL,
              element: <AdminBookingDetailPage />
            },
            {
              path: PATHS.ADMIN.STATISTICS.RESEARCH_GROUPS,
              element: <AdminReportResearchGroupsPage />
            },
            {
              path: PATHS.ADMIN.STATISTICS.LAB_BOOKINGS,
              element: <AdminReportLabBookingsPage />
            },
            {
              path: PATHS.ADMIN.STATISTICS.ROOM_SLOT,
              element: <AdminRoomSlotReportPage />
            },
            {
              path: PATHS.ADMIN.SYSTEM_CONFIG,
              element: <AdminSystemConfigPage />
            }
          ]
        }
      ]
    },
    // Lab Manager private routes - only for LAB_MANAGER role
    {
      element: <PrivateRoute allowedRole={Role.LAB_MANAGER} redirectPath={PATHS.LECTURER.LOGIN} />,
      children: [
        {
          element: <LabManagerLayoutWrapper />,
          children: [
            {
              path: PATHS.LAB_MANAGER.DASHBOARD,
              element: <LabManagerDashboardPage />
            }
          ]
        }
      ]
    },
    // Fallback
    {
      path: '*',
      element: <Navigate to={PATHS.HOME} replace />
    }
  ])

  return element
}

export default AppRoutes
